import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Zap, BarChart3 } from 'lucide-react';

interface AnalyticsDashboardProps {
  isDarkMode: boolean;
}

export default function AnalyticsDashboard({ isDarkMode }: AnalyticsDashboardProps) {
  const weeklyData = [
    { day: 'Mon', completed: 4, total: 4 },
    { day: 'Tue', completed: 3, total: 4 },
    { day: 'Wed', completed: 4, total: 4 },
    { day: 'Thu', completed: 4, total: 4 },
    { day: 'Fri', completed: 3, total: 4 },
    { day: 'Sat', completed: 4, total: 4 },
    { day: 'Sun', completed: 2, total: 4 },
  ];

  const categoryStats = [
    { name: 'Fitness', completed: 22, total: 30, color: 'from-rose-500 to-orange-500' },
    { name: 'Wellness', completed: 26, total: 30, color: 'from-teal-500 to-emerald-500' },
    { name: 'Learning', completed: 28, total: 30, color: 'from-blue-500 to-indigo-500' },
    { name: 'Mindfulness', completed: 19, total: 30, color: 'from-purple-500 to-pink-500' },
  ];

  const insights = [
    { icon: TrendingUp, label: 'Best Streak', value: '14 days', color: 'from-teal-500 to-emerald-500' },
    { icon: Calendar, label: 'Active Days', value: '24/30', color: 'from-blue-500 to-cyan-500' },
    { icon: Target, label: 'Completion Rate', value: '85%', color: 'from-purple-500 to-indigo-500' },
    { icon: Zap, label: 'Avg per Day', value: '3.5 habits', color: 'from-orange-500 to-rose-500' },
  ];

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50'
    }`}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className={isDarkMode ? 'text-teal-400' : 'text-teal-600'} size={32} />
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Analytics Dashboard
          </h1>
        </div>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Track your progress and insights
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl shadow-lg p-6 backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-gray-800/50 border border-gray-700' 
                  : 'bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${insight.color} flex items-center justify-center mb-4`}>
                <Icon size={24} className="text-white" />
              </div>
              <p className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {insight.value}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {insight.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Activity Chart */}
      <div className={`rounded-2xl shadow-lg p-8 mb-8 backdrop-blur-sm ${
        isDarkMode 
          ? 'bg-gray-800/50 border border-gray-700' 
          : 'bg-white'
      }`}>
        <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          This Week's Activity
        </h2>
        <div className="flex items-end justify-between gap-4 h-64">
          {weeklyData.map((day, index) => {
            const percentage = (day.completed / day.total) * 100;
            const height = `${percentage}%`;
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-3">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="w-full bg-gradient-to-t from-teal-500 to-blue-600 rounded-t-xl relative group cursor-pointer"
                  style={{ minHeight: '10%' }}
                >
                  <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded text-xs font-semibold ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                  }`}>
                    {day.completed}/{day.total}
                  </div>
                </motion.div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Performance */}
      <div className={`rounded-2xl shadow-lg p-8 backdrop-blur-sm ${
        isDarkMode 
          ? 'bg-gray-800/50 border border-gray-700' 
          : 'bg-white'
      }`}>
        <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Performance by Category
        </h2>
        <div className="space-y-6">
          {categoryStats.map((category, index) => {
            const percentage = (category.completed / category.total) * 100;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {category.name}
                  </h3>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {category.completed}/{category.total} days ({Math.round(percentage)}%)
                  </span>
                </div>
                <div className={`relative h-4 rounded-full overflow-hidden ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`absolute h-full bg-gradient-to-r ${category.color} rounded-full`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
