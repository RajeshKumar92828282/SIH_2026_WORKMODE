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
  LogOut
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "Index Overview", icon: TrendingUp, badge: "LIVE" },
  { href: "/routes", label: "Route Trends", icon: Plane, badge: "6 Baskets" },
  { href: "/lead-time", label: "Lead-Time Analysis", icon: Clock, badge: "T+1 vs T+15" },
  { href: "/airlines", label: "Airline Comparison", icon: Building2, badge: "5 Carriers" },
  { href: "/heatmap", label: "India Heatmap", icon: Map, badge: "Regional" },
  { href: "/data-explorer", label: "Data Explorer", icon: Database, badge: "Raw & Filtered" },
  { href: "/alerts", label: "Spikes & Alerts", icon: Bell, badge: "2 Active" },
  { href: "/api-access", label: "API & Dev Access", icon: Key, badge: "v1.4" },
  { href: "/methodology", label: "Methodology", icon: BookOpen, badge: "CPI Formula" },
  { href: "/telemetry-3d", label: "3D Flight Telemetry", icon: Compass, badge: "CFD Stream" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarCollapsed, toggleSidebar, session, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const displayName = session ? session.name.split(" ")[0] : "Analyst";
  const displayOrg = session ? session.organization : "Institutional Portal";

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-[#071529]/95 backdrop-blur-md border-r border-[#143159] transition-all duration-300 flex flex-col justify-between ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#143159]">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Plane className="w-5 h-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-wider text-white font-display">APIx</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-semibold border border-cyan-500/30">
                    INDIA
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[130px]">Airfare Price Index</p>
              </div>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#143159]/60 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/20"
                    : "text-slate-300 hover:text-white hover:bg-[#0e264a]/70"
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-300"}`} />
                {!isSidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold border ${
                          isActive
                            ? "bg-cyan-500/30 text-cyan-200 border-cyan-400/40"
                            : "bg-[#143159]/70 text-slate-400 border-slate-700/50"
                        }`}
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

      {/* Bottom User / Session Section */}
      <div className="p-3 border-t border-[#143159] bg-[#040d1a]/80 font-mono">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                RBI
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">{displayName}</div>
                <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  INSTITUTIONAL
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#143159]/60 transition-colors"
              title="Sign Out / End Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:text-rose-400 font-bold text-xs"
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
