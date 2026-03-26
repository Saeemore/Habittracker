import { useEffect, useRef, useState } from "react";
import LoginPage from "@/react-app/pages/Login";
import HomePage from "@/react-app/pages/Home";
import UserOnboarding from "@/react-app/components/UserOnboarding";
import { ApiError, getAccessToken, setAccessToken } from "@/react-app/lib/api";
import { me, refresh } from "@/react-app/lib/auth";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isDarkMode] = useState(false);
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    let alive = true;

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
          if (alive) setIsLoggedIn(false);
        } else {
          setAccessToken(null);
          if (alive) setIsLoggedIn(false);
        }
      } finally {
        if (alive) setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      alive = false;
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

  if (isBootstrapping) return null;

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
