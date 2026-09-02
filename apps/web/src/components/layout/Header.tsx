"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Bell, LogOut, User } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { session, isAuthenticated, logout } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const navLinks = [
    { href: "/",             label: "Home"        },
    { href: "/dashboard",    label: "Dashboard"   },
    { href: "/routes",       label: "Routes"      },
    { href: "/lead-time",    label: "Lead-Time"   },
    { href: "/airlines",     label: "Airlines"    },
    { href: "/heatmap",      label: "Heatmap"     },
    { href: "/methodology",  label: "Methodology" },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const headerStyle: React.CSSProperties = {
    background: "#FFFFFF",
    borderBottom: "1px solid #D9E2EC",
    boxShadow: "0 1px 4px rgba(23,43,77,0.06)",
  };

  if (!mounted) {
    return (
      <header
        className="w-full h-14 flex items-center justify-between px-6 md:px-8 z-50 sticky top-0"
        style={headerStyle}
      >
        <a href="/" className="flex items-center gap-2 no-underline">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#00B8D9" }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#172B4D" }}>
            APIX SYSTEM
          </span>
        </a>
      </header>
    );
  }

  return (
    <header
      className="w-full h-14 flex items-center justify-between px-6 md:px-8 z-50 sticky top-0"
      style={headerStyle}
    >
      {/* ── Brand ─────────────────────────────────────────── */}
      <a href="/" className="flex items-center gap-2 no-underline group">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "#00B8D9" }}
        />
        <span
          className="text-xs font-bold tracking-widest uppercase transition-colors group-hover:opacity-80"
          style={{ color: "#172B4D" }}
        >
          APIX SYSTEM
        </span>
      </a>

      {/* ── Centre Nav ────────────────────────────────────── */}
      <nav className="hidden lg:flex items-center gap-6">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className="relative text-[13px] font-medium transition-colors pb-0.5"
              style={{
                color:       isActive ? "#00B8D9" : "#526579",
                fontWeight:  isActive ? 600 : 500,
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "#172B4D";
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "#526579";
              }}
            >
              {item.label}
              {/* Active underline */}
              <span
                className="absolute bottom-0 left-0 w-full transition-transform duration-200"
                style={{
                  height:           "2px",
                  background:       "#00B8D9",
                  borderRadius:     "2px",
                  transform:        isActive ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin:  "left",
                }}
              />
            </a>
          );
        })}
      </nav>

      {/* ── Right Actions ─────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Alerts */}
        <a
          href="/alerts"
          title="Alerts"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "#526579", border: "1px solid #D9E2EC" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "#F5F8FB";
            (e.currentTarget as HTMLAnchorElement).style.color = "#172B4D";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            (e.currentTarget as HTMLAnchorElement).style.color = "#526579";
          }}
        >
          <Bell className="w-4 h-4" style={{ color: "#F5A623" }} />
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
            style={{ background: "#EF5B5B", border: "2px solid #FFFFFF" }}
          >
            2
          </span>
        </a>

        {/* User / Auth */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium"
              style={{ background: "#F5F8FB", border: "1px solid #D9E2EC", color: "#526579" }}
            >
              <User className="w-3.5 h-3.5" style={{ color: "#00B8D9" }} />
              <span style={{ color: "#172B4D" }}>
                {session?.email?.split("@")[0] || "USER"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#16C7A3" }} />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
              style={{ background: "#F5F8FB", border: "1px solid #D9E2EC", color: "#526579" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = "#EF5B5B";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#EF5B5B";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = "#526579";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#D9E2EC";
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors no-underline"
            style={{ background: "#00B8D9", color: "#FFFFFF" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#0099B5"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#00B8D9"; }}
          >
            Institutional Access
          </a>
        )}
      </div>
    </header>
  );
}
