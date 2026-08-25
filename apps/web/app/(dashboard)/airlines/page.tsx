"use client";

import React, { useEffect, useState } from "react";
import { Building2, Filter, TrendingUp } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function AirlinesPage() {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<string>("ALL");

  useEffect(() => {
    apiClient.getAirlines().then((res) => {
      if (res && res.data) setCarriers(res.data);
    }).catch(() => {});
  }, []);

  const displayCarriers = carriers.length > 0 ? carriers : [
    { id: "IGO", name: "IndiGo", code: "6E", avgLiveFare: 5225, avgFareDiff: 425, avgPctChange: 8.8 },
    { id: "SEJ", name: "SpiceJet", code: "SG", avgLiveFare: 4890, avgFareDiff: 210, avgPctChange: 4.5 },
    { id: "AIC", name: "Air India", code: "AI", avgLiveFare: 5650, avgFareDiff: 510, avgPctChange: 9.9 },
    { id: "VTI", name: "Vistara", code: "UK", avgLiveFare: 6100, avgFareDiff: 750, avgPctChange: 14.0 },
    { id: "AKJ", name: "Akasa Air", code: "QP", avgLiveFare: 4720, avgFareDiff: 150, avgPctChange: 3.2 }
  ];

  const filteredCarriers = selectedCarrier === "ALL"
    ? displayCarriers
    : displayCarriers.filter(c => c.id === selectedCarrier || c.code === selectedCarrier);

  return (
    <main className="p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">
              Carrier & Airline Fare Benchmarking
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
              5 CARRIERS
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Cross-airline fare benchmarking and dynamic index deviation per carrier.
          </p>
        </div>

        {/* Airline Tabs */}
        <div className="flex items-center gap-2 bg-[#071529] p-1.5 rounded-xl border border-[#143159]">
          <Filter className="w-4 h-4 text-indigo-400 ml-1.5" />
          {["ALL", "IGO", "SEJ", "AIC", "VTI", "AKJ"].map((cId) => (
            <button
              key={cId}
              onClick={() => setSelectedCarrier(cId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedCarrier === cId
                  ? "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              {cId}
            </button>
          ))}
        </div>
      </div>

      {/* Carrier Fare Comparison Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-[#143159] space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white font-display">Carrier Average Live Fare Comparison</h3>
            <p className="text-xs text-slate-400 font-mono">Independently averaged across all route corridors</p>
          </div>
          <span className="text-xs font-mono text-indigo-400 font-bold">BENCHMARK FEED</span>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayCarriers} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#143159" opacity={0.5} vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace" }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace" }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#071529]/95 p-3 rounded-xl border border-indigo-500/40 text-xs font-mono text-white">
                        <div className="font-bold border-b border-indigo-500/20 pb-1 mb-1">{label}</div>
                        <div>Avg Live Fare: <strong className="text-indigo-400">₹{payload[0].value}</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="avgLiveFare" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Airline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCarriers.map((c) => (
          <div key={c.id} className="glass-panel p-6 rounded-2xl border border-[#143159] space-y-4 hover:border-indigo-500/40 transition-all shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white font-display">{c.name} ({c.code})</h3>
                <p className="text-xs text-slate-400 font-mono">Carrier ID: {c.id}</p>
              </div>
              <span className="bg-indigo-950 text-indigo-300 font-mono font-semibold px-3 py-1 rounded-full text-xs border border-indigo-800">
                ACTIVE FEED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#143159] font-mono">
              <div>
                <p className="text-xs text-slate-400 uppercase">Average Live Fare</p>
                <p className="text-2xl font-bold text-white">₹{(c.avgLiveFare || 5000).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Baseline Variance</p>
                <p className={`text-2xl font-bold ${(c.avgPctChange || 0) >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                  {(c.avgPctChange || 0) >= 0 ? `+${(c.avgPctChange || 0).toFixed(1)}%` : `${(c.avgPctChange || 0).toFixed(1)}%`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
