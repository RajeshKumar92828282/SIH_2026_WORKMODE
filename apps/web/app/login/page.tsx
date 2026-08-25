"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Lock, Mail, ShieldCheck, Key } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const [email, setEmail] = useState("arvind.s@rbi.org.in");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState<"institutional_consumer" | "admin" | "analyst">("institutional_consumer");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      login({
        name: email.includes("admin") ? "System Admin" : "Dr. Arvind Subramanian",
        email,
        role: email.includes("admin") ? "admin" : role,
        organization: email.includes("admin")
          ? "Ministry of Statistics & Programme Implementation (MoSPI)"
          : "Reserve Bank of India — Monetary Policy Dept",
        apiKey: "apix_live_sec_89df2019a84b0e"
      });
      setLoading(false);
      router.push("/");
    }, 400);
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-display">APIx Institutional Access</h1>
          <p className="text-xs text-slate-400">Reserve Bank of India & NSO Analyst Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
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
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Session Key / Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#071529] border border-[#143159] rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-[#87D6EB]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Institutional Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-[#071529] border border-[#143159] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#87D6EB]"
            >
              <option value="institutional_consumer">RBI Monetary Policy Consumer</option>
              <option value="analyst">NSO / MoSPI CPI Analyst</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#87D6EB] hover:bg-cyan-300 text-[#003247] font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/20 mt-2 text-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? "AUTHENTICATING..." : "AUTHENTICATE SESSION"}</span>
          </button>
        </form>

        <div className="pt-3 border-t border-[#143159] text-[11px] text-slate-400 text-center space-y-1">
          <p>Demo Preset Credentials:</p>
          <p className="text-cyan-400 font-bold">arvind.s@rbi.org.in | admin@apix.gov.in</p>
        </div>
      </div>
    </div>
  );
}
