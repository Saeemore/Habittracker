import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitName: string;
  isDarkMode: boolean;
}

const ENCOURAGING_QUOTES = [
  "You did it! Every step counts!",
  "Keep going! You're building something great!",
  "Well done! You're making progress!",
  "Great job! Small wins lead to big changes!",
  "You're on fire! Keep up the good work!",
  "Nice work! You're getting stronger every day!",
  "Amazing! You showed up and that's what matters!",
  "Proud of you! Consistency is key!",
  "You nailed it! One more step forward!",
  "Fantastic! You're building a better you!",
];

export default function CelebrationModal({ isOpen, onClose, habitName, isDarkMode }: CelebrationModalProps) {
  const [quote] = useState(() => ENCOURAGING_QUOTES[Math.floor(Math.random() * ENCOURAGING_QUOTES.length)]);

  // Confetti particles
  const confettiCount = 50;
  const confetti = Array.from({ length: confettiCount }, (_, i) => i);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          {/* Confetti */}
          {confetti.map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#1e3a8a', '#0d9488', '#7c3aed', '#059669', '#d97706'][i % 5],
                left: `${Math.random() * 100}%`,
                top: '-10px',
              }}
              animate={{
                y: window.innerHeight + 100,
                x: [0, Math.random() * 100 - 50],
                rotate: Math.random() * 360,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative rounded-3xl shadow-2xl p-8 max-w-md w-full ${
              isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'
            }`}
          >
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <X size={20} />
            </button>

            <motion.div
              className="flex justify-center mb-6"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.6,
                times: [0, 0.3, 0.6, 1],
              }}
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <Award size={48} className="text-white" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-2xl font-bold text-center mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Congratulations! 🎉
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-center mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              You completed <span className="font-bold text-teal-500">{habitName}</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className={`p-4 rounded-2xl text-center ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-teal-50 to-emerald-50'
              }`}
            >
              <p className={`text-lg font-medium italic ${
                isDarkMode ? 'text-teal-400' : 'text-teal-700'
              }`}>
                "{quote}"
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
