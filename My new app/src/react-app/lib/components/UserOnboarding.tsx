import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Target, Zap, AlertCircle, Clock, Flame, Star, FileText, ArrowRight, Check
} from 'lucide-react';

interface UserOnboardingProps {
  onComplete: () => void;
  isDarkMode?: boolean;
}

// ── Design tokens — identical to Dashboard / HabitsSection ───────────────────
const tokens = (dark: boolean) => ({
  BG: dark ? 'bg-[#0a0a0a]' : 'bg-gray-100',
  CARD: dark ? 'bg-[#161616] border-white/5' : 'bg-white border-gray-100',
  INNER: dark ? 'bg-[#1e1e1e] border-white/5' : 'bg-gray-50 border-gray-200',
  TXT: dark ? 'text-white' : 'text-gray-900',
  MUTED: dark ? 'text-gray-500' : 'text-gray-500',
  INPUT: dark
    ? 'bg-[#1e1e1e] border-white/10 text-white placeholder-gray-600 focus:border-green-500'
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500',
  CHIP_OFF: dark ? 'bg-white/5 text-gray-400 border-white/8 hover:bg-white/10' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
  CHIP_ON: 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/25',
});

// ── Step definitions ──────────────────────────────────────────────────────────
const GOAL_OPTIONS = [
  { id: 'health', label: 'Health & Fitness', emoji: '💪' },
  { id: 'career', label: 'Career Growth', emoji: '🚀' },
  { id: 'mental', label: 'Mental Wellness', emoji: '🧠' },
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'relationships', label: 'Relationships', emoji: '❤️' },
  { id: 'financial', label: 'Financial', emoji: '💰' },
];

const CONSISTENCY_OPTIONS = [
  { id: 'beginner', label: 'Just starting out' },
  { id: 'somewhat', label: 'Somewhat consistent' },
  { id: 'pretty', label: 'Pretty consistent' },
  { id: 'disciplined', label: 'Very disciplined' },
];

const BLOCKER_OPTIONS = [
  'Lack of motivation', 'Forgetting', 'No time', 'Overwhelmed', 'Procrastination', 'Distractions',
];

const DURATION_OPTIONS = [
  { id: '30', label: '30 Days', emoji: '🌱' },
  { id: '60', label: '60 Days', emoji: '🌿' },
  { id: '90', label: '90 Days', emoji: '🌳' },
  { id: 'ongoing', label: 'Ongoing', emoji: '♾️' },
];

const SLEEP_OPTIONS = [
  { id: 'early', label: 'Early Bird 🌅', sub: 'Up before 7am' },
  { id: 'night', label: 'Night Owl 🦉', sub: 'Active after 10pm' },
  { id: 'middle', label: 'In Between 🌤️', sub: 'Flexible schedule' },
];

// ── Per-step icon ─────────────────────────────────────────────────────────────
const STEP_ICONS = [Sun, Target, Zap, AlertCircle, Clock, Flame, Star, FileText];
const STEP_TITLES = [
  'Are you a morning person?',
  "What's your #1 goal right now?",
  'How consistent are you currently?',
  'What gets in your way?',
  'Best time for habit reminders?',
  'How long do you want to build habits?',
  'Rate your current lifestyle',
  'Anything specific to focus on?',
];
const STEP_SUBTITLES = [
  'This helps us schedule your habits at the right time',
  'We\'ll personalise your habit plan around this',
  'Honest answers help us set achievable targets',
  'Select all that apply — we\'ll help you overcome them',
  'We\'ll send smart nudges to keep you on track',
  'Short sprints or long game — you decide',
  '1 = needs work · 5 = loving life',
  'Optional — skip if you\'re good to go!',
];

// ── Default answer state ─────────────────────────────────────────────────────
const defaultAnswers = () => ({
  sleepType: '',
  goal: '',
  consistency: '',
  blockers: [] as string[],
  reminderTime: '08:00',
  duration: '',
  lifestyleRating: 0,
  focusNote: '',
});

