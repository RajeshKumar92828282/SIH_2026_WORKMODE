"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Bell, LogOut, User } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { session, isAuthenticated, logout } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/dashboard", label: "DASHBOARD" },
    { href: "/routes", label: "ROUTES" },
    { href: "/lead-time", label: "LEAD-TIME" },
    { href: "/airlines", label: "AIRLINES" },
    { href: "/heatmap", label: "HEATMAP" },
    { href: "/methodology", label: "METHODOLOGY" },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  if (!mounted) {
    return (
      <header className="w-full h-16 bg-[#002636]/45 backdrop-blur-2xl border-b border-[rgba(135,214,235,0.18)] shadow-[0_4px_30px_rgba(0,0,0,0.35)] flex items-center justify-between px-6 md:px-10 z-50 sticky top-0 font-mono">
        <a href="/" className="flex items-center gap-3 group no-underline">
          <div className="w-2.5 h-2.5 rounded-full bg-[#87D6EB] animate-pulse"></div>
          <span className="text-xs uppercase tracking-widest font-semibold text-white group-hover:text-[#87D6EB] transition-colors">
            APIX SYSTEM
          </span>
        </a>
      </header>
    );
  }

  return (
    <header className="w-full h-16 bg-[#002636]/45 backdrop-blur-2xl border-b border-[rgba(135,214,235,0.18)] shadow-[0_4px_30px_rgba(0,0,0,0.35)] flex items-center justify-between px-6 md:px-10 z-50 sticky top-0 font-mono">
      {/* Left: Brand */}
      <a href="/" className="flex items-center gap-3 group no-underline">
        <div className="w-2.5 h-2.5 rounded-full bg-[#87D6EB] animate-pulse"></div>
        <span className="text-xs uppercase tracking-widest font-semibold text-white group-hover:text-[#87D6EB] transition-colors">
          APIX SYSTEM
        </span>
      </a>

      {/* Center: Nav Links */}
      <nav className="hidden lg:flex items-center gap-8 text-xs font-mono">
        {navLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`nav-link tracking-wider uppercase transition-colors relative py-1 group/nav ${
              pathname === item.href ? "text-[#87D6EB] font-bold" : "text-white/90 hover:text-[#87D6EB]"
            }`}
          >
            {item.label}
            <span
              className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#87D6EB] shadow-[0_0_10px_#87D6EB] transition-transform duration-300 origin-center ${
                pathname === item.href ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"
              }`}
            />
          </a>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <a
          href="/alerts"
          className="relative w-10 h-10 rounded-full border border-[rgba(135,214,235,0.35)] hover:border-[#87D6EB] text-white hover:text-[#87D6EB] bg-[#002636]/40 hover:bg-[#87D6EB]/10 transition-all flex items-center justify-center group cursor-pointer"
          title="Volatility & Anomaly Alerts"
        >
          <Bell className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-[9px] font-bold font-mono text-white rounded-full border-2 border-[#002636] shadow-[0_0_8px_rgba(255,82,82,0.8)] flex items-center justify-center animate-pulse">
            2
          </span>
        </a>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#002636]/40 border border-[rgba(135,214,235,0.2)] text-xs font-mono text-white/80">
                <User className="w-3.5 h-3.5 text-[#87D6EB]" />
                <span className="text-white/90 font-mono text-[11px]">
                  {session?.email?.split("@")[0] || "USER"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1.5" />
              </div>
              <button
                onClick={handleLogout}
                className="border border-[rgba(135,214,235,0.4)] hover:border-[#87D6EB] px-3 py-1.5 flex items-center gap-2 group hover:bg-[#87D6EB] hover:text-[#003247] transition-all text-xs font-mono tracking-wider font-semibold text-white no-underline rounded"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOGOUT</span>
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="border border-[rgba(135,214,235,0.4)] hover:border-[#87D6EB] px-4 py-2 flex items-center gap-3 group hover:bg-[#87D6EB] hover:text-[#003247] transition-all text-xs font-mono tracking-wider font-semibold text-white no-underline rounded"
            >
              <span>INSTITUTIONAL ACCESS</span>
              <div className="w-2.5 h-2.5 bg-[#87D6EB] group-hover:bg-[#003247] transition-colors"></div>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
