import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, User, Sparkles, Zap, BarChart2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface Habit {
  name: string;
  category: string;
  streak: number;
  completed: boolean;
}

interface AIChatProps {
  isDarkMode: boolean;
  habits?: Habit[];
}

export default function AIChat({ isDarkMode, habits = [] }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "Hi! I'm Trackify AI 🌟 Your personal habit coach. Ask me anything about your habits, or tap a quick action below!",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, habits }),
      });
      const data = await res.json();
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
      const res = await fetch('/api/chat/motivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits }),
      });
      const data = await res.json();
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
      const res = await fetch('/api/chat/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits }),
      });
      const data = await res.json();
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
    <div className={`flex flex-col ${BG} transition-colors duration-300 rounded-2xl border ${CARD} overflow-hidden`} style={{ height: '550px' }}>

      {/* Header */}
      <div className={`flex items-center gap-3 px-5 py-4 border-b ${CARD}`}>
        <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <Bot size={20} className="text-green-500" />
        </div>
        <div>
          <h1 className={`text-base font-black ${TXT}`}>Trackify AI</h1>
          <p className={`text-xs ${MUTED}`}>Your personal habit coach</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className={`text-xs font-medium ${MUTED}`}>Online</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className={`flex gap-2 px-4 py-3 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
        <button onClick={handleMotivate}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
            ${isDarkMode ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
          <Sparkles size={11} />
          Motivate me
        </button>
        <button onClick={handleAnalyze}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
            ${isDarkMode ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
          <BarChart2 size={11} />
          Analyze habits
        </button>
        <button onClick={() => sendMessage("What are the best tips for building habits that stick?")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
            ${isDarkMode ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}>
          <Zap size={11} />
          Habit tips
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
            placeholder="Ask your habit coach..."
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
    </div>
  );
}