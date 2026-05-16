<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Clock, Target, Heart, Zap, X, Home, CheckCircle, BarChart2, User, Flame } from 'lucide-react';
import CelebrationModal from './CelebrationModal';
import { predictAllHabits } from '../api';

interface HabitsSectionProps {
  isDarkMode: boolean;
  setActiveSection?: (section: string) => void;
}

const CATEGORIES = ['Fitness', 'Wellness', 'Learning', 'Mindfulness', 'Productivity', 'Social', 'Other'];

const CAT: Record<string, { badge: string; darkBadge: string; dot: string }> = {
  Fitness: { badge: 'bg-rose-100 text-rose-600', darkBadge: 'bg-rose-500/20 text-rose-400', dot: 'bg-rose-400' },
  Wellness: { badge: 'bg-teal-100 text-teal-600', darkBadge: 'bg-teal-500/20 text-teal-400', dot: 'bg-teal-400' },
  Learning: { badge: 'bg-blue-100 text-blue-600', darkBadge: 'bg-blue-500/20 text-blue-400', dot: 'bg-blue-400' },
  Mindfulness: { badge: 'bg-purple-100 text-purple-600', darkBadge: 'bg-purple-500/20 text-purple-400', dot: 'bg-purple-400' },
  Productivity: { badge: 'bg-amber-100 text-amber-600', darkBadge: 'bg-amber-500/20 text-amber-400', dot: 'bg-amber-400' },
  Social: { badge: 'bg-cyan-100 text-cyan-600', darkBadge: 'bg-cyan-500/20 text-cyan-400', dot: 'bg-cyan-400' },
  Other: { badge: 'bg-gray-100 text-gray-600', darkBadge: 'bg-gray-500/20 text-gray-400', dot: 'bg-gray-400' },
};

