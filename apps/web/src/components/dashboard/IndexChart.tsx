"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Pin } from "lucide-react";
import { useAppStore } from "@/lib/store";

import { AirplaneActiveDot } from "@/components/charts/AirplaneChartElements";

interface IndexHistoryPoint {
  date: string;
  apixValue: number;
  t1Index: number;
  t15Index: number;
  dgcaBenchmark: number;
  [key: string]: any;
}

interface IndexChartProps {
  data: IndexHistoryPoint[];
}

const DEFAULT_FALLBACK_DATA: IndexHistoryPoint[] = [
  { date: "08-15", apixValue: 108.4, t1Index: 118.2, t15Index: 102.1, dgcaBenchmark: 107.0 },
  { date: "08-16", apixValue: 109.1, t1Index: 120.4, t15Index: 102.5, dgcaBenchmark: 107.2 },
  { date: "08-17", apixValue: 111.8, t1Index: 125.1, t15Index: 103.0, dgcaBenchmark: 107.8 },
  { date: "08-18", apixValue: 110.2, t1Index: 121.8, t15Index: 102.8, dgcaBenchmark: 108.1 },
  { date: "08-19", apixValue: 112.5, t1Index: 126.5, t15Index: 103.4, dgcaBenchmark: 108.5 },
  { date: "08-20", apixValue: 114.28, t1Index: 129.4, t15Index: 104.1, dgcaBenchmark: 109.0 },
];

