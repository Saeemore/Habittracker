import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Home, CheckCircle, BarChart2, User, Brain, X, CalendarDays, Activity, Eye } from 'lucide-react';
import { getDisplayUsername, loadStoredHabits, saveStoredHabits, type StoredHabit } from '../storage';

interface DashboardProps {
  isDarkMode: boolean;
  setActiveSection: (section: string) => void;
}

type DashboardHabit = {
  id: string;
  name: string;
  category: string;
  target: string;
  time: string;
  streak: number;
  completedToday: boolean;
};

const MONTHLY_PROGRESS_STORAGE_KEY = 'trackify:monthly-consistency';

function getUserStorageKey(baseKey: string, username: string) {
  const userKey = username.trim().toLowerCase() || 'user';
  return `${baseKey}:${encodeURIComponent(userKey)}`;
}

function loadDashboardHabits(): DashboardHabit[] {
  return loadStoredHabits().map((habit) => ({
    id: habit.id,
    name: habit.name,
    category: habit.category,
    target: habit.endGoal,
    time: habit.targetTime,
    streak: habit.streak,
    completedToday: habit.completed,
  }));
}

function loadMonthlyProgress(username: string, daysInMonth: number): number[] {
  try {
    const stored = localStorage.getItem(getUserStorageKey(MONTHLY_PROGRESS_STORAGE_KEY, username));
    const parsed = stored ? JSON.parse(stored) : [];
    const progress = Array.isArray(parsed) ? parsed : [];

    return Array.from({ length: daysInMonth }, (_, index) => {
      const value = Number(progress[index]);
      return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
    });
  } catch {
    return Array(daysInMonth).fill(0);
  }
}

const NAV_ITEMS = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'habits', icon: CheckCircle, label: 'Habits' },
  { id: 'progress', icon: BarChart2, label: 'Stats' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function Dashboard({ isDarkMode, setActiveSection }: DashboardProps) {
  const username = getDisplayUsername();
  const today = new Date();
  const monthDayCount = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const todayDay = today.getDate();
  const monthDays = Array.from({ length: monthDayCount }, (_, i) => i + 1);
  const userMonthlyProgressStorageKey = getUserStorageKey(MONTHLY_PROGRESS_STORAGE_KEY, username);

  const [bannerVisible, setBannerVisible] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [dashboardHabits, setDashboardHabits] = useState<DashboardHabit[]>(loadDashboardHabits);
  const [checkedHabits, setCheckedHabits] = useState<Record<string, boolean>>(
    () => Object.fromEntries(loadDashboardHabits().map(habit => [habit.id, habit.completedToday]))
  );
  const [monthProgress, setMonthProgress] = useState<number[]>(() => loadMonthlyProgress(username, monthDayCount));

  useEffect(() => {
    const habits = loadDashboardHabits();
    setDashboardHabits(habits);
    setCheckedHabits(Object.fromEntries(habits.map(habit => [habit.id, habit.completedToday])));
    setMonthProgress(loadMonthlyProgress(username, monthDayCount));
  }, [monthDayCount, username]);

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
      saveStoredHabits(syncedHabits as StoredHabit[]);
      return next;
    });
  };

  // const level = 12, currentXP = 1200, maxXP = 1500, streakDays = 15;
  // const xpPercent = (currentXP / maxXP) * 100;
  const completedToday = Object.values(checkedHabits).filter(Boolean).length;

const todayProgress = dashboardHabits.length
  ? Math.round((completedToday / dashboardHabits.length) * 100)
  : 0;

const activeMonthProgress = monthProgress.map((value, index) =>
  index === todayDay - 1 ? todayProgress : value
);

const monthlyAverage = activeMonthProgress.length
  ? Math.round(
      activeMonthProgress.reduce((sum, value) => sum + value, 0) /
      activeMonthProgress.length
    )
  : 0;

