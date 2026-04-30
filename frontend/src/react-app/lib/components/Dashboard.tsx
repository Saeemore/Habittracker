import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Home, CheckCircle, BarChart2, User, Brain, TrendingUp, Trophy, X, CalendarDays, Activity, Eye } from 'lucide-react';

interface DashboardProps {
  isDarkMode: boolean;
  setActiveSection: (section: string) => void;
}

const HERO_PICKS = [
  { id: '1', label: 'ZEN ZONE', title: '5-min Morning Calm', icon: '🧘', lightGrad: 'from-amber-50 to-yellow-100', darkBg: 'bg-amber-950/40', lightBorder: 'border-yellow-200', darkBorder: 'border-yellow-800/60', labelColor: 'text-yellow-500' },
  { id: '2', label: 'BOOK WORM', title: 'Atomic Habits: Ch. 4', icon: '📖', lightGrad: 'from-violet-50 to-purple-100', darkBg: 'bg-violet-950/40', lightBorder: 'border-purple-200', darkBorder: 'border-purple-800/60', labelColor: 'text-purple-500' },
  { id: '3', label: 'EARLY BIRD', title: 'Sleep by 10:00 PM', icon: '🌙', lightGrad: 'from-sky-50 to-cyan-100', darkBg: 'bg-sky-950/40', lightBorder: 'border-cyan-200', darkBorder: 'border-cyan-800/60', labelColor: 'text-cyan-500' },
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEK_PROGRESS = [true, true, true, true, true, false, false];

type DashboardHabit = {
  id: string;
  name: string;
  category: string;
  target: string;
  time: string;
  streak: number;
  completedToday: boolean;
};

const HABITS_STORAGE_KEY = 'trackify:habits';

const DEFAULT_HABITS: DashboardHabit[] = [
  { id: 'reading', name: 'Reading', category: 'Learning', target: '30 mins', time: '08:00 PM', streak: 14, completedToday: true },
  { id: 'meditation', name: 'Morning Meditation', category: 'Wellness', target: '10 mins', time: '06:30 AM', streak: 7, completedToday: true },
  { id: 'workout', name: 'Workout', category: 'Fitness', target: '45 mins', time: '07:00 AM', streak: 5, completedToday: false },
  { id: 'journal', name: 'Journaling', category: 'Mindfulness', target: '1 page', time: '09:30 PM', streak: 3, completedToday: false },
];

function loadDashboardHabits(): DashboardHabit[] {
  try {
    const stored = localStorage.getItem(HABITS_STORAGE_KEY);
    if (!stored) return DEFAULT_HABITS;

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_HABITS;

    return parsed.map((habit) => ({
      id: String(habit.id),
      name: String(habit.name || 'Untitled Habit'),
      category: String(habit.category || 'Other'),
      target: String(habit.endGoal || habit.target || 'Daily goal'),
      time: String(habit.targetTime || habit.time || 'Any time'),
      streak: Number(habit.streak || 0),
      completedToday: Boolean(habit.completed),
    }));
  } catch {
    return DEFAULT_HABITS;
  }
}

const MONTH_PROGRESS = [100, 75, 100, 50, 75, 100, 25, 75, 100, 100, 50, 75, 75, 100, 50, 25, 75, 100, 75, 50, 100, 75, 0, 50, 75, 100, 100, 50, 75, 100];
const MONTH_DAYS = Array.from({ length: 30 }, (_, index) => index + 1);

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'habits', icon: CheckCircle, label: 'Habits' },
  { id: 'stats', icon: BarChart2, label: 'Stats' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function Dashboard({ isDarkMode, setActiveSection }: DashboardProps) {
  const username = localStorage.getItem('username') || 'User';
  const [bannerVisible, setBannerVisible] = useState(true);
  const [activeNav, setActiveNav] = useState('home');
  const [dashboardHabits, setDashboardHabits] = useState<DashboardHabit[]>(loadDashboardHabits);
  const [checkedHabits, setCheckedHabits] = useState<Record<string, boolean>>(
    () => Object.fromEntries(loadDashboardHabits().map(habit => [habit.id, habit.completedToday]))
  );

  useEffect(() => {
    const habits = loadDashboardHabits();
    setDashboardHabits(habits);
    setCheckedHabits(Object.fromEntries(habits.map(habit => [habit.id, habit.completedToday])));
  }, []);

  const toggleDashboardHabit = (id: string) => {
    setCheckedHabits(prev => {
      const next = { ...prev, [id]: !prev[id] };
      const syncedHabits = dashboardHabits.map(habit => ({
        id: habit.id,
        name: habit.name,
        endGoal: habit.target,
        targetTime: habit.time,
        completed: Boolean(next[habit.id]),
        category: habit.category,
        streak: habit.streak,
      }));
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(syncedHabits));
      return next;
    });
  };

  const level = 12, currentXP = 1200, maxXP = 1500, streakDays = 15;
  const xpPercent = (currentXP / maxXP) * 100;
  const completedDays = WEEK_PROGRESS.filter(Boolean).length;
  const progressPercent = Math.round((completedDays / 7) * 100);
  const completedToday = Object.values(checkedHabits).filter(Boolean).length;
  const todayProgress = Math.round((completedToday / dashboardHabits.length) * 100);
  const monthlyAverage = Math.round(MONTH_PROGRESS.reduce((sum, value) => sum + value, 0) / MONTH_PROGRESS.length);
  const previousWeekAverage = Math.round(MONTH_PROGRESS.slice(15, 22).reduce((sum, value) => sum + value, 0) / 7);
  const currentWeekAverage = Math.round(MONTH_PROGRESS.slice(23).reduce((sum, value) => sum + value, 0) / 7);
  const consistencyTrend = currentWeekAverage - previousWeekAverage;
  const missedHabits = dashboardHabits.filter(habit => !checkedHabits[habit.id]);
  const topMissedHabit = missedHabits[0];
  const aiAdvice = topMissedHabit
    ? `I noticed ${topMissedHabit.name} is still open. Finish this one today to protect your consistency.`
    : 'I see every habit marked today. Keep tomorrow light, but do not break the chain.';

  // ── theme tokens ──────────────────────────────────────────────────────────
  const bg = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-100';
  const card = isDarkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-gray-100';
  const inner = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const txt = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  return (
    <div className={`flex h-screen overflow-hidden ${bg} transition-colors duration-300`}>

      {/* ── Sidebar ───────────────────────────────────────────────────────────── */}
      {/* <aside className={`hidden md:flex flex-col h-full w-[72px] xl:w-64 border-r flex-shrink-0 transition-all duration-300 ${sidebar}`}>
        <div className={`flex items-center gap-3 px-4 xl:px-5 py-5 border-b ${divider}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
            <Zap size={17} className="text-white fill-white" />
          </div>
          <span className={`hidden xl:block font-black text-lg tracking-tight ${txt}`}>HabitHero</span>
        </div>

        <nav className="flex flex-col gap-1 p-2 xl:p-3 flex-1">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const active = activeNav === id;
            return (
              <button key={id}
                onClick={() => { setActiveNav(id); if (id !== 'home') setActiveSection(id); }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl w-full transition-all duration-200
                  ${active ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : `${muted} ${hov}`}`}>
                <Icon size={19} className="flex-shrink-0" />
                <span className={`hidden xl:block text-sm font-semibold ${active ? 'text-white' : ''}`}>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className={`p-2 xl:p-3 border-t ${divider}`}>
          <div className={`flex items-center gap-3 p-2 rounded-xl ${hov} cursor-pointer transition-colors`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
              {username[0]?.toUpperCase()}
            </div>
            <div className="hidden xl:block min-w-0">
              <p className={`text-xs font-bold truncate ${txt}`}>{username}</p>
              <p className={`text-[10px] ${muted}`}>Level {level}</p>
            </div>
          </div>
        </div>
      </aside> */}

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        <div className="p-6 md:p-8 xl:p-10 pb-28 md:pb-10">

          {/* ── Level / XP header ─────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between mb-6 border rounded-2xl px-6 py-5 ${card}`}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="md:hidden w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                {username[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-xl leading-tight ${txt}`}>Level {level}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className={`flex-1 max-w-sm h-3 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
                  </div>
                  <span className={`text-sm flex-shrink-0 font-semibold ${muted}`}>{currentXP} / {maxXP} XP</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-orange-500 text-white rounded-full px-5 py-2.5 ml-4 flex-shrink-0 shadow-lg shadow-orange-500/20">
              <Flame size={22} className="fill-white" />
              <span className="font-black text-xl">{streakDays}</span>
            </div>
          </motion.div>

          {/* ── AI Motivator banner ────────────────────────────────────────── */}
          <AnimatePresence>
            {bannerVisible && (
              <motion.div key="banner"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="relative mb-6 rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#0a120a 0%,#0f2010 60%,#0a120a 100%)' }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 80% 50%,rgba(34,197,94,0.12) 0%,transparent 65%)' }} />
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 p-6 xl:p-7">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-xs font-black tracking-widest text-green-400 bg-green-400/10 border border-green-500/30 px-3 py-1 rounded-full mb-3">
                      AI MOTIVATOR
                    </span>
                    <p className="text-white text-base font-medium leading-snug">
                      "Arre yaar! 🗣️ You missed your meditation. Is this how you fulfill your dreams?{' '}
                      <span className="text-green-400 font-black">SHARAM KARO!"</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button onClick={() => setActiveSection('habits')}
                      className="bg-green-500 hover:bg-green-400 text-white text-sm font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap shadow-lg shadow-green-500/20">
                      Fix it now
                    </button>
                    <button onClick={() => setBannerVisible(false)}
                      className="bg-white/10 hover:bg-white/15 text-white text-sm font-semibold py-3 px-5 rounded-xl transition-colors whitespace-nowrap">
                      Maybe later
                    </button>
                    <button onClick={() => setBannerVisible(false)} className="text-white/30 hover:text-white/60 transition-colors p-1.5">
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none">
                  <Brain size={120} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          ── Two-column layout on lg+, single column on mobile ───────────
         

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch mt-6">

            <div className={`xl:col-span-2 border rounded-2xl p-6 ${card}`}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className={`text-xl font-black ${txt}`}>Today's Habit Checklist</h2>
                  <p className={`text-sm mt-1 ${muted}`}>{completedToday}/{dashboardHabits.length} created habits marked</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={22} className="text-green-500" />
                </div>
              </div>

              <div className={`h-3 rounded-full overflow-hidden mb-5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                <motion.div
                  animate={{ width: `${todayProgress}%` }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                />
              </div>

              <div className="space-y-3">
                {dashboardHabits.map((habit, index) => {
                  const done = checkedHabits[habit.id];
                  return (
                    <motion.button
                      key={habit.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.28 + index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleDashboardHabit(habit.id)}
                      className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200
                        ${done
                          ? isDarkMode ? 'bg-green-500/10 border-green-500/25' : 'bg-green-50 border-green-200'
                          : isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                    >
                      <span className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors
                        ${done ? 'bg-green-500 border-green-500 text-white' : isDarkMode ? 'border-white/15' : 'border-gray-300'}`}>
                        {done && <CheckCircle size={16} />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={`block text-sm font-black truncate ${done ? 'text-green-500' : txt}`}>{habit.name}</span>
                        <span className={`block text-xs mt-0.5 ${muted}`}>{habit.category} - {habit.target} - {habit.time}</span>
                      </span>
                      <span className="flex items-center gap-1 text-orange-500 text-xs font-black flex-shrink-0">
                        <Flame size={13} className="fill-orange-500" />
                        {habit.streak}d
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className={`xl:col-span-3 border rounded-2xl p-6 ${card}`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={20} className="text-green-500" />
                    <h2 className={`text-xl font-black ${txt}`}>Monthly Consistency</h2>
                  </div>
                  <p className={`text-sm mt-1 ${muted}`}>Ups, downs, and daily completion for this month</p>
                </div>
                <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                  {[
                    { label: 'Average', value: `${monthlyAverage}%` },
                    { label: 'This Week', value: `${currentWeekAverage}%` },
                    { label: 'Trend', value: `${consistencyTrend >= 0 ? '+' : ''}${consistencyTrend}%` },
                  ].map(stat => (
                    <div key={stat.label} className={`rounded-xl px-4 py-3 ${inner}`}>
                      <p className={`text-[10px] font-black tracking-widest ${muted}`}>{stat.label}</p>
                      <p className={`text-lg font-black ${stat.label === 'Trend' ? consistencyTrend >= 0 ? 'text-green-500' : 'text-orange-500' : txt}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {MONTH_DAYS.map(day => {
                      const value = day === 23 ? todayProgress : MONTH_PROGRESS[day - 1];
                      const cellTone = value >= 90
                        ? 'bg-green-500 text-white shadow-md shadow-green-500/25'
                        : value >= 70
                          ? isDarkMode ? 'bg-green-500/35 text-green-100' : 'bg-green-200 text-green-800'
                          : value >= 40
                            ? isDarkMode ? 'bg-amber-500/25 text-amber-100' : 'bg-amber-100 text-amber-700'
                            : value > 0
                              ? isDarkMode ? 'bg-orange-500/20 text-orange-100' : 'bg-orange-100 text-orange-700'
                              : isDarkMode ? 'bg-white/5 text-gray-600' : 'bg-gray-100 text-gray-400';

                      return (
                        <motion.div
                          key={day}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + day * 0.01 }}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center ${cellTone}`}
                        >
                          <span className="text-xs font-black">{day}</span>
                          <span className="text-[9px] font-bold opacity-80">{value}%</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-2 flex flex-col">
                  <div className={`rounded-xl p-4 flex-1 ${inner}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <Activity size={18} className="text-green-500" />
                      <h3 className={`text-sm font-black ${txt}`}>Progress Graph</h3>
                    </div>
                    <div className="h-40 flex items-end gap-1.5">
                      {MONTH_PROGRESS.slice(15).map((value, index) => {
                        const graphValue = index === 7 ? todayProgress : value;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(graphValue, 6)}%` }}
                              transition={{ delay: 0.32 + index * 0.03, duration: 0.45 }}
                              className={`w-full rounded-t-md ${graphValue >= 70 ? 'bg-green-500' : graphValue >= 40 ? 'bg-amber-400' : 'bg-orange-400'}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className={`text-xs leading-relaxed mt-4 ${muted}`}>
                      {consistencyTrend >= 0
                        ? `You are up ${consistencyTrend}% from last week. Keep protecting the routines that are already working.`
                        : `You dipped ${Math.abs(consistencyTrend)}% from last week. The missed days are visible, but today's checklist can turn the line back up.`}
                    </p>
                    <div className={`mt-4 rounded-xl border p-4 ${isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-100'}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/25">
                          <Eye size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black tracking-widest text-green-500 mb-1">AI WATCH</p>
                          <p className={`text-xs font-bold leading-relaxed ${txt}`}>{aiAdvice}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl border ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-gray-900 border-gray-800'}`}>
          {NAV_ITEMS.map(({ id, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button key={id}
                onClick={() => { setActiveNav(id); if (id !== 'home') setActiveSection(id); }}
                className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200
                  ${active ? 'bg-green-500 shadow-lg shadow-green-500/40' : 'text-gray-500 hover:bg-white/10'}`}>
                <Icon size={24} className={active ? 'text-white' : ''} />
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
