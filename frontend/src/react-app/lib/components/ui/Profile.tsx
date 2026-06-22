import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, CheckCircle, BarChart2, User,
    Trophy, Globe, Flame, Shield, Sun, Lock,
    Pencil, Settings, Share2, Brain
} from 'lucide-react';

interface ProfileSectionProps {
    isDarkMode: boolean;
    setActiveSection?: (section: string) => void;
}

const NAV_ITEMS = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'habits', icon: CheckCircle, label: 'Habits' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'profile', icon: User, label: 'Profile' },
];

const HABITS_STORAGE_KEY = 'trackify:habits';
const MONTHLY_PROGRESS_STORAGE_KEY = 'trackify:monthly-consistency';
const HEATMAP_COLUMNS = 8;
const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

type StoredHabit = {
    id: string;
    name: string;
    completed: boolean;
    streak: number;
    targetTime?: string;
};

function getUserStorageKey(baseKey: string, username: string) {
    const userKey = username.trim().toLowerCase() || 'user';
    return `${baseKey}:${encodeURIComponent(userKey)}`;
}

function loadUserHabits(username: string): StoredHabit[] {
    try {
        const stored = localStorage.getItem(getUserStorageKey(HABITS_STORAGE_KEY, username));
        const parsed = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(parsed)) return [];

       return parsed.map((habit, index) => ({
    id: String(habit.id || habit.name || `habit-${index}`),
    name: String(habit.name || 'Untitled Habit'),
    completed: Boolean(habit.completed),
    streak: Number(habit.streak || 0),
    targetTime: habit.targetTime || habit.time,
}));
    } catch {
        return [];
    }
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

function progressToHeatValue(value: number) {
    if (value <= 0) return 0;
    if (value <= 25) return 1;
    if (value <= 50) return 2;
    if (value <= 75) return 3;
    return 4;
}

function buildMonthlyHeatmap(monthProgress: number[]) {
    return Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: HEATMAP_COLUMNS }, (_, column) => {
            const dayIndex = row * HEATMAP_COLUMNS + column;
            return dayIndex < monthProgress.length ? progressToHeatValue(monthProgress[dayIndex]) : 0;
        })
    );
}