const previousWeekData = activeMonthProgress.slice(
  Math.max(0, todayDay - 15),
  Math.max(0, todayDay - 8)
);

const currentWeekData = activeMonthProgress.slice(
  Math.max(0, todayDay - 7),
  todayDay
);

const previousWeekAverage = previousWeekData.length
  ? Math.round(
      previousWeekData.reduce((sum, value) => sum + value, 0) /
      previousWeekData.length
    )
  : 0;

const currentWeekAverage = currentWeekData.length
  ? Math.round(
      currentWeekData.reduce((sum, value) => sum + value, 0) /
      currentWeekData.length
    )
  : 0;

const consistencyTrend = currentWeekAverage - previousWeekAverage;

/* =========================
   DYNAMIC LEVEL SYSTEM
   ========================= */

const streakDays = dashboardHabits.reduce(
  (max, habit) => Math.max(max, habit.streak || 0),
  0
);
const dangerHabit = dashboardHabits.find(
  habit => habit.streak >= 3 && !checkedHabits[habit.id]
);
const streakXP = dashboardHabits.reduce(
  (sum, habit) => sum + (habit.streak || 0) * 25,
  0
);

const completionXP = completedToday * 50;

const consistencyXP = monthlyAverage * 2;

const totalXP = streakXP + completionXP + consistencyXP;

const level = Math.max(
  1,
  Math.floor(totalXP / 600) + 1
);

const maxXP = 600;

const currentXP = totalXP % maxXP;

const xpPercent = Math.min(
  100,
  Math.round((currentXP / maxXP) * 100)
);
 

  useEffect(() => {
    setMonthProgress(prev => {
      const nextMonthProgress = prev.map((value, index) => index === todayDay - 1 ? todayProgress : value);
      localStorage.setItem(userMonthlyProgressStorageKey, JSON.stringify(nextMonthProgress));
      return nextMonthProgress[todayDay - 1] === prev[todayDay - 1] ? prev : nextMonthProgress;
    });
  }, [todayDay, todayProgress, userMonthlyProgressStorageKey]);
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





{dangerHabit && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5"
  >
    <div className="flex items-center gap-3">
      <Flame className="text-red-500" size={22} />
      <div>
        <p className="font-black text-red-500">
          ⚠️ Streak Emergency
        </p>

        <p className={`text-sm mt-1 ${txt}`}>
          "{dangerHabit.name}" is sitting at
          <span className="font-black text-red-500">
            {" "}🔥 {dangerHabit.streak} days
          </span>
          .
          Miss today and watch your hard-earned streak evaporate into digital dust.
        </p>
      </div>
    </div>
  </motion.div>
)}

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
                {!dashboardHabits.length ? (
                  <div className={`rounded-xl border p-5 text-center ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <p className={`text-sm font-black ${txt}`}>No habits yet</p>
                    <p className={`text-xs mt-1 ${muted}`}>Create your first habit to start tracking progress from zero.</p>
                    <button
                      onClick={() => setActiveSection('habits')}
                      className="mt-4 rounded-xl bg-green-500 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-green-400"
                    >
                      Create your first habit
                    </button>
                  </div>
                ) : dashboardHabits.map((habit, index) => {
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
                      {/* <span className="flex items-center gap-1 text-orange-500 text-xs font-black flex-shrink-0">
                        <Flame size={13} className="fill-orange-500" />
                        {habit.streak}d
                      </span> */}
                      {habit.streak >= 3 && (
  <span className="flex items-center gap-1 text-orange-500 text-xs font-black flex-shrink-0">
    <Flame size={13} className="fill-orange-500" />
    {habit.streak}d
  </span>
)}
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

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                    {monthDays.map(day => {
                      const value = activeMonthProgress[day - 1] ?? 0;
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
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 ${cellTone}`}
                        >
                          <span className="text-xs font-black">{day}</span>
                          <span className="text-[9px] font-bold opacity-80">{value}%</span>
                        </motion.div>
                      );
                    })}
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
