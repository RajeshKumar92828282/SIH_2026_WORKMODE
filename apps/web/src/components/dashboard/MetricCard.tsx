"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title:        string;
  value:        string | number;
  unit?:        string;
  change?:      number;
  changeLabel?: string;
  subtext?:     string;
  icon?:        LucideIcon;
  variant?:     "cyan" | "emerald" | "amber" | "purple" | "neutral";
  badge?:       string;
}

// Accent tokens per variant
const VARIANT: Record<string, { accent: string; bg: string; border: string; badgeBg: string; badgeText: string }> = {
  cyan:    { accent: "#00B8D9", bg: "rgba(0,184,217,0.08)",    border: "rgba(0,184,217,0.25)",    badgeBg: "rgba(0,184,217,0.10)",  badgeText: "#007A99" },
  emerald: { accent: "#16C7A3", bg: "rgba(22,199,163,0.08)",   border: "rgba(22,199,163,0.25)",   badgeBg: "rgba(22,199,163,0.10)", badgeText: "#0D8A73" },
  amber:   { accent: "#F5A623", bg: "rgba(245,166,35,0.08)",   border: "rgba(245,166,35,0.25)",   badgeBg: "rgba(245,166,35,0.10)", badgeText: "#9A6A00" },
  purple:  { accent: "#8B5CF6", bg: "rgba(139,92,246,0.08)",   border: "rgba(139,92,246,0.25)",   badgeBg: "rgba(139,92,246,0.10)", badgeText: "#6029C8" },
  neutral: { accent: "#526579", bg: "rgba(82,101,121,0.06)",   border: "rgba(82,101,121,0.18)",   badgeBg: "rgba(82,101,121,0.08)", badgeText: "#526579" },
};

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
  const v = VARIANT[variant] || VARIANT.cyan;

  return (
    <div
      className="apix-card apix-card-hover p-5 relative overflow-hidden"
      style={{ background: "#FFFFFF" }}
    >
      {/* Subtle top accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]"
        style={{ background: v.accent }}
      />

      {/* ── Top Row ── */}
      <div className="flex items-start justify-between mb-4 mt-1">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider leading-tight"
          style={{ color: "#526579" }}
        >
          {title}
        </span>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {badge && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: v.badgeBg,
                color:      v.badgeText,
                border:     `1px solid ${v.border}`,
              }}
            >
              {badge}
            </span>
          )}
          {Icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: v.bg, border: `1px solid ${v.border}` }}
            >
              <Icon className="w-4 h-4" style={{ color: v.accent }} />
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Value — MUST be dark navy, highly visible ── */}
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className="text-[32px] leading-none font-extrabold tracking-tight"
          style={{
            color:      "#172B4D",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 800,
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-[11px] font-semibold"
            style={{ color: "#7B8A9A" }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* ── Footer / Delta ── */}
      <div
        className="flex items-center pt-3"
        style={{ borderTop: "1px solid #EAF0F5" }}
      >
        {change !== undefined ? (
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: isPositive ? "rgba(22,199,163,0.10)" : "rgba(239,91,91,0.10)",
                color:      isPositive ? "#0D8A73"               : "#C0392B",
                border:     `1px solid ${isPositive ? "rgba(22,199,163,0.25)" : "rgba(239,91,91,0.25)"}`,
              }}
            >
              {isPositive
                ? <ArrowUpRight className="w-3 h-3" />
                : <ArrowDownRight className="w-3 h-3" />
              }
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-[11px]" style={{ color: "#7B8A9A" }}>
              {changeLabel}
            </span>
          </div>
        ) : (
          <span className="text-[11px]" style={{ color: "#7B8A9A" }}>
            {subtext || "Updated in real-time"}
          </span>
        )}
      </div>
    </div>
  );
}
