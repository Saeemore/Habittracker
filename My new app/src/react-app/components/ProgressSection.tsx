


import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Zap, Brain } from 'lucide-react';

interface ProgressSectionProps {
  isDarkMode: boolean;
  setActiveSection?: (section: string) => void;
}

// ── Heatmap: 4 habits × 7 days
const HABITS = ['Meditation', 'Reading', 'Exercise', 'Journaling'];
const HEATMAP_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
type CellState = 'done' | 'missed' | 'none';
const HEATMAP_DATA: CellState[][] = [
  ['done', 'done', 'missed', 'done', 'done', 'missed', 'none'],
  ['done', 'done', 'done', 'done', 'done', 'missed', 'none'],
  ['missed', 'done', 'done', 'missed', 'done', 'none', 'none'],
  ['done', 'missed', 'done', 'done', 'missed', 'none', 'none'],
];

// ── 30-day trend (0–100), left = oldest, right = today
const TREND: number[] = [
  22, 38, 30, 48, 55, 42, 60, 65, 52, 70,
  68, 75, 72, 80, 77, 82, 79, 85, 80, 84,
  78, 82, 76, 85, 80, 83, 86, 88, 84, 95,
];

const TABS = ['This Week', 'Last Week', 'Monthly', 'Quarterly'];



