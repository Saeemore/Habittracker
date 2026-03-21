import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";
import { ApiError, setAccessToken } from "@/react-app/lib/api";
import { login, register } from "@/react-app/lib/auth";

interface LoginPageProps {
  onLoginSuccess: (username?: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (!username || !password || (isSignup && !email)) {
        setError("Please fill in all fields");
        return;
      }

      const result = isSignup
        ? await register({ email, username, password })
        : await login({ username, password });

      setAccessToken(result.accessToken);
      onLoginSuccess(result.user.username);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ bottom: '10%', right: '10%' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/20"
      >
        {/* Logo/Character */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="relative"
            animate={
              isLoading
                ? { rotate: 360 }
                : {}
            }
            transition={
              isLoading
                ? { duration: 2, repeat: Infinity, ease: 'linear' }
                : {}
            }
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg relative">
              <TrendingUp size={40} className="text-white" />
              {!isLoading && (
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 20, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Sparkles size={20} className="text-yellow-400" />
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Welcome to HabitFlow
        </h1>
        <p className="text-center text-gray-300 mb-8">
          {isSignup ? "Start your growth journey today" : "Transform yourself, one habit at a time"}
        </p>

        <div className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition-all backdrop-blur-sm"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition-all backdrop-blur-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Password
            </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition-all backdrop-blur-sm"
                disabled={isLoading}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            onClick={handleSubmit}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {isLoading && (
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            )}
            <span className="relative z-10">
              {isLoading ? "Loading..." : isSignup ? "Sign Up" : "Login"}
            </span>
          </motion.button>

          <div className="text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
              disabled={isLoading}
            >
              {isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
