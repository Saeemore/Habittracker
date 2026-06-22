import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Zap, BarChart2, Minimize2, CalendarClock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiFetch } from '../api';
import { buildChatUserContext, fetchChatUserContext } from '../chatContext';

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface AIChatProps {
  isDarkMode: boolean;
}

export default function AIChat({ isDarkMode }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "Hi! I'm Trackify AI — your **personalized** habit coach. I know your habits, schedule preferences, and streaks. Ask me to fit a new habit into a busy day, protect a streak, or analyze your progress!",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [habitCount, setHabitCount] = useState(() => buildChatUserContext().habits.length);
  const bottomRef = useRef<HTMLDivElement>(null);

  const BG    = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const CARD  = isDarkMode ? 'bg-[#161616] border-white/8' : 'bg-white border-gray-100';
  const TXT   = isDarkMode ? 'text-white' : 'text-gray-900';
  const MUTED = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const INPUT = isDarkMode
    ? 'bg-[#1e1e1e] border-white/10 text-white placeholder-gray-600'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    fetchChatUserContext()
      .then((context) => setHabitCount(context.habits.length))
      .catch(() => setHabitCount(buildChatUserContext().habits.length));
  }, [isOpen, messages.length]);

  const buildPayload = async (message?: string) => {
    const context = await fetchChatUserContext();
    setHabitCount(context.habits.length);
    return {
      message,
      habits: context.habits,
      profile: context.profile,
      username: context.username,
      todayProgress: context.todayProgress,
      localTime: context.localTime,
      dayOfWeek: context.dayOfWeek,
    };
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await apiFetch<{ reply: string }>('/chat', {
        method: 'POST',
        body: JSON.stringify(await buildPayload(text)),
      });
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.reply || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Sorry, I am having trouble connecting. Please try again! 🔄',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMotivate = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{ reply: string }>('/chat/motivate', {
        method: 'POST',
        body: JSON.stringify(await buildPayload()),
      });
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.reply,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Could not fetch motivation. Try again! 🔄',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{ reply: string }>('/chat/analyze', {
        method: 'POST',
        body: JSON.stringify(await buildPayload()),
      });
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.reply,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Could not analyze habits. Try again! 🔄',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[60] md:bottom-6 md:right-6">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.section
            key="chat-panel"
            role="dialog"
            aria-label="Trackify AI chat"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className={`pointer-events-auto flex h-[min(600px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border shadow-2xl ${BG} ${CARD}`}
          >

      {/* Header */}
      <div className={`flex items-center gap-3 px-5 py-4 border-b ${CARD}`}>
        <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <Bot size={20} className="text-green-500" />
        </div>
        <div>
          <h1 className={`text-base font-black ${TXT}`}>Trackify AI</h1>
          <p className={`text-xs ${MUTED}`}>
            {habitCount > 0
              ? `Coaching you on ${habitCount} habit${habitCount === 1 ? '' : 's'}`
              : 'Add habits to unlock personalized coaching'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className={`hidden text-xs font-medium sm:inline ${MUTED}`}>Online</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Minimize chatbot"
            title="Minimize chatbot"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
              isDarkMode ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Minimize2 size={17} />
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className={`flex flex-wrap gap-2 px-4 py-3 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
        <button onClick={handleMotivate}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
            ${isDarkMode ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
          <Sparkles size={11} />
          Motivate me
        </button>
        <button onClick={() => sendMessage("Help me fit a new habit into my busy schedule. Use my existing habits and preferred times to suggest specific time blocks and a streak-protection plan.")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
            ${isDarkMode ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
          <CalendarClock size={11} />
          Fit my schedule
        </button>
        <button onClick={handleAnalyze}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
            ${isDarkMode ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
          <BarChart2 size={11} />
          Analyze habits
        </button>
        <button onClick={() => sendMessage("Which of my habits are at streak risk today, and what personalized steps should I take right now to protect them?")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
            ${isDarkMode ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}>
          <Zap size={11} />
          Save my streak
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ minHeight: 0 }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                ${msg.role === 'ai'
                  ? 'bg-green-500/10 border border-green-500/20'
                  : isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                {msg.role === 'ai'
                  ? <Bot size={14} className="text-green-500" />
                  : <User size={14} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'ai'
                  ? isDarkMode
                    ? 'bg-[#1c1c1c] border border-white/5 text-gray-200'
                    : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
                  : 'bg-green-500 text-white'}`}>
                  {msg.role === 'ai' ? (
                    <ReactMarkdown
                       components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                      }}
                    > 
                {msg.text}
                </ReactMarkdown>
                  ) : (
                    msg.text
                  )}  
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Bot size={14} className="text-green-500" />
            </div>
            <div className={`px-4 py-3 rounded-2xl ${isDarkMode ? 'bg-[#1c1c1c] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`px-4 py-4 border-t sticky bottom-0 ${isDarkMode ? 'border-white/5 bg-[#0a0a0a]' : 'border-gray-100 bg-white'}`}>
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about your schedule, streaks, or habits..."
            className={`flex-1 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-green-500 transition-colors ${INPUT}`}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors">
            <Send size={16} />
          </motion.button>
        </div>
      </div>
          </motion.section>
        ) : (
          <motion.button
            key="chat-launcher"
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Trackify AI chatbot"
            title="Open Trackify AI"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full border border-green-300/40 bg-green-500 text-white shadow-[0_12px_35px_rgba(34,197,94,0.4)] transition-colors hover:bg-green-400 md:h-16 md:w-16"
          >
            <Bot size={27} />
            <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