export default function ProgressSection({ isDarkMode }: ProgressSectionProps) {
  const [activeTab, setActiveTab] = useState('This Week');


  // ── theme tokens ──────────────────────────────────────────────────────────
  const bg = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-100';

  const card = isDarkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-gray-100';
  const txt = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-500' : 'text-gray-400';
  const hov = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50';
  const divider = isDarkMode ? 'border-white/5' : 'border-gray-100';

  const cellClass = (s: CellState) => {
    if (s === 'done') return 'bg-green-500';
    if (s === 'missed') return isDarkMode ? 'bg-green-900/50' : 'bg-green-100';
    return isDarkMode ? 'bg-white/5' : 'bg-gray-100';
  };

  const minT = Math.min(...TREND), maxT = Math.max(...TREND);

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        <div className="p-4 md:p-5 xl:p-6 pb-24 md:pb-6">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
                <Brain size={16} className="text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-black leading-tight ${txt}`}>AI Insights</h1>
                <p className={`text-[11px] ${muted}`}>HabitHero Intelligence</p>
              </div>
            </div>
            <button className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card} ${hov} transition-colors`}>
              <Calendar size={16} className={muted} />
            </button>
          </motion.div>

          {/* ── Tabs ──────────────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`flex items-center gap-1 p-1 rounded-xl border mb-5 w-fit ${card}`}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                  ${activeTab === tab ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : `${muted} ${hov}`}`}>
                {tab}
              </button>
            ))}
          </motion.div>

          {/* ── 3-column grid ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

            {/* LEFT: 2 cols */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Weekly Heatmap */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className={`border rounded-2xl p-5 ${card}`}>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className={`text-base font-black ${txt}`}>Weekly Heatmap</h2>
                    <p className={`text-xs mt-0.5 ${muted}`}>Intensity of your habit streaks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-500 text-2xl font-black leading-none">85%</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${muted}`}>+12% VS LW</p>
                  </div>
                </div>

                <div className="grid grid-cols-8 gap-2 mb-2">
                  <div />
                  {HEATMAP_DAYS.map(d => (
                    <div key={d} className={`text-center text-[10px] font-black tracking-wider ${muted}`}>{d}</div>
                  ))}
                </div>

                {HEATMAP_DATA.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-8 gap-2 mb-2">
                    <div className={`flex items-center text-[10px] font-semibold truncate ${muted}`}>{HABITS[ri]}</div>
                    {row.map((state, ci) => (
                      <motion.div key={ci}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.04 + (ri * 7 + ci) * 0.018, type: 'spring', stiffness: 260 }}
                        className={`rounded-xl aspect-square ${cellClass(state)}`} />
                    ))}
                  </div>
                ))}

                <div className={`flex items-center gap-4 mt-4 pt-4 border-t ${divider}`}>
                  {[
                    { label: 'Completed', cls: 'bg-green-500' },
                    { label: 'Missed', cls: isDarkMode ? 'bg-green-900/50' : 'bg-green-100' },
                    { label: 'No habit', cls: isDarkMode ? 'bg-white/5' : 'bg-gray-100' },
                  ].map(({ label, cls }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded-sm ${cls}`} />
                      <span className={`text-[10px] font-semibold ${muted}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* AI Recommendations */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className={`border rounded-2xl p-5 ${card}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={14} className="text-green-500 fill-green-500" />
                  <h2 className={`text-base font-black ${txt}`}>AI Recommendations</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-[#1a2a1a] border-green-900/40' : 'bg-green-50 border-green-100'}`}>
                    <span className="inline-block text-[9px] font-black tracking-widest text-green-600 bg-green-500/15 border border-green-500/30 px-2 py-0.5 rounded-full mb-3">
                      OPTIMIZATION
                    </span>
                    <h3 className={`text-sm font-black mb-1.5 ${txt}`}>Switch Reading to Morning</h3>
                    <p className={`text-xs leading-relaxed ${muted}`}>
                      Based on your peak focus levels (8AM–10AM), reading now will increase retention by{' '}
                      <span className={`font-black ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>24%</span>.
                    </p>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg,#0f1f0f,#0a1a0a)' }}>
                    <span className="inline-block text-[9px] font-black tracking-widest text-green-400 bg-green-400/10 border border-green-500/30 px-2 py-0.5 rounded-full mb-3">
                      CONSISTENCY
                    </span>
                    <h3 className="text-sm font-black mb-1.5 text-white">Pair Meditation with Coffee</h3>
                    <p className="text-xs leading-relaxed text-gray-400">
                      You're 20% more likely to complete 'Meditation' when you finish 'Brew Coffee' first.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Consistency Trend */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`border rounded-2xl p-5 ${card}`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className={`text-base font-black ${txt}`}>Consistency Trend</h2>
                    <p className={`text-xs mt-0.5 ${muted}`}>Your 30-day trajectory</p>
                  </div>
                  <span className="text-xs font-bold text-green-500">↗ Growing</span>
                </div>

                {/* Single bar with 30 intensity segments */}
                <div className={`w-full h-14 rounded-xl overflow-hidden flex ${isDarkMode ? 'bg-white/5' : 'bg-green-50'}`}>
                  {TREND.map((v, i) => {
                    const isToday = i === TREND.length - 1;
                    const intensity = (v - minT) / (maxT - minT);
                    const opacity = 0.12 + intensity * 0.88;
                    return (
                      <motion.div key={i} className="flex-1 h-full"
                        style={{
                          backgroundColor: isToday ? '#22c55e' : `rgba(34,197,94,${opacity})`,
                          boxShadow: isToday ? '0 0 8px rgba(34,197,94,0.5)' : 'none',
                        }}
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 0.4, delay: 0.015 * i, ease: 'easeOut' }}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between mt-2">
                  <span className={`text-[10px] font-semibold ${muted}`}>30 DAYS AGO</span>
                  <span className={`text-[10px] font-semibold ${muted}`}>TODAY</span>
                </div>
              </motion.div>

              {/* Longest Streak + Total Habits Done */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                className={`border rounded-2xl overflow-hidden ${card}`}>
                <div className={`grid grid-cols-2 divide-x ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                  <div className="p-5">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                      <Zap size={17} className="text-green-500 fill-green-500" />
                    </div>
                    <p className={`text-4xl font-black ${txt}`}>14</p>
                    <p className={`text-xs font-semibold mt-1 ${muted}`}>Longest Streak</p>
                  </div>
                  <div className="p-5">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                      <span className="text-lg">✅</span>
                    </div>
                    <p className={`text-4xl font-black ${txt}`}>128</p>
                    <p className={`text-xs font-semibold mt-1 ${muted}`}>Total Habits Done</p>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* RIGHT: Habit progress bars */}
            <div className="flex flex-col gap-4">
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className={`border rounded-2xl p-5 ${card}`}>
                <h3 className={`text-sm font-black mb-4 ${txt}`}>Habit Progress</h3>
                <div className="flex flex-col gap-4">
                  {[
                    { name: 'Meditation', pct: 60 },
                    { name: 'Reading', pct: 80 },
                    { name: 'Exercise', pct: 50 },
                    { name: 'Journaling', pct: 70 },
                  ].map((h, i) => (
                    <div key={h.name}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-xs font-semibold ${muted}`}>{h.name}</span>
                        <span className="text-xs font-black text-green-500">{h.pct}%</span>
                      </div>
                      <div className={`h-1.5 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${h.pct}%` }}
                          transition={{ duration: 0.9, delay: 0.1 * i, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick stats */}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 }}
                className={`border rounded-2xl p-5 ${card}`}>
                <h3 className={`text-sm font-black mb-4 ${txt}`}>This Month</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Completed', value: '86', sub: 'sessions', color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Skipped', value: '14', sub: 'sessions', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { label: 'Best Day', value: 'Wed', sub: 'most active', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Avg Score', value: '78%', sub: 'per day', color: 'text-purple-500', bg: 'bg-purple-500/10' },
                  ].map(({ label, value, color, bg: ibg }) => (
                    <div key={label} className={`rounded-xl p-3 ${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
                      <div className={`w-7 h-7 rounded-lg ${ibg} flex items-center justify-center mb-2`}>
                        <span className={`text-xs font-black ${color}`}>#</span>
                      </div>
                      <p className={`text-lg font-black leading-none ${txt}`}>{value}</p>
                      <p className={`text-[10px] mt-0.5 ${muted}`}>{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}