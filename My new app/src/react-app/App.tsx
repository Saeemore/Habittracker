import { useEffect, useState } from "react";
import LoginPage from "@/react-app/pages/Login";
import HomePage from "@/react-app/pages/Home";
import { ApiError, getAccessToken, setAccessToken } from "@/react-app/lib/api";
import { me, refresh } from "@/react-app/lib/auth";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      try {
        const token = getAccessToken();
        if (!token) {
          try {
            const refreshed = await refresh();
            setAccessToken(refreshed.accessToken);
          } catch {
            // no refresh cookie yet
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

  return <HomePage onLogout={handleLogout} />;
}
