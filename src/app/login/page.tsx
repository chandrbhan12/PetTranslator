"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PawPrint, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const animal = searchParams.get("animal") || "dog";

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const body = isLogin
        ? { email, password }
        : { name, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Save token and user data to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess(isLogin ? "Login successful!" : "Account created!");

      // Redirect: signup → profile, login → translate
      setTimeout(() => {
        if (isLogin) {
          router.push(`/translate?animal=${animal}`);
        } else {
          router.push("/profile");
        }
      }, 1000);
    } catch (err: any) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
      {/* Background glowing effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[100px]" />
      </div>

      {/* Back Button */}
      <nav className="relative z-10 px-4 sm:px-6 py-4 sm:py-6 max-w-md mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </nav>

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 sm:px-6 pb-10">
        <div className="w-full max-w-md">
          
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 relative flex items-center justify-center mb-4 rounded-full overflow-hidden bg-white/5 ring-4 ring-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              <img src="/animal.png" alt="Pet Translator Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isLogin ? "Sign in to translate animal sounds" : "Join Pet Translator to get started"}
            </p>
          </div>

          {/* Card */}
          <div className="relative rounded-3xl overflow-hidden">
            {/* Border gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.1] to-white/[0.03] rounded-3xl" />
            <div className="absolute inset-[1px] rounded-3xl bg-[#0a0a12]" />

            <div className="relative z-10 p-6 sm:p-8">
              {/* Toggle Tabs */}
              <div className="flex bg-white/5 rounded-xl p-1 mb-6">
                <button
                  onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isLogin ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    !isLogin ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm px-4 py-3 rounded-xl mb-4"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm px-4 py-3 rounded-xl mb-4"
                  >
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative mb-4">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required={!isLogin}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Forgot Password */}
                {isLogin && (
                  <div className="text-right">
                    <button type="button" className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Please wait...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-gray-600 text-xs">or continue with</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </button>
              </div>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-center text-gray-600 text-xs mt-6">
            By continuing, you agree to our <span className="text-gray-400">Terms</span> and <span className="text-gray-400">Privacy Policy</span>
          </p>
        </div>
      </main>
    </div>
  );
}
