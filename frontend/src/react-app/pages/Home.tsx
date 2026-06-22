import { Suspense, lazy, useEffect, useState } from 'react';
import Sidebar from '../lib/components/Sidebar';
import { getSessionUser, type SessionUser } from '../lib/storage';
import Dashboard from '../lib/components/Dashboard';
import AIChat from '../lib/components/AIChat';

const ProgressSection = lazy(() => import('../lib/components/ProgressSection'));
const HabitsSection = lazy(() => import('../lib/components/HabitsSection'));
const AchievementsSection = lazy(() => import('../lib/components/AchievementsSection'));
const SettingsSection = lazy(() => import('../lib/components/SettingsSection'));
const ProfileSection = lazy(() => import('../lib/components/ui/Profile'));

interface HomePageProps {
  onLogout: () => void;
}

export default function HomePage({ onLogout }: HomePageProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(() => getSessionUser());

  const handleUserUpdate = (updatedUser: SessionUser) => {
    setCurrentUser(updatedUser);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const sectionFallback = (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-28 rounded-3xl bg-gray-200" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="h-64 rounded-3xl bg-gray-200 xl:col-span-2" />
          <div className="h-64 rounded-3xl bg-gray-200" />
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const warmupTimer = window.setTimeout(() => {
      void import('../lib/components/HabitsSection');
    }, 1200);
    return () => window.clearTimeout(warmupTimer);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard isDarkMode={isDarkMode} setActiveSection={setActiveSection} />;

      case 'progress':
        return <ProgressSection isDarkMode={isDarkMode} setActiveSection={setActiveSection} />;
      case 'habits':
        return <HabitsSection isDarkMode={isDarkMode} setActiveSection={setActiveSection} />;
      case 'achievements':
        return <AchievementsSection isDarkMode={isDarkMode} setActiveSection={setActiveSection} />;
      case 'settings':
        return <SettingsSection isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
      case 'profile':
        return (
          <ProfileSection
            isDarkMode={isDarkMode}
            setActiveSection={setActiveSection}
            currentUser={currentUser}
            onUserUpdate={handleUserUpdate}
          />
        );
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
        username={currentUser?.username || 'User'}
      />
      <div className="ml-64 w-full">
        <Suspense fallback={sectionFallback}>
          {renderSection()}
        </Suspense>
      </div>
      <AIChat isDarkMode={isDarkMode} />
    </div>
  );
}
