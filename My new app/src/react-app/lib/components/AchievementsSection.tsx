// import { motion } from 'framer-motion';
// import { Award, Trophy, Star, Zap } from 'lucide-react';

// interface AchievementsSectionProps {
//   isDarkMode: boolean;
// }

// export default function AchievementsSection({ isDarkMode }: AchievementsSectionProps) {
//   const achievements = [
//     { id: '1', name: 'Week Warrior', description: '7-day streak', icon: Trophy, color: 'from-[#FFD700] to-[#FFA500]', earned: true },
//     { id: '2', name: 'Two Weeks Strong', description: '14-day streak', icon: Star, color: 'from-[#A8D8EA] to-[#C7CEEA]', earned: true },
//     { id: '3', name: 'Month Master', description: '30-day streak', icon: Award, color: 'from-[#FFB3D9] to-[#C7CEEA]', earned: false },
//     { id: '4', name: 'Century Club', description: '100-day streak', icon: Zap, color: 'from-[#B5EAD7] to-[#A8D8EA]', earned: false },
//     { id: '5', name: 'Habit Creator', description: 'Created 5 habits', icon: Star, color: 'from-[#FFDAB9] to-[#FFB3D9]', earned: true },
//     { id: '6', name: 'Perfect Week', description: '7 days all complete', icon: Trophy, color: 'from-[#C7CEEA] to-[#FFB3D9]', earned: false },
//   ];

//   return (
//     <div className={`p-8 min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D]' : 'bg-gradient-to-br from-[#F5F7FA] to-[#E8F4F8]'}`}>
//       <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#2C3E50]'}`}>
//         Your Achievements 🏆
//       </h1>
//       <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-[#7F8C8D]'}`}>
//         Celebrate your wins and milestones!
//       </p>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {achievements.map((achievement, index) => {
//           const Icon = achievement.icon;
//           return (
//             <motion.div
//               key={achievement.id}
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: index * 0.1 }}
//               whileHover={{ scale: achievement.earned ? 1.05 : 1 }}
//               className={`rounded-2xl shadow-lg p-6 ${
//                 achievement.earned
//                   ? `bg-gradient-to-br ${achievement.color}`
//                   : isDarkMode
//                   ? 'bg-[#2D2D2D]'
//                   : 'bg-white'
//               } ${!achievement.earned && 'opacity-50'}`}
//             >
//               <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
//                 achievement.earned
//                   ? 'bg-white/30'
//                   : isDarkMode
//                   ? 'bg-[#444]'
//                   : 'bg-gray-200'
//               }`}>
//                 <Icon 
//                   size={32} 
//                   className={achievement.earned ? 'text-white' : isDarkMode ? 'text-gray-500' : 'text-gray-400'} 
//                 />
//               </div>

//               <h3 className={`text-xl font-bold mb-2 ${
//                 achievement.earned ? 'text-white' : isDarkMode ? 'text-white' : 'text-[#2C3E50]'
//               }`}>
//                 {achievement.name}
//               </h3>

//               <p className={`text-sm ${
//                 achievement.earned ? 'text-white/90' : isDarkMode ? 'text-gray-400' : 'text-[#7F8C8D]'
//               }`}>
//                 {achievement.description}
//               </p>

//               {achievement.earned && (
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className="mt-4 pt-4 border-t border-white/20"
//                 >
//                   <button className="w-full py-2 bg-white/30 hover:bg-white/40 text-white rounded-lg font-bold transition-all">
//                     Share Achievement 🎉
//                   </button>
//                 </motion.div>
//               )}
//             </motion.div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }







import { motion } from 'framer-motion';
import { Award, Trophy, Star, Zap, Home, CheckCircle, User } from 'lucide-react';

interface AchievementsSectionProps {
  isDarkMode: boolean;
  setActiveSection?: (section: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'habits', icon: CheckCircle, label: 'Habits' },
  { id: 'achievements', icon: Trophy, label: 'Achievements' },
  { id: 'profile', icon: User, label: 'Profile' },
];

const ACHIEVEMENTS = [];