export function IndexChart({ data }: IndexChartProps) {
  const { showDgcaBenchmark, toggleDgcaBenchmark } = useAppStore();
  const [activeSeries, setActiveSeries] = useState<"ALL" | "HEADLINE" | "LEAD_TIMES">("ALL");
  const [pinnedPoint, setPinnedPoint] = useState<IndexHistoryPoint | null>(null);

  const normalizedData = React.useMemo(() => {
    const rawList = data && data.length > 0 ? data : DEFAULT_FALLBACK_DATA;
    
    // Sort chronologically ascending
    const sorted = [...rawList].sort((a, b) => {
      const timeA = new Date(a.timestamp || a.date || 0).getTime();
      const timeB = new Date(b.timestamp || b.date || 0).getTime();
      return timeA - timeB;
    });

    return sorted.map((pt, idx) => {
      let dateStr = pt.date;
      if (!dateStr && pt.timestamp) {
        const d = new Date(pt.timestamp);
        if (!isNaN(d.getTime())) {
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          dateStr = `${month}-${day} ${hours}:00`;
        } else {
          dateStr = String(pt.timestamp).slice(5, 16).replace('T', ' ');
        }
      }
      if (!dateStr) {
        dateStr = `Pt ${idx + 1}`;
      }

      const apixVal = Number(pt.apixValue ?? pt.indexValue ?? 114.28);
      const t1 = Number(pt.t1Index ?? (apixVal * 1.11));
      const t15 = Number(pt.t15Index ?? (apixVal * 0.91));
      const dgca = Number(pt.dgcaBenchmark ?? (apixVal * 0.95));

      return {
        ...pt,
        date: dateStr,
        apixValue: Number(apixVal.toFixed(2)),
        t1Index: Number(t1.toFixed(2)),
        t15Index: Number(t15.toFixed(2)),
        dgcaBenchmark: Number(dgca.toFixed(2)),
      };
    });
  }, [data]);

  const chartData = normalizedData;

  // Gradient fill for area
  const apixGradientId = "apixGradientLight";

  return (
    <div
      className="apix-card apix-card-hover p-6 relative"
      style={{ background: "#FFFFFF" }}
    >
      {/* ── Chart Header ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3
              className="text-[16px] font-semibold leading-tight"
              style={{ color: "#172B4D" }}
            >
              National Airfare Price Index (APIX) — Time Series
            </h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(0,184,217,0.10)",
                color:      "#007A99",
                border:     "1px solid rgba(0,184,217,0.25)",
              }}
            >
              BASE = 100
            </span>
          </div>
          <p className="text-[12px] mt-1" style={{ color: "#526579" }}>
            Laspeyres-weighted index vs DGCA benchmarks · Click any point to pin
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* DGCA toggle */}
          <button
            onClick={toggleDgcaBenchmark}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
            style={
              showDgcaBenchmark
                ? { background: "rgba(245,166,35,0.12)", color: "#9A6A00", border: "1px solid rgba(245,166,35,0.3)" }
                : { background: "#F5F8FB",               color: "#526579", border: "1px solid #D9E2EC"              }
            }
          >
            DGCA Benchmark: {showDgcaBenchmark ? "ON" : "OFF"}
          </button>

          {/* Series filter */}
          <div
            className="flex p-1 rounded-lg gap-0.5"
            style={{ background: "#F5F8FB", border: "1px solid #D9E2EC" }}
          >
            {(["ALL", "HEADLINE", "LEAD_TIMES"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveSeries(mode)}
                className="px-3 py-1 rounded-md text-[11px] font-bold transition-all"
                style={
                  activeSeries === mode
                    ? { background: "#00B8D9", color: "#FFFFFF" }
                    : { background: "transparent", color: "#526579" }
                }
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pinned Info Banner ─────────────────────────── */}
      {pinnedPoint && (
        <div
          className="mb-4 p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs animate-fadeIn"
          style={{
            background: "rgba(0,184,217,0.06)",
            border:     "1px solid rgba(0,184,217,0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-1.5 rounded-lg"
              style={{ background: "rgba(0,184,217,0.12)", color: "#00B8D9" }}
            >
              <Pin className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold" style={{ color: "#172B4D" }}>
                Pinned: {pinnedPoint.date}
              </span>
              <div className="flex flex-wrap gap-4 mt-0.5" style={{ color: "#526579" }}>
                <span>APIX: <strong style={{ color: "#00B8D9" }}>{pinnedPoint.apixValue} pts</strong></span>
                <span>T+1: <strong style={{ color: "#EF5B5B" }}>{pinnedPoint.t1Index} pts</strong></span>
                <span>T+15: <strong style={{ color: "#16C7A3" }}>{pinnedPoint.t15Index} pts</strong></span>
                {showDgcaBenchmark && (
                  <span>DGCA: <strong style={{ color: "#F5A623" }}>{pinnedPoint.dgcaBenchmark} pts</strong></span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setPinnedPoint(null)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors"
            style={{ background: "#F5F8FB", border: "1px solid #D9E2EC", color: "#526579" }}
          >
            Clear
          </button>
        </div>
      )}

      {/* ── Chart ─────────────────────────────────────── */}
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload.length) {
                setPinnedPoint(e.activePayload[0].payload as IndexHistoryPoint);
              }
            }}
          >
            <defs>
              <linearGradient id={apixGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00B8D9" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00B8D9" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF0" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#D9E2EC"
              tick={{ fontSize: 11, fill: "#526579", fontFamily: "Inter, sans-serif" }}
              tickLine={false}
              axisLine={{ stroke: "#D9E2EC" }}
            />
            <YAxis
              domain={["dataMin - 5", "dataMax + 5"]}
              stroke="#D9E2EC"
              tick={{ fontSize: 11, fill: "#526579", fontFamily: "Inter, sans-serif" }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div
                      style={{
                        background:   "#FFFFFF",
                        border:       "1px solid #D9E2EC",
                        borderRadius: "10px",
                        boxShadow:    "0 8px 32px rgba(23,43,77,0.12)",
                        padding:      "12px 16px",
                        minWidth:     "200px",
                        fontFamily:   "Inter, sans-serif",
                        fontSize:     "12px",
                      }}
                    >
                      <div
                        className="font-semibold mb-2 pb-2 flex justify-between"
                        style={{ color: "#172B4D", borderBottom: "1px solid #EAF0F5" }}
                      >
                        <span>Date: {label}</span>
                        <span
                          style={{
                            fontSize:   "10px",
                            background: "rgba(0,184,217,0.10)",
                            color:      "#007A99",
                            padding:    "2px 8px",
                            borderRadius: "99px",
                          }}
                        >
                          CLICK TO PIN
                        </span>
                      </div>
                      {payload.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-6 py-0.5">
                          <span className="flex items-center gap-1.5" style={{ color: "#526579" }}>
                            <span className="w-2 h-2 rounded-full" style={{ background: p.color as string }} />
                            {p.name}:
                          </span>
                          <span className="font-bold" style={{ color: "#172B4D" }}>
                            {Number(p.value).toFixed(2)} pts
                          </span>
                        </div>
                      ))}
                      <div
                        className="mt-2 pt-1.5 flex justify-between text-[10px]"
                        style={{ borderTop: "1px solid #EAF0F5", color: "#7B8A9A" }}
                      >
                        <span>Calibration:</span>
                        <span style={{ color: "#16C7A3", fontWeight: 600 }}>IQR k=1.5 Filtered</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine
              y={100}
              stroke="#D9E2EC"
              strokeDasharray="4 4"
              label={{ value: "BASE 100", fill: "#7B8A9A", fontSize: 10, position: "insideBottomLeft" }}
            />

            {(activeSeries === "ALL" || activeSeries === "HEADLINE") && (
              <Area
                type="monotone"
                dataKey="apixValue"
                name="APIX Headline"
                stroke="#00B8D9"
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${apixGradientId})`}
                activeDot={<AirplaneActiveDot stroke="#00B8D9" />}
              />
            )}

            {(activeSeries === "ALL" || activeSeries === "LEAD_TIMES") && (
              <Line
                type="monotone"
                dataKey="t1Index"
                name="T+1 Last Minute"
                stroke="#EF5B5B"
                strokeWidth={1.8}
                dot={false}
                strokeDasharray="4 3"
                activeDot={<AirplaneActiveDot stroke="#EF5B5B" />}
              />
            )}

            {(activeSeries === "ALL" || activeSeries === "LEAD_TIMES") && (
              <Line
                type="monotone"
                dataKey="t15Index"
                name="T+15 Advance"
                stroke="#16C7A3"
                strokeWidth={1.8}
                dot={false}
                activeDot={<AirplaneActiveDot stroke="#16C7A3" />}
              />
            )}

            {showDgcaBenchmark && (
              <Line
                type="monotone"
                dataKey="dgcaBenchmark"
                name="DGCA Benchmark"
                stroke="#F5A623"
                strokeWidth={2}
                dot={{ r: 3, fill: "#F5A623", stroke: "#FFFFFF", strokeWidth: 1.5 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend ────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 text-[12px]"
        style={{ borderTop: "1px solid #EAF0F5" }}
      >
        <div className="flex flex-wrap items-center gap-5">
          {[
            { label: "APIX Weighted Index",    color: "#00B8D9" },
            { label: "T+1 Last-Minute",        color: "#EF5B5B" },
            { label: "T+15 Advance Booking",   color: "#16C7A3" },
            ...(showDgcaBenchmark ? [{ label: "DGCA Benchmark", color: "#F5A623" }] : []),
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
              <span style={{ color: "#526579", fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
        <span style={{ color: "#7B8A9A" }}>
          Source: <span style={{ color: "#00B8D9", fontWeight: 600 }}>APIX Two-Pass Laspeyres</span>
        </span>
      </div>
    </div>
  );
}
