import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Home, CheckCircle, BarChart2, User, Brain, TrendingUp, Trophy, X } from 'lucide-react';

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

  const level = 12, currentXP = 1200, maxXP = 1500, streakDays = 15;
  const xpPercent = (currentXP / maxXP) * 100;
  const completedDays = WEEK_PROGRESS.filter(Boolean).length;
  const progressPercent = Math.round((completedDays / 7) * 100);

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
        <div className="p-4 md:p-5 xl:p-6 pb-24 md:pb-6">

          {/* ── Level / XP header ─────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between mb-4 border rounded-2xl px-4 py-3 ${card}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="md:hidden w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {username[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-sm leading-tight ${txt}`}>Level {level}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className={`flex-1 max-w-sm h-2 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
                  </div>
                  <span className={`text-xs flex-shrink-0 ${muted}`}>{currentXP} / {maxXP} XP</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-500 text-white rounded-full px-3 py-1.5 ml-3 flex-shrink-0 shadow-lg shadow-orange-500/20">
              <Flame size={15} className="fill-white" />
              <span className="font-black text-sm">{streakDays}</span>
            </div>
          </motion.div>

          {/* ── AI Motivator banner ────────────────────────────────────────── */}
          <AnimatePresence>
            {bannerVisible && (
              <motion.div key="banner"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="relative mb-4 rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#0a120a 0%,#0f2010 60%,#0a120a 100%)' }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 80% 50%,rgba(34,197,94,0.12) 0%,transparent 65%)' }} />
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 p-4 xl:p-5">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-black tracking-widest text-green-400 bg-green-400/10 border border-green-500/30 px-2.5 py-0.5 rounded-full mb-2">
                      AI MOTIVATOR
                    </span>
                    <p className="text-white text-sm font-medium leading-snug">
                      "Arre yaar! 🗣️ You missed your meditation. Is this how you fulfill your dreams?{' '}
                      <span className="text-green-400 font-black">SHARAM KARO!"</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setActiveSection('habits')}
                      className="bg-green-500 hover:bg-green-400 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors whitespace-nowrap shadow-lg shadow-green-500/20">
                      Fix it now
                    </button>
                    <button onClick={() => setBannerVisible(false)}
                      className="bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors whitespace-nowrap">
                      Maybe later
                    </button>
                    <button onClick={() => setBannerVisible(false)} className="text-white/30 hover:text-white/60 transition-colors p-1">
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none">
                  <Brain size={90} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Two-column layout on lg+, single column on mobile ─────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

            {/* LEFT: Daily Focus — takes 3 of 5 cols on lg */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`lg:col-span-3 border rounded-2xl p-5 ${card}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-base font-black ${txt}`}>Daily Focus</h2>
                <span className="text-green-500 text-xs font-black bg-green-500/10 px-2.5 py-1 rounded-full">{progressPercent}% Done</span>
              </div>

              <div className={`rounded-xl p-4 mb-4 ${inner}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-3xl font-black ${txt}`}>Reading</h3>
                    <p className={`text-xs mt-0.5 ${muted}`}>Goal: 30 mins/day</p>
                  </div>
                  <span className="text-5xl leading-none">🤩</span>
                </div>

                {/* Week tracker */}
                <div className="flex items-center justify-between gap-2">
                  {DAYS.map((day, i) => {
                    const done = WEEK_PROGRESS[i];
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                        <span className={`text-xs font-semibold ${muted}`}>{day}</span>
                        <motion.div
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.04 * i, type: 'spring', stiffness: 300 }}
                          className={`w-full max-w-[44px] aspect-square rounded-full flex items-center justify-center text-sm font-bold
                            ${done
                              ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                              : isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                          {done ? '✓' : ''}
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-400 text-white font-black text-sm tracking-[0.15em] shadow-lg shadow-green-500/25 transition-colors">
                COMPLETE SESSION
              </motion.button>
            </motion.div>

            {/* RIGHT: HabitHero Picks + Stats — takes 2 of 5 cols on lg */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* HabitHero Picks */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}>
                <h2 className={`text-base font-black mb-3 ${txt}`}>HabitHero Picks ✨</h2>
                <div className="grid grid-cols-3 gap-3">
                  {HERO_PICKS.map((c, i) => (
                    <motion.button key={c.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + 0.07 * i }}
                      whileHover={{ y: -4, transition: { duration: 0.18 } }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveSection('habits')}
                      className={`rounded-2xl border-2 p-3 text-left transition-all
                        ${isDarkMode ? `${c.darkBg} ${c.darkBorder}` : `bg-gradient-to-br ${c.lightGrad} ${c.lightBorder}`}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2.5 ${isDarkMode ? 'bg-white/10' : 'bg-white/80'}`}>
                        {c.icon}
                      </div>
                      <p className={`text-[9px] font-black tracking-widest mb-1 ${c.labelColor}`}>{c.label}</p>
                      <p className={`text-[11px] font-bold leading-tight ${txt}`}>{c.title}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Growth + Badges */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-3">
                {[
                  { icon: TrendingUp, label: 'GROWTH', value: '+12%', color: 'text-green-500', bg: 'bg-green-500/10' },
                  { icon: Trophy, label: 'BADGES', value: '24', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                ].map(({ icon: Icon, label, value, color, bg: ibg }) => (
                  <div key={label} className={`border rounded-2xl p-4 flex items-center gap-3 ${card}`}>
                    <div className={`w-9 h-9 rounded-xl ${ibg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={17} className={color} />
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold tracking-wider ${muted}`}>{label}</p>
                      <p className={`text-xl font-black leading-tight ${txt}`}>{value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div className={`flex items-center gap-1 px-3 py-2 rounded-full shadow-2xl border ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-gray-900 border-gray-800'}`}>
          {NAV_ITEMS.map(({ id, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button key={id}
                onClick={() => { setActiveNav(id); if (id !== 'home') setActiveSection(id); }}
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
