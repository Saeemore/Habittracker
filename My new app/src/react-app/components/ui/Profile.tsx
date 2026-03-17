import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Home, CheckCircle, BarChart2, User, Zap,
    Trophy, Globe, Flame, Shield, Sun, Lock,
    Pencil, Users, RefreshCw, Settings, Share2, Brain
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

// Year of Growth heatmap — 4 rows x 16 cols (Jan–Apr)
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR'];
const HEATMAP: number[][] = [
    [0, 1, 2, 3, 4, 2, 1, 3, 4, 3, 2, 1, 2, 3, 4, 3],
    [1, 2, 3, 4, 3, 2, 1, 0, 2, 4, 3, 2, 1, 2, 3, 4],
    [2, 3, 4, 2, 1, 3, 4, 2, 0, 1, 2, 3, 4, 3, 2, 1],
    [3, 4, 2, 1, 2, 3, 4, 3, 2, 1, 0, 2, 3, 4, 3, 2],
];

const MINI_ACHIEVEMENTS = [
    { id: '1', label: '7-Day\nWarrior', icon: Shield, earned: true, color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/25' },
    { id: '2', label: 'Early\nBird', icon: Sun, earned: true, color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/25' },
    { id: '3', label: 'Consistency\nKing', icon: Lock, earned: false, color: 'text-gray-600', bg: 'bg-white/5', border: 'border-white/5' },
    { id: '4', label: 'Deep\nFocus', icon: Lock, earned: false, color: 'text-gray-600', bg: 'bg-white/5', border: 'border-white/5' },
];

export default function ProfileSection({ isDarkMode, setActiveSection }: ProfileSectionProps) {
    const username = localStorage.getItem('username') || 'Alex Rivera';

    /* ── theme tokens ────────────────────────────────────────────────────── */
    const BG = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-100';
    const SB = isDarkMode ? 'bg-[#111111] border-white/5' : 'bg-white border-gray-200';
    const CARD = isDarkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-gray-100';
    const HCARD = isDarkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-gray-50 border-gray-100';
    const TXT = isDarkMode ? 'text-white' : 'text-gray-900';
    const MUTED = isDarkMode ? 'text-gray-500' : 'text-gray-400';
    const HOV = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50';
    const DIV = isDarkMode ? 'border-white/5' : 'border-gray-100';

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
                                LVL 12
                            </div>
                        </div>

                        <h2 className={`text-2xl font-black mt-1 ${TXT}`}>{username}</h2>
                        <p className={`text-sm mt-0.5 ${MUTED}`}>Habit Architect</p>

                        {/* XP bar */}
                        <div className="w-full max-w-xs mt-5">
                            <div className={`relative h-8 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                                <motion.div
                                    initial={{ width: 0 }} animate={{ width: '75%' }}
                                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                                    className="absolute inset-y-0 left-0 rounded-full bg-green-500" />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white z-10">
                                    450 / 600 XP
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
                            { icon: Flame, label: 'Total Streak', value: '15 days', color: 'text-orange-400', bg: 'bg-orange-500/10' },
                            { icon: CheckCircle, label: 'Completed', value: '128', color: 'text-green-400', bg: 'bg-green-500/10' },
                            { icon: Trophy, label: 'Best Streak', value: '42 days', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            { icon: Globe, label: 'Global Rank', value: '#1,402', color: 'text-blue-400', bg: 'bg-blue-500/10' },
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
                        <p className={`text-base font-black mb-1 ${TXT}`}>Morning Enthusiast</p>
                        <p className={`text-xs leading-relaxed ${MUTED}`}>
                            {username.split(' ')[0]}, you're 84% more likely to complete habits before 10 AM. Your focus peaks early, and you thrive on structure.
                        </p>
                    </motion.div>

                    {/* ── Year of Growth heatmap ───────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className={`border rounded-2xl p-5 mb-4 ${CARD}`}>
                        <h3 className={`text-base font-black mb-4 ${TXT}`}>Year of Growth</h3>
                        <div className="overflow-x-auto">
                            <div className="min-w-[280px]">
                                {HEATMAP.map((row, ri) => (
                                    <div key={ri} className="flex gap-1.5 mb-1.5">
                                        {row.map((v, ci) => (
                                            <motion.div key={ci}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.008 * (ri * 16 + ci), type: 'spring', stiffness: 300 }}
                                                className={`flex-1 aspect-square rounded-sm ${heatColor(v)}`} />
                                        ))}
                                    </div>
                                ))}
                                {/* Month labels */}
                                <div className="flex mt-2">
                                    {MONTHS.map(m => (
                                        <div key={m} className={`flex-1 text-[9px] font-black tracking-wider ${MUTED}`}>{m}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Edit Profile button ──────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col gap-3">
                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
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
                        <div className="grid grid-cols-2 gap-3">
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
                        </div>
                    </motion.div>

                </div>
            </div>

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