import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";
import { ApiError, setAccessToken } from "../lib/api";
import { type AuthUser, login, register, forgotPassword, resetPassword } from "../lib/auth";

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      onLoginSuccess(result.user);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await forgotPassword(email);
      setSuccessMessage("Code sent! Check backend console / password_reset_log.txt");
      setResetStep(2);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to send code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email || !verificationCode || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (verificationCode.length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await resetPassword(email, verificationCode, password);
      setSuccessMessage("Password reset successful! You can now log in.");
      setTimeout(() => {
        setIsForgotPassword(false);
        setResetStep(1);
        setVerificationCode("");
        setPassword("");
        setSuccessMessage("");
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Failed to reset password. Please verify the code.");
    } finally {
      setIsLoading(false);
    }
  };

  // IF FORGOT PASSWORD MODE
  if (isForgotPassword) {
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
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg relative">
              <TrendingUp size={40} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Reset Password
          </h1>
          <p className="text-center text-gray-300 mb-8">
            {resetStep === 1 ? "Request a verification code by email" : "Enter the verification code and your new password"}
          </p>

          <div className="space-y-4">
            {resetStep === 1 ? (
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
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl cursor-not-allowed backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">6-Digit Code</label>
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition-all backdrop-blur-sm"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition-all backdrop-blur-sm"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            {successMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 text-sm text-center bg-green-500/10 py-2 rounded-lg"
              >
                {successMessage}
              </motion.p>
            )}

            <motion.button
              onClick={resetStep === 1 ? handleSendCode : handleResetPassword}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : resetStep === 1 ? "Send Reset Code" : "Reset Password"}
            </motion.button>

            <div className="text-center">
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setError("");
                  setSuccessMessage("");
                }}
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors text-sm font-bold"
                disabled={isLoading}
              >
                Back to Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // STANDARD LOGIN RETURN
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
          Welcome to Trackify
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

          <div className="flex flex-col gap-2 text-center mt-4">
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

            {!isSignup && (
              <button
                onClick={() => {
                  setIsForgotPassword(true);
                  setError("");
                  setSuccessMessage("");
                  setResetStep(1);
                  setVerificationCode("");
                  setPassword("");
                }}
                className="text-teal-400/80 hover:text-teal-300 text-sm font-medium transition-colors mt-1"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
