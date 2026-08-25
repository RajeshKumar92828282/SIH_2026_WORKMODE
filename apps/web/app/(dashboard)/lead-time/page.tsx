"use client";

import React, { useEffect, useState } from "react";
import { Clock, Filter, AlertTriangle, TrendingUp } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

export default function LeadTimePage() {
  const [data, setData] = useState<any[]>([]);
  const [selectedWindow, setSelectedWindow] = useState<string>("ALL");

  useEffect(() => {
    apiClient.getLeadTimeAnalysis().then((res) => {
      if (res && res.data) setData(res.data);
    }).catch(() => {});
  }, []);

  const displayData = data.length > 0 ? data : [
    { window: "T+1", label: "1 Day (Last Minute)", avgLiveFare: 5800, avgStaticFare: 4800, volatilityPct: 34.2, premium: "+20.8% Urgency Premium" },
    { window: "T+3", label: "3 Days (Short Notice)", avgLiveFare: 5200, avgStaticFare: 4500, volatilityPct: 22.1, premium: "+15.5% Short Premium" },
    { window: "T+7", label: "7 Days (1 Week Plan)", avgLiveFare: 4400, avgStaticFare: 4200, volatilityPct: 12.4, premium: "+4.8% Standard Window" },
    { window: "T+15", label: "15 Days (Advance Plan)", avgLiveFare: 3900, avgStaticFare: 3900, volatilityPct: 4.2, premium: "Base Baseline" }
  ];

  const filteredData = selectedWindow === "ALL" 
    ? displayData 
    : displayData.filter(d => d.window === selectedWindow);

  const curveChartData = [
    { windowName: "T+30", fare: 3600, label: "30 Days Out" },
    { windowName: "T+15", fare: 3900, label: "15 Days Out" },
    { windowName: "T+7", fare: 4400, label: "7 Days Out" },
    { windowName: "T+3", fare: 5200, label: "3 Days Out" },
    { windowName: "T+1", fare: 5800, label: "1 Day Out (Surge)" }
  ];

  return (
    <main className="p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">
              Advance Booking Lead-Time Window Spread Analysis
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              T+1 vs T+15
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Quantifying intraday price surge urgency premiums of emergency booking vs planned windows.
          </p>
        </div>

        {/* Lead-Time Window Tabs */}
        <div className="flex items-center gap-2 bg-[#071529] p-1.5 rounded-xl border border-[#143159]">
          <Filter className="w-4 h-4 text-amber-400 ml-1.5" />
          {["ALL", "T+1", "T+3", "T+7", "T+15"].map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWindow(w)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedWindow === w
                  ? "bg-amber-400 text-[#003247] shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Booking Yield Curve Recharts Graph */}
      <div className="glass-panel p-6 rounded-2xl border border-[#143159] space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white font-display">Advance Booking Yield & Price Escalation Curve</h3>
            <p className="text-xs text-slate-400 font-mono">Dynamic fare surge as departure date approaches</p>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">SURGE CURVE MODEL</span>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#143159" opacity={0.5} vertical={false} />
              <XAxis dataKey="windowName" stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace" }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace" }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#071529]/95 p-3 rounded-xl border border-amber-500/40 text-xs font-mono text-white">
                        <div className="font-bold border-b border-amber-500/20 pb-1 mb-1">{label}</div>
                        <div>Avg Fare: <strong className="text-amber-400">₹{payload[0].value}</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="fare" stroke="#f59e0b" strokeWidth={3} fill="url(#amberGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Window Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredData.map((item) => (
          <div key={item.window} className="glass-panel p-6 rounded-2xl border border-[#143159] space-y-4 hover:border-amber-500/40 transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-800">
                {item.window} Window
              </span>
              <span className="text-xs text-slate-400 font-mono">{item.label}</span>
            </div>

            <div className="pt-4 border-t border-[#143159] grid grid-cols-2 gap-4 font-mono">
              <div>
                <p className="text-xs text-slate-400 uppercase">Average Live Fare</p>
                <p className="text-3xl font-extrabold text-white">₹{(item.avgLiveFare || 5000).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Baseline Fare</p>
                <p className="text-3xl font-bold text-slate-400">₹{(item.avgStaticFare || 4500).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-[#002636]/60 p-4 rounded-xl border border-[#143159] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Booking Premium Metric:</span>
              <span className="font-bold text-amber-400">{item.premium}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
