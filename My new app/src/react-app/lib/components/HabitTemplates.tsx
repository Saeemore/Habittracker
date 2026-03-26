import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface HabitTemplatesProps {
  isDarkMode: boolean;
  onSelectTemplate: (template: HabitTemplate) => void;
}

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  suggestedTime: string;
  endGoal: string;
  why: string;
}

export default function HabitTemplates({ isDarkMode, onSelectTemplate }: HabitTemplatesProps) {
  const templates: HabitTemplate[] = [];

  const categories = [...new Set(templates.map(t => t.category))];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Fitness': 'from-rose-500 to-orange-500',
      'Wellness': 'from-teal-500 to-emerald-500',
      'Learning': 'from-blue-500 to-indigo-500',
      'Mindfulness': 'from-purple-500 to-pink-500',
      'Social': 'from-cyan-500 to-blue-500',
    };
    return colors[category] || 'from-gray-500 to-slate-500';
  };

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50'
    }`}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className={isDarkMode ? 'text-teal-400' : 'text-teal-600'} size={32} />
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Habit Templates
          </h1>
        </div>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Quick-start your journey with proven habit templates
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button className={`px-4 py-2 rounded-xl font-medium transition-all bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg`}>
          All Templates
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No templates</p>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Templates are disabled so you can test from a clean slate. Create your first habit manually.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className={`rounded-2xl shadow-lg p-6 cursor-pointer transition-all backdrop-blur-sm ${
                isDarkMode ? 'bg-gray-800/50 border border-gray-700 hover:border-gray-600' : 'bg-white hover:shadow-xl'
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{template.icon}</div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {template.category}
                </span>
              </div>

              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{template.name}</h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{template.description}</p>

              <div className={`space-y-2 mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Goal:</span>
                  <span>{template.endGoal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Time:</span>
                  <span>{template.suggestedTime}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-xl font-semibold transition-all bg-gradient-to-r ${getCategoryColor(template.category)} text-white shadow-md hover:shadow-lg`}
              >
                Use This Template
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
