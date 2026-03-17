import { motion } from 'framer-motion';
import { Bell, Moon, Sun } from 'lucide-react';

interface SettingsSectionProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function SettingsSection({ isDarkMode, toggleDarkMode }: SettingsSectionProps) {
  return (
    <div className={`p-8 min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D]' : 'bg-gradient-to-br from-[#F5F7FA] to-[#E8F4F8]'}`}>
      <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#2C3E50]'}`}>
        Settings ⚙️
      </h1>
      <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-[#7F8C8D]'}`}>
        Customize your experience
      </p>

      <div className={`rounded-2xl shadow-lg p-6 ${isDarkMode ? 'bg-[#2D2D2D]' : 'bg-white'}`}>
        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="text-[#A8D8EA]" size={24} /> : <Sun className="text-[#FFB3D9]" size={24} />}
              <div>
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#2C3E50]'}`}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#7F8C8D]'}`}>
                  {isDarkMode ? 'Easy on the eyes' : 'Bright and cheerful'}
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`w-16 h-8 rounded-full p-1 transition-all ${
                isDarkMode ? 'bg-[#A8D8EA]' : 'bg-gray-300'
              }`}
            >
              <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: isDarkMode ? 32 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          <div className={`border-t ${isDarkMode ? 'border-[#444]' : 'border-gray-200'}`} />

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className={isDarkMode ? 'text-[#A8D8EA]' : 'text-[#FFB3D9]'} size={24} />
              <div>
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#2C3E50]'}`}>
                  Notifications
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#7F8C8D]'}`}>
                  Get reminded about your habits
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={`w-16 h-8 rounded-full p-1 transition-all bg-[#A8D8EA]`}
            >
              <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: 32 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          <div className={`border-t ${isDarkMode ? 'border-[#444]' : 'border-gray-200'}`} />

          {/* Account Section */}
          <div>
            <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#2C3E50]'}`}>
              Account
            </h3>
            <div className="space-y-3">
              <button className={`w-full text-left px-4 py-3 rounded-lg ${
                isDarkMode ? 'bg-[#1A1A1A] text-white hover:bg-[#444]' : 'bg-gray-100 hover:bg-gray-200'
              } transition-all`}>
                Change Password
              </button>
              <button className={`w-full text-left px-4 py-3 rounded-lg ${
                isDarkMode ? 'bg-[#1A1A1A] text-white hover:bg-[#444]' : 'bg-gray-100 hover:bg-gray-200'
              } transition-all`}>
                Update Email
              </button>
              <button className={`w-full text-left px-4 py-3 rounded-lg ${
                isDarkMode ? 'bg-[#1A1A1A] text-white hover:bg-[#444]' : 'bg-gray-100 hover:bg-gray-200'
              } transition-all`}>
                Privacy Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
