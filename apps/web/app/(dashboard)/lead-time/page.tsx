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
import { AirplaneActiveDot } from "@/components/charts/AirplaneChartElements";

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-[#F5A623]" />
            <h1 className="text-2xl font-extrabold text-[#172B4D] font-display tracking-tight">
              Advance Booking Lead-Time Window Spread Analysis
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#F5A623]/10 text-[#9A6A00] border border-[#F5A623]/30 font-bold">
              T+1 vs T+15
            </span>
          </div>
          <p className="text-xs text-[#486581] font-mono mt-1">
            Quantifying intraday price surge urgency premiums of emergency booking vs planned windows.
          </p>
        </div>

        {/* Lead-Time Window Tabs */}
        <div className="flex items-center gap-2 bg-[#FFFFFF] p-1.5 rounded-xl border border-[#D9E2EC] shadow-sm">
          <Filter className="w-4 h-4 text-[#F5A623] ml-1.5" />
          {["ALL", "T+1", "T+3", "T+7", "T+15"].map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWindow(w)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedWindow === w
                  ? "bg-[#F5A623] text-[#FFFFFF] shadow-sm"
                  : "text-[#486581] hover:text-[#172B4D] hover:bg-[#F5F8FB]"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Booking Yield Curve Recharts Graph */}
      <div className="apix-card p-6 space-y-4" style={{ background: "#FFFFFF" }}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-[#172B4D] font-display">Advance Booking Yield & Price Escalation Curve</h3>
            <p className="text-xs text-[#486581] font-mono">Dynamic fare surge as departure date approaches</p>
          </div>
          <span className="text-xs font-mono text-[#9A6A00] font-bold">SURGE CURVE MODEL</span>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF0" vertical={false} />
              <XAxis dataKey="windowName" stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace", fill: "#486581" }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace", fill: "#486581" }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#D9E2EC] text-xs font-mono text-[#172B4D] shadow-lg">
                        <div className="font-bold border-b border-[#EAF0F5] pb-1 mb-1">{label}</div>
                        <div>Avg Fare: <strong className="text-[#9A6A00]">₹{payload[0].value}</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="fare" 
                stroke="#f59e0b" 
                strokeWidth={3} 
                fill="url(#amberGrad)" 
                activeDot={<AirplaneActiveDot stroke="#F5A623" />} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Window Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredData.map((item) => (
          <div key={item.window} className="apix-card apix-card-hover p-6 space-y-4 shadow-sm" style={{ background: "#FFFFFF" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#9A6A00] bg-[#F5A623]/10 px-3 py-1 rounded-full border border-[#F5A623]/30">
                {item.window} Window
              </span>
              <span className="text-xs text-[#627D98] font-mono">{item.label}</span>
            </div>

            <div className="pt-4 border-t border-[#EAF0F5] grid grid-cols-2 gap-4 font-mono">
              <div>
                <p className="text-xs text-[#627D98] uppercase font-semibold">Average Live Fare</p>
                <p className="text-3xl font-extrabold text-[#172B4D]">₹{(item.avgLiveFare || 5000).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[#627D98] uppercase font-semibold">Baseline Fare</p>
                <p className="text-3xl font-bold text-[#486581]">₹{(item.avgStaticFare || 4500).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-[#F5F8FB] p-4 rounded-xl border border-[#D9E2EC] flex items-center justify-between text-xs font-mono">
              <span className="text-[#486581]">Booking Premium Metric:</span>
              <span className="font-bold text-[#9A6A00]">{item.premium}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
