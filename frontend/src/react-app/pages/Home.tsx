import { useState } from 'react';
import Sidebar from '../lib/components/Sidebar';
import Dashboard from '../lib/components/Dashboard';
import ProgressSection from '../lib/components/ProgressSection';
import HabitsSection from '../lib/components/HabitsSection';
import AchievementsSection from '../lib/components/AchievementsSection';
import SettingsSection from '../lib/components/SettingsSection';
<<<<<<< Updated upstream
// import AnalyticsDashboard from '../components/AnalyticsDashboard'
=======
// import AnalyticsDashboard from './components/AnalyticsDashboard'
>>>>>>> Stashed changes
import AIChat from '../lib/components/AIChat';
import ProfileSection from '../lib/components/ui/Profile';

interface HomePageProps {
  onLogout: () => void;
}

export default function HomePage({ onLogout }: HomePageProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard isDarkMode={isDarkMode} setActiveSection={setActiveSection} />;

      case 'progress':
        return <ProgressSection isDarkMode={isDarkMode} />;
      case 'habits':
        return <HabitsSection isDarkMode={isDarkMode} />;
      case 'achievements':
        return <AchievementsSection isDarkMode={isDarkMode} />;
      case 'settings':
        return <SettingsSection isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
      case 'profile':
        return <ProfileSection isDarkMode={isDarkMode} setActiveSection={setActiveSection} />;
      default:
        return <Dashboard isDarkMode={isDarkMode} setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className={`flex ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onLogout={onLogout}
      />
      <div className="ml-64 w-full">
        {renderSection()}
      </div>
      <AIChat isDarkMode={isDarkMode} />
    </div>
  );
}