export default function AchievementsSection({ isDarkMode, setActiveSection }: AchievementsSectionProps) {

  /* ── theme tokens — same as Dashboard / HabitsSection ─────────────────── */
  const BG = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-100';
  const CARD = isDarkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-gray-100';
  const HCARD = isDarkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-gray-100';
  const TXT = isDarkMode ? 'text-white' : 'text-gray-900';
  const MUTED = isDarkMode ? 'text-gray-500' : 'text-gray-400';

  const earned = ACHIEVEMENTS.filter(a => a.earned).length;
  const total = ACHIEVEMENTS.length;
  const progressPct = total ? Math.round((earned / total) * 100) : 0;

  return (
    <div className={`flex h-screen overflow-hidden ${BG} transition-colors duration-300`}>

      {/* ═══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      {/* <aside className={`hidden md:flex flex-col h-full w-[72px] xl:w-64 border-r flex-shrink-0 transition-all duration-300 ${SB}`}>
        <div className={`flex items-center gap-3 px-4 xl:px-5 py-5 border-b ${DIV}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
            <Zap size={17} className="text-white fill-white" />
          </div>
          <span className={`hidden xl:block font-black text-lg tracking-tight ${TXT}`}>HabitHero</span>
        </div>
 
        <nav className="flex flex-col gap-1 p-2 xl:p-3 flex-1">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const active = id === 'achievements';
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">U</div>
            <div className="hidden xl:block min-w-0">
              <p className={`text-xs font-bold truncate ${TXT}`}>User</p>
              <p className={`text-[10px] ${MUTED}`}>Level 12</p>
            </div>
          </div>
        </div>
      </aside> */}

      {/* ═══ MAIN ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        <div className="p-4 md:p-5 xl:p-6 pb-24 md:pb-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between mb-5 border rounded-2xl px-5 py-4 ${CARD}`}>
            <div>
              <h1 className={`text-lg font-black ${TXT}`}>Your Achievements 🏆</h1>
              <p className={`text-xs mt-0.5 ${MUTED}`}>Celebrate your wins and milestones!</p>
            </div>
            {/* Progress pill */}
            <div className="flex items-center gap-2">
              <div className={`w-20 h-1.5 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div className="h-full rounded-full bg-green-500 transition-all duration-700"
                  style={{ width: `${progressPct}%` }} />
              </div>
              <span className={`text-xs font-black ${MUTED}`}>{earned}/{total}</span>
            </div>
          </motion.div>

          {/* Achievements grid — 1→2→3→4 cols matching habits page */}
          {ACHIEVEMENTS.length === 0 ? (
            <div className={`border rounded-2xl p-6 ${HCARD}`}>
              <p className={`text-sm font-black ${TXT}`}>No achievements yet</p>
              <p className={`text-xs mt-1 ${MUTED}`}>Create habits and build streaks to unlock achievements.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map((a, index) => {
                const Icon = a.icon;
                return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.07 }}
                  whileHover={{ scale: a.earned ? 1.02 : 1, transition: { duration: 0.18 } }}
                  className={`rounded-2xl border flex flex-col overflow-hidden transition-all duration-200
                    ${a.earned
                      ? isDarkMode
                        ? `${a.cardBg} ${a.border}`
                        : `${a.cardBg} ${a.border}`
                      : `${HCARD} opacity-40`}`}>

                  {/* Card body */}
                  <div className="p-5 flex flex-col gap-4 flex-1">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
                      ${a.earned ? a.iconBg : isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                      <Icon size={24}
                        className={a.earned ? a.iconColor : isDarkMode ? 'text-gray-600' : 'text-gray-300'} />
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className={`font-black text-base leading-snug ${a.earned ? TXT : MUTED}`}>
                        {a.name}
                      </h3>
                      <p className={`text-xs mt-1 ${MUTED}`}>{a.description}</p>
                    </div>

                    {/* Status badge */}
                    {a.earned ? (
                      <span className="text-[10px] font-black tracking-widest text-green-500 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full w-fit">
                        EARNED ✓
                      </span>
                    ) : (
                      <span className={`text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full w-fit
                        ${isDarkMode ? 'text-gray-600 bg-white/5 border border-white/5' : 'text-gray-400 bg-gray-100 border border-gray-200'}`}>
                        LOCKED 🔒
                      </span>
                    )}
                  </div>

                  {/* Share button — flush bottom, only for earned (same pattern as Mark as Done) */}
                  {a.earned && (
                    <motion.button
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      className={`w-full py-3.5 font-black text-sm transition-all duration-200
                        ${isDarkMode
                          ? 'bg-green-500/15 text-green-400 border-t border-green-500/20 hover:bg-green-500/25'
                          : 'bg-green-100 text-green-600 border-t border-green-200 hover:bg-green-200'}`}>
                      Share Achievement 🎉
                    </motion.button>
                  )}
                </motion.div>
              );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ MOBILE NAV ══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div className={`flex items-center gap-1 px-3 py-2 rounded-full shadow-2xl border
          ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-gray-900 border-gray-800'}`}>
          {NAV_ITEMS.map(({ id, icon: Icon }) => {
            const active = id === 'achievements';
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