const FORM_STEPS = [
  { title: 'What habit do you want to build?', subtitle: 'Be specific about what you want to do', field: 'name', icon: Target, placeholder: 'e.g., Morning Meditation, Daily Reading...' },
  { title: 'Why does this matter to you?', subtitle: 'Your reason will keep you motivated', field: 'why', icon: Heart, placeholder: 'e.g., To reduce stress and start my day clearly' },
  { title: 'What does success look like?', subtitle: 'Define your target clearly', field: 'endGoal', icon: Zap, placeholder: 'e.g., Meditate for 30 minutes every morning' },
  { title: 'Pick your category', subtitle: 'Helps you organize your habits', field: 'category', icon: Target, type: 'select' },
  { title: 'When will you do this?', subtitle: 'Choose the best time for you', field: 'targetTime', icon: Clock, type: 'time' },
];

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'habits', icon: CheckCircle, label: 'Habits' },
  { id: 'stats', icon: BarChart2, label: 'Stats' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function HabitsSection({ isDarkMode, setActiveSection }: HabitsSectionProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedHabit, setCelebratedHabit] = useState('');
  const [activeNav, setActiveNav] = useState('habits');
  const [activeFilter, setActiveFilter] = useState('All');
  const [formData, setFormData] = useState({ name: '', why: '', endGoal: '', targetTime: '', category: '' });

  const [habits, setHabits] = useState<
    { id: string; name: string; endGoal: string; targetTime: string; completed: boolean; category: string; streak: number }[]
  >([]);

<<<<<<< Updated upstream
  // ── NEW: predictions state ──────────────────────────────────────────────
  const [predictions, setPredictions] = useState<Record<string, any>>({});

  // ── NEW: save habits to localStorage whenever they change ───────────────
=======
  // ── NEW: predictions state ───────────────────────────────────────────────
  const [predictions, setPredictions] = useState<Record<string, any>>({});

  // ── NEW: fetch ML predictions whenever habits list changes ───────────────
>>>>>>> Stashed changes
  useEffect(() => {
    if (!habits.length) return;
    predictAllHabits(
      habits.map((h) => ({ habit_name: h.name, streak_count: h.streak ?? 0 }))
    )
      .then((results) => {
        const map: Record<string, any> = {};
        results.forEach((r: any) => { map[r.habit_name] = r; });
        setPredictions(map);
      })
      .catch(console.error);
  }, [habits]);

<<<<<<< Updated upstream
  // ── NEW: fetch ML predictions whenever habits list changes ──────────────
  useEffect(() => {
    if (!habits.length) return;
    predictAllHabits(
      habits.map((h) => ({ habit_name: h.name, streak_count: h.streak ?? 0 }))
    ).then((results) => {
      const map: Record<string, any> = {};
      results.forEach((r: any) => { map[r.habit_name] = r; });
      setPredictions(map);
    }).catch(console.error);
  }, [habits]);

=======
>>>>>>> Stashed changes
  const BG    = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-100';
  const CARD  = isDarkMode ? 'bg-[#161616] border-white/8' : 'bg-white border-gray-100';
  const HCARD = isDarkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-gray-100';
  const TXT   = isDarkMode ? 'text-white' : 'text-gray-900';
  const MUTED = isDarkMode ? 'text-gray-500' : 'text-gray-400';
  const HOV   = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50';
  const INPUT = isDarkMode
    ? 'bg-[#1e1e1e] border-white/10 text-white placeholder-gray-600 focus:border-green-500'
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500';

  const step     = FORM_STEPS[formStep];
  const StepIcon = step.icon;

  const filtered =
    activeFilter === 'All'     ? habits :
    activeFilter === 'Done'    ? habits.filter(h => h.completed) :
    activeFilter === 'Pending' ? habits.filter(h => !h.completed) :
    habits.filter(h => h.category === activeFilter);

  const handleNext = () => {
    if (formStep < FORM_STEPS.length - 1) {
      setFormStep(f => f + 1);
    } else {
      setHabits(prev => [...prev, {
        id: Date.now().toString(),
        name: formData.name,
        endGoal: formData.endGoal,
        targetTime: formData.targetTime,
        category: formData.category || 'Other',
        completed: false,
        streak: 0,
      }]);
      setShowCreateForm(false);
      setFormStep(0);
      setFormData({ name: '', why: '', endGoal: '', targetTime: '', category: '' });
    }
  };

  const toggleHabit = (id: string, name: string) => {
    const h = habits.find(h => h.id === id);
    if (h && !h.completed) { setCelebratedHabit(name); setShowCelebration(true); }
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  return (
    <div className={`flex h-screen overflow-hidden ${BG} transition-colors duration-300`}>

      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        habitName={celebratedHabit}
        isDarkMode={isDarkMode}
      />

      {/* ═══ MAIN ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        <div className="p-4 md:p-5 xl:p-6 pb-24 md:pb-6">

          {/* ── Page header ─────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between mb-5 border rounded-2xl px-5 py-4 ${CARD}`}>
            <div>
              <h1 className={`text-lg font-black ${TXT}`}>Your Habits</h1>
              <p className={`text-xs mt-0.5 ${MUTED}`}>Build yourself one habit at a time</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-20 h-1.5 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-700"
                    style={{ width: `${habits.length ? Math.round((habits.filter(h => h.completed).length / habits.length) * 100) : 0}%` }}
                  />
                </div>
                <span className={`text-xs font-black ${MUTED}`}>
                  {habits.filter(h => h.completed).length}/{habits.length}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-400 text-white text-sm font-black rounded-xl shadow-lg shadow-green-500/25 transition-colors">
                <Plus size={16} />
                New Habit
              </motion.button>
            </div>
          </motion.div>

          {/* ── Filter chips ─────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
            className="flex items-center gap-2 mb-5 flex-wrap">
            {['All', 'Done', 'Pending', ...CATEGORIES].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200
                  ${activeFilter === f
                    ? 'bg-green-500 text-white shadow-md shadow-green-500/25'
                    : isDarkMode
                      ? 'border border-white/10 text-gray-400 hover:bg-white/5'
                      : 'border border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                {f}
              </button>
            ))}
          </motion.div>

          {/* ── Habits grid ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((habit, index) => {
              const cat        = CAT[habit.category] || CAT['Other'];
              const prediction = predictions[habit.name];

              return (
                <motion.div key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                  className={`rounded-2xl border flex flex-col gap-0 overflow-hidden transition-all duration-200
                    ${habit.completed
                      ? isDarkMode
                        ? 'bg-green-500/10 border-green-500/25'
                        : 'bg-green-50 border-green-200'
                      : `${HCARD} ${isDarkMode ? 'hover:border-white/10' : 'hover:shadow-md'}`}`}>

                  {/* Card body */}
                  <div className="p-5 flex flex-col gap-3 flex-1">

                    {/* Category badge + dot */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-full
                        ${isDarkMode ? cat.darkBadge : cat.badge}`}>
                        {habit.category}
                      </span>
                      <div className={`w-2.5 h-2.5 rounded-full ${habit.completed ? 'bg-green-500' : cat.dot}`} />
                    </div>

<<<<<<< Updated upstream
                    {/* Name + AI prediction badge + goal */}
=======
                    {/* Name */}
>>>>>>> Stashed changes
                    <div>
                      <h3 className={`font-black text-base leading-snug ${habit.completed ? 'text-green-500' : TXT}`}>
                        {habit.name}
                      </h3>

<<<<<<< Updated upstream
                      {/* ── AI prediction badge ───────────────────────────────── */}
=======
                      {/* ── NEW: AI prediction badge ─────────────────────────── */}
>>>>>>> Stashed changes
                      {prediction && (
                        <span style={{
                          display: 'inline-block',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          marginTop: '5px',
                          marginBottom: '2px',
                          background:
                            prediction.risk_level === 'high'   ? '#FCEBEB' :
                            prediction.risk_level === 'medium' ? '#FAEEDA' : '#EAF3DE',
                          color:
                            prediction.risk_level === 'high'   ? '#A32D2D' :
                            prediction.risk_level === 'medium' ? '#854F0B' : '#3B6D11',
                        }}>
                          {Math.round(prediction.completion_probability * 100)}% chance today
                        </span>
                      )}

<<<<<<< Updated upstream
=======
                      {/* Goal text */}
>>>>>>> Stashed changes
                      <p className={`text-xs mt-0.5 ${MUTED}`}>{habit.endGoal}</p>
                    </div>

                    {/* Time + streak row */}
                    <div className={`flex items-center gap-2 text-xs ${MUTED}`}>
                      <Clock size={11} />
                      <span className="font-semibold">{habit.targetTime}</span>
                      <span>•</span>
                      <Flame size={11} className="text-orange-500" />
                      <span className="font-black text-orange-500">{habit.streak}d</span>
                    </div>
                  </div>

                  {/* CTA button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={() => toggleHabit(habit.id, habit.name)}
                    className={`w-full py-3.5 font-black text-sm flex items-center justify-center gap-2 transition-all duration-200
                      ${habit.completed
                        ? isDarkMode
                          ? 'bg-green-500/15 text-green-400 border-t border-green-500/20 hover:bg-green-500/25'
                          : 'bg-green-100 text-green-600 border-t border-green-200 hover:bg-green-200'
                        : 'bg-green-500 hover:bg-green-400 text-white'}`}>
                    {habit.completed
                      ? <><Check size={15} /> Completed Today</>
                      : 'Mark as Done'}
                  </motion.button>
                </motion.div>
              );
            })}

            {/* Empty state */}
            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`col-span-full border rounded-2xl p-12 text-center ${CARD}`}>
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Plus size={24} className="text-green-500" />
                </div>
                <p className={`text-base font-black mb-1 ${TXT}`}>No habits here</p>
                <p className={`text-sm ${MUTED} mb-4`}>Create your first habit to start building momentum.</p>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-white text-sm font-black rounded-xl shadow-lg shadow-green-500/25">
                  + New Habit
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MOBILE NAV ══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div className={`flex items-center gap-1 px-3 py-2 rounded-full shadow-2xl border
          ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-gray-900 border-gray-800'}`}>
          {NAV_ITEMS.map(({ id, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button key={id}
                onClick={() => { setActiveNav(id); if (id !== 'habits') setActiveSection?.(id); }}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200
                  ${active ? 'bg-green-500 shadow-lg shadow-green-500/40' : 'text-gray-500 hover:bg-white/10'}`}>
                <Icon size={19} className={active ? 'text-white' : ''} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ CREATE HABIT MODAL ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateForm(false)}>

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className={`relative rounded-3xl shadow-2xl p-7 max-w-md w-full border
                ${isDarkMode ? 'bg-[#111111] border-white/5' : 'bg-white border-gray-100'}`}>

              <button onClick={() => setShowCreateForm(false)}
                className={`absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center ${HOV} ${MUTED}`}>
                <X size={16} />
              </button>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                  <StepIcon size={22} className="text-green-500" />
                </div>
                <div>
                  <h2 className={`text-base font-black ${TXT}`}>Create New Habit</h2>
                  <p className={`text-xs ${MUTED}`}>Step {formStep + 1} of {FORM_STEPS.length}</p>
                </div>
              </div>

              {/* Progress segments */}
              <div className="flex gap-1.5 mb-6">
                {FORM_STEPS.map((_, i) => (
                  <div key={i}
                    className={`h-1 rounded-full transition-all duration-300
                      ${i <= formStep ? 'bg-green-500' : isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}
                    style={{ flex: i <= formStep ? 2 : 1 }} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={formStep}
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

                  <h3 className={`text-sm font-black mb-0.5 ${TXT}`}>{step.title}</h3>
                  <p className={`text-xs mb-4 ${MUTED}`}>{step.subtitle}</p>

                  {step.type === 'time' ? (
                    <input type="time"
                      value={formData[step.field as keyof typeof formData]}
                      onChange={e => setFormData({ ...formData, [step.field]: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none text-base transition-colors ${INPUT}`} />

                  ) : step.type === 'select' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map(cat => (
                        <motion.button key={cat}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all
                            ${formData.category === cat
                              ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                              : isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {cat}
                        </motion.button>
                      ))}
                    </div>

                  ) : (
                    <textarea
                      placeholder={step.placeholder}
                      value={formData[step.field as keyof typeof formData]}
                      onChange={e => setFormData({ ...formData, [step.field]: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none resize-none text-sm transition-colors ${INPUT}`} />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => formStep > 0 ? setFormStep(f => f - 1) : setShowCreateForm(false)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors
                    ${isDarkMode ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {formStep === 0 ? 'Cancel' : 'Back'}
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-white text-sm font-black rounded-xl shadow-lg shadow-green-500/25 transition-colors">
                  {formStep === FORM_STEPS.length - 1 ? 'Create Habit' : 'Next →'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
