import { Suspense, useEffect, useState } from "react";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import UserOnboarding from "./lib/components/UserOnboarding";
import { ApiError, getAccessToken, isTokenExpired, setAccessToken } from "./lib/api";
import { AuthUser, me, refresh } from "./lib/auth";
import {
  clearSession,
  getOnboardingComplete,
  isSessionLoggedIn,
  migrateLegacyLocalDataForUser,
  setSessionLoggedIn,
  setSessionUser,
} from "./lib/storage";

function ScreenLoader({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/25">
          <div className="w-6 h-6 rounded-full border-4 border-white/40 border-t-white animate-spin" />
        </div>
        <div>
          <p className="text-lg font-black text-gray-900">Trackify</p>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isDarkMode] = useState(false);

  const applyAuthenticatedUser = (user: AuthUser, previousUsername?: string | null) => {
    migrateLegacyLocalDataForUser(user, previousUsername);
    setSessionUser(user);
    setSessionLoggedIn(true);
    setNeedsOnboarding(!getOnboardingComplete(user));
    setIsLoggedIn(true);
  };

  const resetSessionState = () => {
    setAccessToken(null);
    clearSession();
    setNeedsOnboarding(false);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      try {
        let token = getAccessToken();
        const hadSession = isSessionLoggedIn();
        const previousUsername = localStorage.getItem("username");
        let hasRefreshed = false;

        if (token && isTokenExpired(token)) {
          try {
            const refreshed = await refresh();
            token = refreshed.accessToken;
            setAccessToken(token);
            hasRefreshed = true;
          } catch {
            if (alive) resetSessionState();
            token = null;
          }
        }

        if (!token && hadSession) {
          try {
            const refreshed = await refresh();
            token = refreshed.accessToken;
            setAccessToken(token);
            hasRefreshed = true;
          } catch {
            if (alive) resetSessionState();
            token = null;
          }
        }

        if (token) {
          try {
            const result = await me();
            if (alive) applyAuthenticatedUser(result.user, previousUsername);
          } catch (err) {
            if (err instanceof ApiError && err.status === 401 && !hasRefreshed) {
              try {
                const refreshed = await refresh();
                setAccessToken(refreshed.accessToken);
                const result = await me();
                if (alive) applyAuthenticatedUser(result.user, previousUsername);
              } catch {
                if (alive) resetSessionState();
              }
            } else if (alive) {
              resetSessionState();
            }
          }
        } else if (alive) {
          resetSessionState();
        }
      } catch {
        if (alive) resetSessionState();
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      alive = false;
    };
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    const previousUsername = localStorage.getItem("username");
    applyAuthenticatedUser(user, previousUsername);
  };

  const handleLogout = () => {
    resetSessionState();
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
    return (
      <Suspense fallback={<ScreenLoader message="Loading sign in..." />}>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </Suspense>
    );
  }

  if (needsOnboarding) {
    return (
      <Suspense fallback={<ScreenLoader message="Preparing onboarding..." />}>
        <UserOnboarding
          isDarkMode={isDarkMode}
          onComplete={() => setNeedsOnboarding(false)}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<ScreenLoader message="Opening your workspace..." />}>
      <HomePage onLogout={handleLogout} />
    </Suspense>
  );
}
