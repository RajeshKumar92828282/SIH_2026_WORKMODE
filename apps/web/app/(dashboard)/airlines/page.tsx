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
import { AirplaneBarShape } from "@/components/charts/AirplaneChartElements";

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-[#172B4D] font-display tracking-tight">
              Carrier & Airline Fare Benchmarking
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
              5 CARRIERS
            </span>
          </div>
          <p className="text-xs text-[#486581] font-mono mt-1">
            Cross-airline fare benchmarking and dynamic index deviation per carrier.
          </p>
        </div>

        {/* Airline Tabs */}
        <div className="flex items-center gap-2 bg-[#FFFFFF] p-1.5 rounded-xl border border-[#D9E2EC] shadow-sm">
          <Filter className="w-4 h-4 text-indigo-600 ml-1.5" />
          {["ALL", "IGO", "SEJ", "AIC", "VTI", "AKJ"].map((cId) => (
            <button
              key={cId}
              onClick={() => setSelectedCarrier(cId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedCarrier === cId
                  ? "bg-indigo-600 text-[#FFFFFF] shadow-sm"
                  : "text-[#486581] hover:text-[#172B4D] hover:bg-[#F5F8FB]"
              }`}
            >
              {cId}
            </button>
          ))}
        </div>
      </div>

      {/* Carrier Fare Comparison Bar Chart */}
      <div className="apix-card p-6 space-y-4" style={{ background: "#FFFFFF" }}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-[#172B4D] font-display">Carrier Average Live Fare Comparison</h3>
            <p className="text-xs text-[#486581] font-mono">Independently averaged across all route corridors</p>
          </div>
          <span className="text-xs font-mono text-indigo-700 font-bold">BENCHMARK FEED</span>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayCarriers} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF0" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace", fill: "#486581" }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace", fill: "#486581" }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#D9E2EC] text-xs font-mono text-[#172B4D] shadow-lg">
                        <div className="font-bold border-b border-[#EAF0F5] pb-1 mb-1">{label}</div>
                        <div>Avg Live Fare: <strong className="text-indigo-600">₹{payload[0].value}</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="avgLiveFare" fill="#6366f1" radius={[6, 6, 0, 0]} shape={<AirplaneBarShape />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Airline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCarriers.map((c) => (
          <div key={c.id} className="apix-card apix-card-hover p-6 space-y-4 shadow-sm" style={{ background: "#FFFFFF" }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[#172B4D] font-display">{c.name} ({c.code})</h3>
                <p className="text-xs text-[#627D98] font-mono">Carrier ID: {c.id}</p>
              </div>
              <span className="bg-indigo-50 text-indigo-700 font-mono font-semibold px-3 py-1 rounded-full text-xs border border-indigo-200">
                ACTIVE FEED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#EAF0F5] font-mono">
              <div>
                <p className="text-xs text-[#627D98] uppercase font-semibold">Average Live Fare</p>
                <p className="text-2xl font-bold text-[#172B4D]">₹{(c.avgLiveFare || 5000).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[#627D98] uppercase font-semibold">Baseline Variance</p>
                <p className={`text-2xl font-bold ${(c.avgPctChange || 0) >= 0 ? "text-[#C0392B]" : "text-[#0D8A73]"}`}>
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
