import { motion } from 'framer-motion';
import { Home, TrendingUp, CheckCircle, Award, User, Settings, LogOut, Zap, Sun, Moon } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  activeSection,
  setActiveSection,
  isDarkMode,
  toggleDarkMode,
  onLogout
}: SidebarProps) {
  const username = localStorage.getItem('username') || 'User';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'habits', label: 'Habits', icon: CheckCircle },
    { id: 'progress', label: 'Insights', icon: TrendingUp },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  /* ── theme tokens — matching Dashboard / Profile / HabitsSection ──────── */
  const bg = isDarkMode ? 'bg-[#111111]' : 'bg-white';
  const border = isDarkMode ? 'border-white/5' : 'border-gray-200';
  const divider = isDarkMode ? 'border-white/5' : 'border-gray-100';
  const txt = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-500' : 'text-gray-400';
  const hov = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50';

  return (
    <div className={`w-64 h-screen fixed left-0 top-0 border-r flex flex-col overflow-y-auto transition-all duration-300 ${bg} ${border}`}>

      {/* ── Logo ─────────────────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b ${divider}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
          <Zap size={17} className="text-white fill-white" />
        </div>
        <span className={`font-black text-lg tracking-tight ${txt}`}>HabitAI</span>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────────── */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${active
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                  : `${muted} ${hov}`
                }`}
            >
              <Icon size={19} className="flex-shrink-0" />
              <span className={`text-sm font-semibold ${active ? 'text-white' : ''}`}>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* ── Bottom section ────────────────────────────────────────────────────── */}
      <div className={`p-3 border-t space-y-2 ${divider}`}>

        {/* Settings */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveSection('settings')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${activeSection === 'settings'
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
              : `${muted} ${hov}`
            }`}
        >
          <Settings size={19} className="flex-shrink-0" />
          <span className={`text-sm font-semibold ${activeSection === 'settings' ? 'text-white' : ''}`}>Settings</span>
        </motion.button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isDarkMode
              ? 'bg-white/5 text-gray-300 hover:bg-white/10'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
        >
          {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* User + Logout */}
        <div className={`flex items-center gap-3 p-2 rounded-xl border ${isDarkMode ? 'border-white/5 bg-[#0a0a0a]' : 'border-gray-100 bg-gray-50'}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-md shadow-green-500/20">
            {username[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold truncate ${txt}`}>{username}</p>
            <p className={`text-[10px] ${muted}`}>Level 12</p>
          </div>
          <button
            onClick={onLogout}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${isDarkMode
                ? 'text-red-400 hover:bg-red-500/15'
                : 'text-red-500 hover:bg-red-50'
              }`}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
