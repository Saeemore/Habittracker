import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { ApiError, getAccessToken, setAccessToken, isTokenExpired } from "./lib/api";
import { type AuthUser, me, refresh } from "./lib/auth";
import {
  clearSession,
  getOnboardingComplete,
  isSessionLoggedIn,
  migrateLegacyLocalDataForUser,
  setSessionLoggedIn,
  setSessionUser,
} from "./lib/storage";

const LoginPage = lazy(() => import("./pages/Login"));
const HomePage = lazy(() => import("./pages/Home"));
const UserOnboarding = lazy(() => import("./lib/components/UserOnboarding"));

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
  const hasBootstrapped = useRef(false);

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
    console.log("App.tsx: useEffect triggered");

    let alive = true;
    let bootstrapFinished = false;

    const bootstrapTimeout = window.setTimeout(() => {
      console.log("App.tsx: bootstrapTimeout fired, alive:", alive, "bootstrapFinished:", bootstrapFinished);
      if (!alive || bootstrapFinished) return;
      resetSessionState();
      setIsBootstrapping(false);
    }, 3000);

    async function bootstrap() {
      console.log("App.tsx: bootstrap starting...");
      try {
        let token = getAccessToken();
        const hadSession = isSessionLoggedIn();
        const previousUsername = localStorage.getItem("username");
        let hasRefreshed = false;
        console.log("App.tsx: initial token:", token, "hadSession:", hadSession);

        // If the token is present but already expired, refresh it first
        if (token && isTokenExpired(token)) {
          console.log("App.tsx: token exists but expired, attempting refresh");
          try {
            const refreshed = await refresh();
            token = refreshed.accessToken;
            setAccessToken(token);
            hasRefreshed = true;
            console.log("App.tsx: refresh success, new token:", token);
          } catch (e) {
            console.log("App.tsx: refresh failed:", e);
            resetSessionState();
            token = null;
          }
        }

        // If no token exists but the session was previously active, try to refresh
        if (!token && hadSession) {
          console.log("App.tsx: no token but had session, attempting refresh");
          try {
            const refreshed = await refresh();
            token = refreshed.accessToken;
            setAccessToken(token);
            hasRefreshed = true;
            console.log("App.tsx: session refresh success, new token:", token);
          } catch (e) {
            console.log("App.tsx: session refresh failed:", e);
            resetSessionState();
            token = null;
          }
        }

        if (token) {
          console.log("App.tsx: token present, calling me()");
          try {
            const result = await me();
            console.log("App.tsx: me() success:", result.user);
            if (alive) applyAuthenticatedUser(result.user, previousUsername);
          } catch (err) {
            console.log("App.tsx: me() failed, err status:", err instanceof ApiError ? err.status : 'non-ApiError', err);
            // If the access token failed with 401, attempt to refresh it once if we haven't already
            if (err instanceof ApiError && err.status === 401 && !hasRefreshed) {
              console.log("App.tsx: attempting HMR/expired token refresh");
              try {
                const refreshed = await refresh();
                setAccessToken(refreshed.accessToken);
                const result = await me();
                console.log("App.tsx: refreshed me() success:", result.user);
                if (alive) applyAuthenticatedUser(result.user, previousUsername);
              } catch (e) {
                console.log("App.tsx: refreshed me() flow failed:", e);
                if (alive) resetSessionState();
              }
            } else {
              if (alive) resetSessionState();
            }
          }
        } else if (alive) {
          console.log("App.tsx: no token, resetting session");
          resetSessionState();
        }
      } catch (e) {
        console.log("App.tsx: top-level bootstrap error caught:", e);
        if (alive) resetSessionState();
      } finally {
        console.log("App.tsx: bootstrap finally blocks running, alive:", alive);
        bootstrapFinished = true;
        window.clearTimeout(bootstrapTimeout);
        if (alive) setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      console.log("App.tsx: useEffect cleanup function running");
      alive = false;
      window.clearTimeout(bootstrapTimeout);
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
    return <ScreenLoader message="Loading your dashboard..." />;
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