export default function UserOnboarding({ onComplete, isDarkMode = false }: UserOnboardingProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(defaultAnswers());
  const t = tokens(isDarkMode);
  const totalSteps = STEP_TITLES.length;
  const StepIcon = STEP_ICONS[step];

  // ── Navigation ───────────────────────────────────────────────────────────────
  const canNext = (): boolean => {
    if (step === 0) return !!answers.sleepType;
    if (step === 1) return !!answers.goal;
    if (step === 2) return !!answers.consistency;
    if (step === 3) return answers.blockers.length > 0;
    if (step === 4) return !!answers.reminderTime;
    if (step === 5) return !!answers.duration;
    if (step === 6) return answers.lifestyleRating > 0;
    return true; // step 7 is optional
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      localStorage.setItem('onboardingComplete', 'true');
      localStorage.setItem('onboardingData', JSON.stringify(answers));
      onComplete();
    }
  };

  const handleBack = () => setStep(s => s - 1);

  const toggleBlocker = (b: string) =>
    setAnswers(a => ({
      ...a,
      blockers: a.blockers.includes(b) ? a.blockers.filter(x => x !== b) : [...a.blockers, b],
    }));

  // ── Step body renderer ────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // Step 0 — Sleep type
      case 0:
        return (
          <div className="flex flex-col gap-3">
            {SLEEP_OPTIONS.map(opt => (
              <motion.button
                key={opt.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAnswers(a => ({ ...a, sleepType: opt.id }))}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl border text-left transition-all duration-200
                  ${answers.sleepType === opt.id ? t.CHIP_ON : t.CHIP_OFF}`}
              >
                <div>
                  <p className="font-black text-sm">{opt.label}</p>
                  <p className={`text-xs mt-0.5 ${answers.sleepType === opt.id ? 'text-white/70' : t.MUTED}`}>{opt.sub}</p>
                </div>
                {answers.sleepType === opt.id && <Check size={18} className="text-white flex-shrink-0" />}
              </motion.button>
            ))}
          </div>
        );

      // Step 1 — Goal
      case 1:
        return (
          <div className="grid grid-cols-2 gap-3">
            {GOAL_OPTIONS.map(opt => (
              <motion.button
                key={opt.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setAnswers(a => ({ ...a, goal: opt.id }))}
                className={`flex flex-col items-start gap-2 px-4 py-4 rounded-2xl border text-left transition-all duration-200
                  ${answers.goal === opt.id ? t.CHIP_ON : t.CHIP_OFF}`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className={`text-xs font-black ${answers.goal === opt.id ? 'text-white' : ''}`}>{opt.label}</span>
              </motion.button>
            ))}
          </div>
        );

      // Step 2 — Consistency
      case 2:
        return (
          <div className="flex flex-col gap-3">
            {CONSISTENCY_OPTIONS.map((opt, i) => (
              <motion.button
                key={opt.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAnswers(a => ({ ...a, consistency: opt.id }))}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl border text-sm font-bold text-left transition-all duration-200
                  ${answers.consistency === opt.id ? t.CHIP_ON : t.CHIP_OFF}`}
              >
                <span>{opt.label}</span>
                <div className={`flex gap-1`}>
                  {Array.from({ length: i + 1 }).map((_, j) => (
                    <div key={j} className={`w-2 h-2 rounded-full ${answers.consistency === opt.id ? 'bg-white' : 'bg-green-500'}`} />
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        );

      // Step 3 — Blockers (multi-select)
      case 3:
        return (
          <div className="flex flex-wrap gap-2">
            {BLOCKER_OPTIONS.map(b => {
              const selected = answers.blockers.includes(b);
              return (
                <motion.button
                  key={b}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleBlocker(b)}
                  className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all duration-200
                    ${selected ? t.CHIP_ON : t.CHIP_OFF}`}
                >
                  {selected && <Check size={10} className="inline mr-1.5" />}
                  {b}
                </motion.button>
              );
            })}
          </div>
        );

      // Step 4 — Reminder time
      case 4:
        return (
          <div className="flex flex-col gap-4">
            <input
              type="time"
              value={answers.reminderTime}
              onChange={e => setAnswers(a => ({ ...a, reminderTime: e.target.value }))}
              className={`w-full px-5 py-4 border rounded-2xl focus:outline-none text-2xl font-black text-center transition-colors ${t.INPUT}`}
            />
            <p className={`text-xs text-center ${t.MUTED}`}>
              We'll send you a smart nudge at this time each day
            </p>
          </div>
        );

      // Step 5 — Duration
      case 5:
        return (
          <div className="grid grid-cols-2 gap-3">
            {DURATION_OPTIONS.map(opt => (
              <motion.button
                key={opt.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setAnswers(a => ({ ...a, duration: opt.id }))}
                className={`flex flex-col items-center gap-2 px-4 py-5 rounded-2xl border text-center transition-all duration-200
                  ${answers.duration === opt.id ? t.CHIP_ON : t.CHIP_OFF}`}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <span className={`text-sm font-black ${answers.duration === opt.id ? 'text-white' : ''}`}>{opt.label}</span>
              </motion.button>
            ))}
          </div>
        );

      // Step 6 — Lifestyle rating (stars)
      case 6:
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(n => (
                <motion.button
                  key={n}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAnswers(a => ({ ...a, lifestyleRating: n }))}
                  className="transition-colors"
                >
                  <Star
                    size={40}
                    className={n <= answers.lifestyleRating ? 'text-yellow-400 fill-yellow-400' : isDarkMode ? 'text-white/15' : 'text-gray-300'}
                  />
                </motion.button>
              ))}
            </div>
            {answers.lifestyleRating > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm font-bold ${t.MUTED}`}
              >
                {['', "Let's fix that together! 💪", 'Room to grow — we\'ve got this 🌱', 'Not bad — let\'s level up! ⚡', 'Nice! Keep the momentum 🔥', 'Absolutely crushing it! 🏆'][answers.lifestyleRating]}
              </motion.p>
            )}
          </div>
        );

      // Step 7 — Free text
      case 7:
        return (
          <div className="flex flex-col gap-3">
            <textarea
              rows={5}
              placeholder="e.g., I want to meditate daily, stop doom-scrolling, and sleep better..."
              value={answers.focusNote}
              onChange={e => setAnswers(a => ({ ...a, focusNote: e.target.value }))}
              className={`w-full px-5 py-4 border rounded-2xl focus:outline-none resize-none text-sm transition-colors ${t.INPUT}`}
            />
            <p className={`text-xs ${t.MUTED}`}>Optional — you can always update this in your profile settings.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${t.BG} transition-colors duration-300`}>

      {/* Subtle background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(34,197,94,0.06) 0%, transparent 60%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-8 relative z-10 ${t.CARD}`}
      >

        {/* ── Branding header ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <span className={`font-black text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Trackify</span>
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20`}>
            Setup · {step + 1}/{totalSteps}
          </span>
        </div>

        {/* ── Progress bar ────────────────────────────────────────────────── */}
        <div className="flex gap-1.5 mb-7">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ flex: i <= step ? 2 : 1 }}
              transition={{ duration: 0.35 }}
              className={`h-1 rounded-full transition-colors duration-300
                ${i <= step ? 'bg-green-500' : isDarkMode ? 'bg-white/8' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {/* ── Step icon + title ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-center gap-4 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                <StepIcon size={22} className="text-green-500" />
              </div>
              <div>
                <h2 className={`text-base font-black leading-snug ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {STEP_TITLES[step]}
                </h2>
                <p className={`text-xs mt-0.5 ${t.MUTED}`}>{STEP_SUBTITLES[step]}</p>
              </div>
            </div>

            {/* ── Step content ─────────────────────────────────────────────── */}
            <div className="mt-6">
              {renderStep()}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation buttons ───────────────────────────────────────────── */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-colors
                ${isDarkMode ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Back
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            disabled={!canNext()}
            className={`flex-1 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all
              ${canNext()
                ? 'bg-green-500 hover:bg-green-400 text-white shadow-lg shadow-green-500/25'
                : isDarkMode ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            {step === totalSteps - 1 ? (
              <>🚀 Get Started</>
            ) : (
              <>Next <ArrowRight size={15} /></>
            )}
          </motion.button>
        </div>

        {/* ── Skip on last step ───────────────────────────────────────────── */}
        {step === totalSteps - 1 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleNext}
            className={`w-full text-center text-xs mt-3 transition-colors ${t.MUTED} hover:text-green-500`}
          >
            Skip and go to dashboard →
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
