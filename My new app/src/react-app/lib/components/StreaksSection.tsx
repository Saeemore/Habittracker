import { motion } from 'framer-motion';
import { Flame, Share2 } from 'lucide-react';

interface StreaksSectionProps {
  isDarkMode: boolean;
}

export default function StreaksSection({ isDarkMode }: StreaksSectionProps) {
  const streaks = [
    { id: '1', habit: 'Morning Meditation', current: 7, longest: 14, nextMilestone: 14, color: 'from-[#A8D8EA] to-[#C7CEEA]' },
    { id: '2', habit: 'Reading', current: 14, longest: 14, nextMilestone: 30, color: 'from-[#FFB3D9] to-[#C7CEEA]' },
    { id: '3', habit: 'Exercise', current: 5, longest: 12, nextMilestone: 7, color: 'from-[#B5EAD7] to-[#A8D8EA]' },
    { id: '4', habit: 'Journaling', current: 3, longest: 8, nextMilestone: 7, color: 'from-[#FFDAB9] to-[#FFB3D9]' },
  ];

  return (
    <div className={`p-8 min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D]' : 'bg-gradient-to-br from-[#F5F7FA] to-[#E8F4F8]'}`}>
      <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#2C3E50]'}`}>
        Active Streaks 🔥
      </h1>
      <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-[#7F8C8D]'}`}>
        Keep the momentum going! Don't break the chain!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {streaks.map((streak, index) => (
          <motion.div
            key={streak.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${streak.color} rounded-2xl shadow-lg p-6 text-white`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{streak.habit}</h3>
                <p className="text-sm opacity-90">Keep it up! You're on fire! 🔥</p>
              </div>
              <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                <Flame size={32} />
              </div>
            </div>

            <div className="bg-white/20 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm opacity-90">Current Streak</span>
                <span className="text-3xl font-bold">{streak.current}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-90">Longest Streak</span>
                <span className="text-xl font-bold">{streak.longest}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to {streak.nextMilestone}-day milestone</span>
                <span>{streak.current}/{streak.nextMilestone}</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(streak.current / streak.nextMilestone) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <p className="text-xs mt-1 opacity-75">
                {streak.nextMilestone - streak.current} days to go - you've got this! 💪
              </p>
            </div>

            {streak.current >= 7 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-white/30 hover:bg-white/40 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Share2 size={18} />
                Share My {streak.current}-Day Streak! 🎉
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
