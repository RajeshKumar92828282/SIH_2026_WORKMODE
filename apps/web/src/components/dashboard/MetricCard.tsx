"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  subtext?: string;
  icon?: LucideIcon;
  variant?: "cyan" | "emerald" | "amber" | "purple" | "neutral";
  badge?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  change,
  changeLabel = "vs 24h ago",
  subtext,
  icon: Icon,
  variant = "cyan",
  badge,
}: MetricCardProps) {
  const isPositive = change !== undefined ? change >= 0 : undefined;

  const variantStyles = {
    cyan: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
    emerald: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    amber: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    purple: "border-purple-500/30 text-purple-400 bg-purple-500/10",
    neutral: "border-slate-700/50 text-slate-400 bg-slate-800/40",
  };

  return (
    <div className="glass-panel glass-card-hover rounded-xl p-4 border border-[#143159] relative overflow-hidden">
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono truncate">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              {badge}
            </span>
          )}
          {Icon && (
            <div className={`p-1.5 rounded-lg border ${variantStyles[variant]}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs font-semibold text-slate-400 font-mono">{unit}</span>}
      </div>

      {/* Footer Info / Delta */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#143159]/60">
        {change !== undefined ? (
          <div className="flex items-center gap-1.5 font-mono">
            <span
              className={`flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-slate-400 text-[11px] truncate">{changeLabel}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px] font-mono">{subtext || "Updated in real-time"}</span>
        )}
      </div>
    </div>
  );
}
