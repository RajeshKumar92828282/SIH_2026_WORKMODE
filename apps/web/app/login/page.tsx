"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Lock, Mail, ShieldCheck, AlertCircle, Loader2, UserPlus, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { apiClient } from "@/lib/api-client";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { checkAuth } = useAppStore();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("admin@apix.gov.in");
  const [password, setPassword] = useState("Admin@APIx2026!");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.login(email, password);
      await checkAuth();
      router.push("/");
      router.refresh();
    } catch (err: any) {
      const errCode = err.response?.data?.error?.code;
      const errMsg = err.response?.data?.error?.message || "Authentication failed";
      
      if (errCode === "user_not_found") {
        // Switch to register mode with pre-filled email
        setMode("register");
        setError("No account found. Please register below.");
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await apiClient.register(email, password);
      // Registration successful, now auto-login
      await apiClient.login(email, password);
      await checkAuth();
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#003247] p-4 font-mono select-none">
      <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-[rgba(135,214,235,0.3)] space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400"></div>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-display">
            {mode === "login" ? "APIx Institutional Access" : "Create Institutional Account"}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === "login" 
              ? "Reserve Bank of India & NSO Analyst Portal" 
              : "Register as NSO/MoSPI CPI Analyst"}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 border border-red-900/50 rounded-lg p-3 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#071529] border border-[#143159] rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-[#87D6EB]"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#071529] border border-[#143159] rounded-xl pl-9 pr-12 py-2.5 text-white focus:outline-none focus:border-[#87D6EB]"
                required
                disabled={loading}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? <Lock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-slate-400 font-medium mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#071529] border border-[#143159] rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-[#87D6EB]"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#87D6EB] hover:bg-cyan-300 disabled:bg-cyan-500/50 text-[#003247] font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/20 mt-2 text-sm flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <ShieldCheck className="w-4 h-4" />
            <span>
              {loading 
                ? "PROCESSING..." 
                : mode === "login" 
                  ? "AUTHENTICATE SESSION" 
                  : "CREATE ACCOUNT & LOGIN"}
            </span>
          </button>
        </form>

        <div className="pt-3 border-t border-[#143159] text-[11px] text-slate-400 text-center space-y-2">
          {mode === "login" ? (
            <>
              <p>Demo Credentials:</p>
              <p className="text-cyan-400 font-bold">admin@apix.gov.in | Admin@APIx2026!</p>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create New Account</span>
              </button>
            </>
          ) : (
            <>
              <p>Already have an account?</p>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}