"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plane,
  TrendingUp,
  Clock,
  Building2,
  Map,
  Database,
  Bell,
  Key,
  BookOpen,
  ShieldCheck,
  Compass,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const navItems = [
  { href: "/",             label: "Home Portal",        icon: Home,      badge: "PUBLIC"       },
  { href: "/dashboard",   label: "Index Overview",     icon: TrendingUp, badge: "LIVE"         },
  { href: "/routes",      label: "Route Trends",        icon: Plane,      badge: "6 Baskets"    },
  { href: "/lead-time",   label: "Lead-Time Analysis",  icon: Clock,      badge: "T+1 vs T+15"  },
  { href: "/airlines",    label: "Airline Comparison",  icon: Building2,  badge: "5 Carriers"   },
  { href: "/heatmap",     label: "India Heatmap",       icon: Map,        badge: "Regional"     },
  { href: "/data-explorer", label: "Data Explorer",    icon: Database,   badge: "Raw & Filtered"},
  { href: "/alerts",      label: "Spikes & Alerts",     icon: Bell,       badge: "2 Active"     },
  { href: "/api-access",  label: "API & Dev Access",    icon: Key,        badge: "v1.4"         },
  { href: "/methodology", label: "Methodology",         icon: BookOpen,   badge: "CPI Formula"  },
  { href: "/telemetry-3d",label: "3D Flight Telemetry", icon: Compass,    badge: "CFD Stream"   },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { isSidebarCollapsed, toggleSidebar, session, logout } = useAppStore();

  if (pathname === "/" || pathname === "/login") return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const displayName = session ? session.name.split(" ")[0] : "Analyst";

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col justify-between transition-all duration-300 ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}
      style={{
        background: "#0B1726",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* ── Brand Header ─────────────────────────────────────────── */}
      <div>
        <div
          className="h-16 px-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #00B8D9 0%, #0084A8 100%)" }}
            >
              <Plane className="w-4 h-4 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <span
                    className="font-extrabold text-base tracking-wider leading-none"
                    style={{ color: "#FFFFFF" }}
                  >
                    APIX
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                    style={{
                      background: "rgba(0,184,217,0.15)",
                      color: "#00B8D9",
                      border: "1px solid rgba(0,184,217,0.3)",
                    }}
                  >
                    INDIA
                  </span>
                </div>
                <p className="text-[10px] mt-0.5 truncate" style={{ color: "#7B8A9A" }}>
                  Airfare Price Index
                </p>
              </div>
            )}
          </Link>

          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "#7B8A9A" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "#7B8A9A";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            {isSidebarCollapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft  className="w-4 h-4" />
            }
          </button>
        </div>

        {/* ── Navigation ─────────────────────────────────────────── */}
        <nav className="p-2.5 space-y-0.5 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isSidebarCollapsed ? item.label : undefined}
                className="sidebar-item-active flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all relative group"
                style={{
                  background:  isActive ? "#12344A" : "transparent",
                  color:       isActive ? "#00B8D9" : "#B8C7D9",
                  borderLeft:  isActive ? "3px solid #00B8D9" : "3px solid transparent",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#102B40";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#FFFFFF";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#B8C7D9";
                  }
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isActive ? "#00B8D9" : "#7B8A9A" }}
                />
                {!isSidebarCollapsed && (
                  <div className="flex items-center justify-between w-full overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-semibold ml-1 shrink-0"
                        style={
                          isActive
                            ? { background: "rgba(0,184,217,0.15)", color: "#00B8D9", border: "1px solid rgba(0,184,217,0.25)" }
                            : { background: "rgba(255,255,255,0.05)", color: "#7B8A9A", border: "1px solid rgba(255,255,255,0.08)" }
                        }
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── User Footer ──────────────────────────────────────────── */}
      <div
        className="p-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "#091422" }}
      >
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                style={{ background: "rgba(0,184,217,0.15)", color: "#00B8D9", border: "1px solid rgba(0,184,217,0.25)" }}
              >
                RBI
              </div>
              <div className="truncate">
                <div className="text-[13px] font-semibold truncate" style={{ color: "#FFFFFF" }}>
                  {displayName}
                </div>
                <div className="text-[10px] flex items-center gap-1" style={{ color: "#7B8A9A" }}>
                  <ShieldCheck className="w-3 h-3" style={{ color: "#16C7A3" }} />
                  INSTITUTIONAL
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "#7B8A9A" }}
              title="Sign Out"
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#EF5B5B"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#7B8A9A"; }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(0,184,217,0.15)", color: "#00B8D9" }}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
