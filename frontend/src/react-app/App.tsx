import { useEffect, useState } from "react";
import LoginPage from "@/react-app/pages/Login";
import HomePage from "@/react-app/pages/Home";
import UserOnboarding from "@/react-app/lib/components/UserOnboarding";
import { ApiError, getAccessToken, setAccessToken } from "@/react-app/lib/api";
import { me, refresh } from "@/react-app/lib/auth";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isDarkMode] = useState(false);

  useEffect(() => {
    let alive = true;
    let bootstrapFinished = false;

    const bootstrapTimeout = window.setTimeout(() => {
      if (!alive || bootstrapFinished) return;
      setAccessToken(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      setIsLoggedIn(false);
      setIsBootstrapping(false);
    }, 9000);

    async function bootstrap() {
      try {
        const token = getAccessToken();
        const hadSession = localStorage.getItem("isLoggedIn") === "true";

        if (!token && hadSession) {
          try {
            const refreshed = await refresh();
            setAccessToken(refreshed.accessToken);
          } catch {
            // stale local session marker or missing refresh cookie
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("username");
          }
        }

        if (getAccessToken()) {
          await me();
          if (alive) setIsLoggedIn(true);
        } else if (alive) {
          setIsLoggedIn(false);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setAccessToken(null);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("username");
          if (alive) setIsLoggedIn(false);
        } else {
          setAccessToken(null);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("username");
          if (alive) setIsLoggedIn(false);
        }
      } finally {
        bootstrapFinished = true;
        window.clearTimeout(bootstrapTimeout);
        if (alive) setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      alive = false;
      window.clearTimeout(bootstrapTimeout);
    };
  }, []);

  const handleLoginSuccess = (username?: string) => {
    if (username) localStorage.setItem("username", username);
    localStorage.setItem("isLoggedIn", "true");
    const alreadyOnboarded = localStorage.getItem("onboardingComplete") === "true";
    setNeedsOnboarding(!alreadyOnboarded);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setAccessToken(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/25">
            <div className="w-6 h-6 rounded-full border-4 border-white/40 border-t-white animate-spin" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900">Trackify</p>
            <p className="text-sm text-gray-500 mt-1">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (needsOnboarding) {
    return (
      <UserOnboarding
        isDarkMode={isDarkMode}
        onComplete={() => setNeedsOnboarding(false)}
      />
    );
  }

  return <HomePage onLogout={handleLogout} />;
}
