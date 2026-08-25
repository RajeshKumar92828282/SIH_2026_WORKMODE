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

export function IndexChart({ data }: IndexChartProps) {
  const { showDgcaBenchmark, toggleDgcaBenchmark } = useAppStore();
  const [activeSeries, setActiveSeries] = useState<"ALL" | "HEADLINE" | "LEAD_TIMES">("ALL");
  const [pinnedPoint, setPinnedPoint] = useState<IndexHistoryPoint | null>(null);

  const fallbackData: IndexHistoryPoint[] = [
    { date: "08-15", apixValue: 108.4, t1Index: 118.2, t15Index: 102.1, dgcaBenchmark: 107.0 },
    { date: "08-16", apixValue: 109.1, t1Index: 120.4, t15Index: 102.5, dgcaBenchmark: 107.2 },
    { date: "08-17", apixValue: 111.8, t1Index: 125.1, t15Index: 103.0, dgcaBenchmark: 107.8 },
    { date: "08-18", apixValue: 110.2, t1Index: 121.8, t15Index: 102.8, dgcaBenchmark: 108.1 },
    { date: "08-19", apixValue: 112.5, t1Index: 126.5, t15Index: 103.4, dgcaBenchmark: 108.5 },
    { date: "08-20", apixValue: 114.28, t1Index: 129.4, t15Index: 104.1, dgcaBenchmark: 109.0 }
  ];

  const chartData = data && data.length > 0 ? data : fallbackData;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-2xl relative transition-all duration-300 hover:border-cyan-400/40">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-white font-display">
              National Airfare Price Index (APIx) Time Series
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">
              BASE = 100
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Laspeyres-weighted index vs DGCA published benchmarks • Click any point on the chart to pin telemetry info
          </p>
        </div>

        {/* Series Filter & Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDgcaBenchmark}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all hover:scale-105 active:scale-95 ${
              showDgcaBenchmark
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                : "bg-slate-800/40 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            DGCA Benchmark: {showDgcaBenchmark ? "ON" : "OFF"}
          </button>

          <div className="flex bg-[#071529] p-1 rounded-xl border border-cyan-500/20">
            {(["ALL", "HEADLINE", "LEAD_TIMES"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveSeries(mode)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold font-mono transition-all ${
                  activeSeries === mode
                    ? "bg-cyan-500 text-[#021019] shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pinned Info Banner */}
      {pinnedPoint && (
        <div className="mb-4 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-400/40 flex items-center justify-between gap-4 text-xs font-mono animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-cyan-400/20 text-cyan-400">
              <Pin className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">Pinned Observation: {pinnedPoint.date}</span>
              <div className="flex gap-4 text-[11px] text-slate-300 mt-0.5">
                <span>APIx Index: <strong className="text-cyan-400">{pinnedPoint.apixValue} pts</strong></span>
                <span>T+1 Surge: <strong className="text-red-400">{pinnedPoint.t1Index} pts</strong></span>
                <span>T+15 Advance: <strong className="text-emerald-400">{pinnedPoint.t15Index} pts</strong></span>
                {showDgcaBenchmark && <span>DGCA Benchmark: <strong className="text-amber-400">{pinnedPoint.dgcaBenchmark} pts</strong></span>}
              </div>
            </div>
          </div>
          <button
            onClick={() => setPinnedPoint(null)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase transition-colors"
          >
            Clear Pin
          </button>
        </div>
      )}

      {/* Recharts Area Container */}
      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload.length) {
                setPinnedPoint(e.activePayload[0].payload as IndexHistoryPoint);
              }
            }}
          >
            <defs>
              <linearGradient id="apixGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#143159" opacity={0.5} vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              tick={{ fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']} 
              stroke="#64748b" 
              tick={{ fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
            />
            
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#071529]/95 backdrop-blur-xl p-4 rounded-2xl border border-cyan-500/40 shadow-[0_8px_32px_rgba(0,229,255,0.3)] text-xs font-mono w-60">
                      <div className="font-bold text-white mb-2 pb-1.5 border-b border-cyan-500/20 flex justify-between items-center">
                        <span>Date: {label}</span>
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-bold">CLICK TO PIN</span>
                      </div>
                      {payload.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 py-1">
                          <span className="flex items-center gap-1.5 text-slate-300" style={{ color: p.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                            {p.name}:
                          </span>
                          <span className="font-bold text-white">{Number(p.value).toFixed(2)} pts</span>
                        </div>
                      ))}
                      <div className="mt-2 pt-1.5 border-t border-cyan-500/20 text-[10px] text-slate-400 flex justify-between">
                        <span>Calibration:</span>
                        <span className="text-emerald-400 font-bold">IQR k=1.5 Filtered</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine y={100} stroke="#64748b" strokeDasharray="4 4" label={{ value: "BASE 100", fill: "#64748b", fontSize: 10, position: "insideBottomLeft" }} />

            {(activeSeries === "ALL" || activeSeries === "HEADLINE") && (
              <Area
                type="monotone"
                dataKey="apixValue"
                name="APIx Headline"
                stroke="#00e5ff"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#apixGradient)"
                activeDot={{ r: 7, fill: "#ffffff", stroke: "#00e5ff", strokeWidth: 3 }}
              />
            )}

            {(activeSeries === "ALL" || activeSeries === "LEAD_TIMES") && (
              <Line
                type="monotone"
                dataKey="t1Index"
                name="T+1 (Last Minute)"
                stroke="#ff5252"
                strokeWidth={2}
                dot={false}
                strokeDasharray="3 3"
              />
            )}

            {(activeSeries === "ALL" || activeSeries === "LEAD_TIMES") && (
              <Line
                type="monotone"
                dataKey="t15Index"
                name="T+15 (Advance)"
                stroke="#00c853"
                strokeWidth={2}
                dot={false}
              />
            )}

            {showDgcaBenchmark && (
              <Line
                type="monotone"
                dataKey="dgcaBenchmark"
                name="DGCA Benchmark"
                stroke="#ffd600"
                strokeWidth={2.2}
                dot={{ r: 3.5, fill: "#ffd600" }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Summary Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-cyan-500/20 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold hover:scale-105 transition-transform cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]"></span>
            <span>APIx Weighted Index</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400 font-bold hover:scale-105 transition-transform cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_#ff5252]"></span>
            <span>T+1 Last-Minute Window</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold hover:scale-105 transition-transform cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#00c853]"></span>
            <span>T+15 Advance Booking</span>
          </div>
        </div>
        <div className="text-slate-400">
          Source: <span className="text-cyan-300 font-semibold">APIx Two-Pass Laspeyres Aggregator</span>
        </div>
      </div>
    </div>
  );
}