function isMorningHabit(habit: StoredHabit) {
    if (!habit.targetTime) return false;
    const hour = Number(String(habit.targetTime).split(':')[0]);
    return Number.isFinite(hour) && hour < 10;
}
const MINI_ACHIEVEMENTS = [
    { id: '1', label: '7-Day\nWarrior', icon: Shield, earned: true, color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/25' },
    { id: '2', label: 'Early\nBird', icon: Sun, earned: true, color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/25' },
    { id: '3', label: 'Consistency\nKing', icon: Lock, earned: false, color: 'text-gray-600', bg: 'bg-white/5', border: 'border-white/5' },
    { id: '4', label: 'Deep\nFocus', icon: Lock, earned: false, color: 'text-gray-600', bg: 'bg-white/5', border: 'border-white/5' },
];

export default function ProfileSection({ isDarkMode, setActiveSection }: ProfileSectionProps) {
    const username = localStorage.getItem('username') || 'User';


    const [showEditProfile, setShowEditProfile] = useState(false);

const [editedName, setEditedName] = useState(
  localStorage.getItem('username') || 'User'
);

const handleSaveProfile = () => {
  if (!editedName.trim()) return;

  localStorage.setItem('username', editedName.trim());

  setShowEditProfile(false);

  window.location.reload();
};
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const monthLabel = MONTH_LABELS[today.getMonth()];
    const firstName = username.split(' ')[0] || 'You';

    const habits = useMemo(() => loadUserHabits(username), [username]);
    const monthlyProgress = useMemo(() => loadMonthlyProgress(username, daysInMonth), [daysInMonth, username]);
    const heatmap = useMemo(() => buildMonthlyHeatmap(monthlyProgress), [monthlyProgress]);

    const completedToday = habits.filter((habit) => habit.completed).length;
    const totalStreakDays = habits.reduce((sum, habit) => sum + habit.streak, 0);
    const bestStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
    const activeDaysThisMonth = monthlyProgress.filter((value) => value > 0).length;
    const averageConsistency = monthlyProgress.length
        ? Math.round(monthlyProgress.reduce((sum, value) => sum + value, 0) / monthlyProgress.length)
        : 0;
    const totalXP = totalStreakDays * 25 + completedToday * 50 + activeDaysThisMonth * 20;
    const level = Math.max(1, Math.floor(totalXP / 600) + 1);
    const currentLevelXP = totalXP % 600;
    const xpPercent = Math.min(100, Math.round((currentLevelXP / 600) * 100));
    const morningHabitCount = habits.filter(isMorningHabit).length;
    const morningHabitPercent = habits.length ? Math.round((morningHabitCount / habits.length) * 100) : 0;
    const habitStyle = morningHabitPercent >= 60 ? 'Morning Enthusiast' : habits.length ? 'Balanced Builder' : 'Fresh Starter';
    const habitStyleCopy = habits.length
        ? `${firstName}, ${morningHabitPercent}% of your habits are scheduled before 10 AM. Your profile now reflects your saved habit routine.`
        : `${firstName}, create and complete habits to unlock a richer personalized activity map.`;

    /* ── theme tokens ────────────────────────────────────────────────────── */
    const BG = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-100';
    const CARD = isDarkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-gray-100';
    const HCARD = isDarkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-gray-50 border-gray-100';
    const TXT = isDarkMode ? 'text-white' : 'text-gray-900';
    const MUTED = isDarkMode ? 'text-gray-500' : 'text-gray-400';
    const HOV = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50';

    const heatColor = (v: number) => {
        if (v === 0) return isDarkMode ? 'bg-white/5' : 'bg-gray-100';
        if (v === 1) return isDarkMode ? 'bg-green-900/50' : 'bg-green-100';
        if (v === 2) return isDarkMode ? 'bg-green-700/60' : 'bg-green-200';
        if (v === 3) return 'bg-green-500';
        return 'bg-green-400';
    };

    return (
        <div className={`flex h-screen overflow-hidden ${BG} transition-colors duration-300`}>

            {/* ═══ SIDEBAR ════════════════════════════════════════════════════════ */}
            {/* <aside className={`hidden md:flex flex-col h-full w-[72px] xl:w-64 border-r flex-shrink-0 transition-all duration-300 ${SB}`}>
                <div className={`flex items-center gap-3 px-4 xl:px-5 py-5 border-b ${DIV}`}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
                        <Zap size={17} className="text-white fill-white" />
                    </div>
                    <span className={`hidden xl:block font-black text-lg tracking-tight ${TXT}`}>HabitHero</span>
                </div>

                <nav className="flex flex-col gap-1 p-2 xl:p-3 flex-1">
                    {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
                        const active = id === 'profile';
                        return (
                            <button key={id}
                                onClick={() => setActiveSection?.(id)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl w-full transition-all duration-200
                  ${active ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : `${MUTED} ${HOV}`}`}>
                                <Icon size={19} className="flex-shrink-0" />
                                <span className={`hidden xl:block text-sm font-semibold ${active ? 'text-white' : ''}`}>{label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className={`p-2 xl:p-3 border-t ${DIV}`}>
                    <div className={`flex items-center gap-3 p-2 rounded-xl ${HOV} cursor-pointer`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                            {username[0]?.toUpperCase()}
                        </div>
                        <div className="hidden xl:block min-w-0">
                            <p className={`text-xs font-bold truncate ${TXT}`}>{username}</p>
                            <p className={`text-[10px] ${MUTED}`}>Level 12</p>
                        </div>
                    </div>
                </div>
            </aside> */}

            {/* ═══ MAIN ═══════════════════════════════════════════════════════════ */}
            <div className="flex-1 min-w-0 h-full overflow-y-auto">
                <div className="p-4 md:p-6 pb-24 md:pb-8 w-full">

                    {/* ── Top action row ──────────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between mb-6">
                        <button className={`w-10 h-10 rounded-xl border flex items-center justify-center ${CARD} ${HOV} transition-colors`}>
                            <Settings size={17} className={MUTED} />
                        </button>
                        <h1 className={`text-base font-black ${TXT}`}>Profile</h1>
                        <button className={`w-10 h-10 rounded-xl border flex items-center justify-center ${CARD} ${HOV} transition-colors`}>
                            <Share2 size={17} className={MUTED} />
                        </button>
                    </motion.div>

                    {/* ── Avatar + name ───────────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 }}
                        className="flex flex-col items-center mb-6">
                        {/* Avatar ring */}
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30">
                                <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl font-black ${isDarkMode ? 'bg-[#1c1c1c]' : 'bg-gray-100'} ${TXT}`}>
                                    {username[0]?.toUpperCase()}
                                </div>
                            </div>
                            {/* LVL badge */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-green-500/30 whitespace-nowrap">
                                LVL {level}
                            </div>
                        </div>

                        <h2 className={`text-2xl font-black mt-1 ${TXT}`}>{username}</h2>
                        <p className={`text-sm mt-0.5 ${MUTED}`}>Habit Architect</p>

                        {/* XP bar */}
                        <div className="w-full max-w-xs mt-5">
                            <div className={`relative h-8 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                                <motion.div
                                    initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }}
                                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                                    className="absolute inset-y-0 left-0 rounded-full bg-green-500" />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white z-10">
                                    {currentLevelXP} / 600 XP
                                </span>
                            </div>
                            <p className={`text-center text-[10px] font-black tracking-widest mt-1.5 ${MUTED}`}>
                                NEXT LEVEL: MASTER BUILDER
                            </p>
                        </div>
                    </motion.div>

                    {/* ── Stats grid 2×2 ──────────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 gap-3 mb-4">
                        {[
                            { icon: Flame, label: 'Total Streak', value: `${totalStreakDays} days`, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                            { icon: CheckCircle, label: 'Today Done', value: `${completedToday}/${habits.length}`, color: 'text-green-400', bg: 'bg-green-500/10' },
                            { icon: Trophy, label: 'Best Streak', value: `${bestStreak} days`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            { icon: Globe, label: 'Month Avg', value: `${averageConsistency}%`, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        ].map(({ icon: Icon, label, value, color, bg }) => (
                            <div key={label} className={`border rounded-2xl p-4 ${HCARD}`}>
                                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                                    <Icon size={18} className={color} />
                                </div>
                                <p className={`text-xs font-semibold mb-0.5 ${MUTED}`}>{label}</p>
                                <p className={`text-xl font-black ${TXT}`}>{value}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* ── Achievements mini row ────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className={`border rounded-2xl p-5 mb-4 ${CARD}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-base font-black ${TXT}`}>Achievements</h3>
                            <button
                                onClick={() => setActiveSection?.('achievements')}
                                className="text-xs font-bold text-green-500 hover:text-green-400 transition-colors">
                                View All
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {MINI_ACHIEVEMENTS.map((a, i) => {
                                const Icon = a.icon;
                                return (
                                    <motion.div key={a.id}
                                        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.08 * i, type: 'spring', stiffness: 280 }}
                                        className="flex flex-col items-center gap-1.5">
                                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center
                      ${a.earned ? `${a.bg} ${a.border}` : isDarkMode ? 'bg-white/5 border-white/5 opacity-40' : 'bg-gray-100 border-gray-200 opacity-40'}`}>
                                            <Icon size={22} className={a.earned ? a.color : isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
                                        </div>
                                        <p className={`text-[9px] font-bold text-center leading-tight whitespace-pre-line ${a.earned ? MUTED : isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>
                                            {a.label}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* ── Habit Style card ─────────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`rounded-2xl p-5 mb-4 ${isDarkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-100'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                                <Brain size={18} className="text-white" />
                            </div>
                            <h3 className={`text-sm font-black ${TXT}`}>Your Habit Style</h3>
                        </div>
                        <p className={`text-base font-black mb-1 ${TXT}`}>{habitStyle}</p>
                        <p className={`text-xs leading-relaxed ${MUTED}`}>
                            {habitStyleCopy}
                        </p>
                    </motion.div>

                    {/* ── Year of Growth heatmap ───────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className={`border rounded-2xl p-5 mb-4 ${CARD}`}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className={`text-base font-black ${TXT}`}>Your {monthLabel} Growth</h3>
                                <p className={`text-xs mt-0.5 ${MUTED}`}>{firstName}'s saved completion activity</p>
                            </div>
                            <span className="text-xs font-black text-green-500">{averageConsistency}%</span>
                        </div>
                        <div className="overflow-x-auto">
                            <div className="min-w-[280px]">
                                {heatmap.map((row, ri) => (
                                    <div key={ri} className="flex gap-1.5 mb-1.5">
                                        {row.map((v, ci) => (
                                            <motion.div key={ci}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.008 * (ri * HEATMAP_COLUMNS + ci), type: 'spring', stiffness: 300 }}
                                                className={`flex-1 aspect-square rounded-sm ${heatColor(v)}`} />
                                        ))}
                                    </div>
                                ))}
                                {/* Month labels */}
                                <div className="flex mt-2">
                                    {['W1', 'W2', 'W3', 'W4'].map((week) => (
                                        <div key={week} className={`flex-1 text-[9px] font-black tracking-wider ${MUTED}`}>{week}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Edit Profile button ──────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col gap-3">
                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setShowEditProfile(true)}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-sm transition-all
                ${isDarkMode
                                    ? 'bg-[#1c1c1c] border border-white/5 text-white hover:border-white/10'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                            <div className="flex items-center gap-3">
                                <Pencil size={16} className="text-green-400" />
                                Edit Profile
                            </div>
                            <span className={MUTED}>›</span>
                        </motion.button>

                        {/* Friends + Sync Data */}
                        {/* <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Users, label: 'Friends', color: 'text-green-400' },
                                { icon: RefreshCw, label: 'Sync Data', color: 'text-green-400' },
                            ].map(({ icon: Icon, label, color }) => (
                                <motion.button key={label}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl border font-black text-sm transition-all ${HCARD} ${HOV}`}>
                                    <Icon size={16} className={color} />
                                    <span className={TXT}>{label}</span>
                                </motion.button>
                            ))}
                        </div> */}
                    </motion.div>

                </div>
            </div>


<AnimatePresence>
  {showEditProfile && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className={`w-[90%] max-w-md rounded-2xl p-6 ${
          isDarkMode ? 'bg-[#161616]' : 'bg-white'
        }`}
      >
        <h2 className={`text-xl font-black mb-4 ${TXT}`}>
          Edit Profile
        </h2>

        <input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border ${
            isDarkMode
              ? 'bg-[#1f1f1f] border-white/10 text-white'
              : 'bg-gray-50 border-gray-200'
          }`}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setShowEditProfile(false)}
            className="px-4 py-2 rounded-xl bg-gray-500 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveProfile}
            className="px-4 py-2 rounded-xl bg-green-500 text-white"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
            {/* ═══ MOBILE NAV ═════════════════════════════════════════════════════ */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
                <div className={`flex items-center gap-1 px-3 py-2 rounded-full shadow-2xl border
          ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-gray-900 border-gray-800'}`}>
                    {NAV_ITEMS.map(({ id, icon: Icon }) => {
                        const active = id === 'profile';
                        return (
                            <button key={id}
                                onClick={() => setActiveSection?.(id)}
                                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200
                  ${active ? 'bg-green-500 shadow-lg shadow-green-500/40' : 'text-gray-500 hover:bg-white/10'}`}>
                                <Icon size={19} className={active ? 'text-white' : ''} />
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
