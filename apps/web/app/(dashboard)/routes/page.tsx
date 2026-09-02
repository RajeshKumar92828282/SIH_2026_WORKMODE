"use client";

import React, { useEffect, useState } from "react";
import { Plane, ArrowUpRight, ArrowDownRight, Activity, Filter, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { AirplaneActiveDot } from "@/components/charts/AirplaneChartElements";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const fetchRouteData = async () => {
    try {
      setLoading(true);
      const [routeRes, histRes] = await Promise.all([
        apiClient.getRoutes().catch(() => null),
        apiClient.getIndexHistory(30).catch(() => null)
      ]);

      if (routeRes && routeRes.data) setRoutes(routeRes.data);
      if (histRes && histRes.data) setHistory(histRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouteData();
  }, []);

  const displayRoutes = routes.length > 0 ? routes : [
    { id: "DEL-BOM", origin: "Delhi", destination: "Mumbai", weight: 0.45, weightPercentage: "45%", relativePrice: 108.4, avgLiveFare: 5800, avgStaticFare: 4800, fareChangePct: 12.4 },
    { id: "DEL-BLR", origin: "Delhi", destination: "Bengaluru", weight: 0.35, weightPercentage: "35%", relativePrice: 104.2, avgLiveFare: 6650, avgStaticFare: 5500, fareChangePct: 8.2 },
    { id: "BOM-BLR", origin: "Mumbai", destination: "Bengaluru", weight: 0.20, weightPercentage: "20%", relativePrice: 101.9, avgLiveFare: 4700, avgStaticFare: 3900, fareChangePct: -3.1 }
  ];

  const filteredRoutes = selectedRoute === "ALL" 
    ? displayRoutes 
    : displayRoutes.filter(r => r.id === selectedRoute);

  return (
    <main className="p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Plane className="w-7 h-7 text-[#00B8D9]" />
            <h1 className="text-2xl font-extrabold text-[#172B4D] font-display tracking-tight">
              Basket Route Corridors & Relative Price Benchmarking
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#00B8D9]/10 text-[#007A99] border border-[#00B8D9]/30 font-bold">
              DGCA WEIGHTED
            </span>
          </div>
          <p className="text-xs text-[#486581] font-mono mt-1">
            Per-corridor airfare relative price index breakdown across primary domestic air travel trunk routes.
          </p>
        </div>

        {/* Corridor Selector Filter Tabs */}
        <div className="flex items-center gap-2 bg-[#FFFFFF] p-1.5 rounded-xl border border-[#D9E2EC] shadow-sm">
          <Filter className="w-4 h-4 text-[#00B8D9] ml-1.5" />
          {["ALL", "DEL-BOM", "DEL-BLR", "BOM-BLR"].map((rId) => (
            <button
              key={rId}
              onClick={() => setSelectedRoute(rId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedRoute === rId
                  ? "bg-[#00B8D9] text-[#FFFFFF] shadow-sm"
                  : "text-[#486581] hover:text-[#172B4D] hover:bg-[#F5F8FB]"
              }`}
            >
              {rId}
            </button>
          ))}
          <button
            onClick={fetchRouteData}
            className="p-1.5 text-[#486581] hover:text-[#00B8D9] transition-colors"
            title="Refresh Route Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Corridor Visual Trend Chart */}
      <div className="apix-card p-6 space-y-4" style={{ background: "#FFFFFF" }}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-[#172B4D] font-display">Corridor Price Relative Trajectory</h3>
            <p className="text-xs text-[#486581] font-mono">Relative fare index movement vs Base = 100</p>
          </div>
          <span className="text-xs font-mono text-[#007A99] font-bold">
            {selectedRoute === "ALL" ? "Combined Corridor Basket" : `Corridor: ${selectedRoute}`}
          </span>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history.length > 0 ? history : [
              { date: "08-15", apixValue: 108.4, t1Index: 118.2 },
              { date: "08-18", apixValue: 110.2, t1Index: 121.8 },
              { date: "08-20", apixValue: 114.28, t1Index: 129.4 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF0" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace", fill: "#486581" }} />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace", fill: "#486581" }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#D9E2EC] text-xs font-mono text-[#172B4D] shadow-lg">
                        <div className="font-bold border-b border-[#EAF0F5] pb-1 mb-1">{label}</div>
                        <div>Relative Index: <strong className="text-[#00B8D9]">{payload[0].value} pts</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={100} stroke="#D9E2EC" strokeDasharray="4 4" />
              <Line 
                type="monotone" 
                dataKey="apixValue" 
                stroke="#00B8D9" 
                strokeWidth={3} 
                dot={{ r: 4, fill: "#00B8D9" }} 
                activeDot={<AirplaneActiveDot stroke="#00B8D9" />} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredRoutes.map((r) => {
          const changePct = r.fareChangePct ?? 0;
          const isUp = changePct >= 0;
          return (
            <div key={r.id} className="apix-card apix-card-hover p-6 space-y-4 shadow-sm" style={{ background: "#FFFFFF" }}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-[#007A99] bg-[#00B8D9]/10 px-2.5 py-1 rounded-md border border-[#00B8D9]/25 font-mono">
                    {r.id}
                  </span>
                  <h3 className="text-lg font-bold text-[#172B4D] mt-2 font-display">{r.origin} ➔ {r.destination}</h3>
                </div>
                <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded border border-purple-200 font-mono">
                  Weight: {r.weightPercentage || `${((r.weight || 0.33) * 100).toFixed(0)}%`}
                </span>
              </div>

              <div className="pt-3 border-t border-[#EAF0F5] flex justify-between items-baseline font-mono">
                <div>
                  <p className="text-[11px] text-[#627D98] uppercase font-semibold">Relative Price Index</p>
                  <p className="text-3xl font-extrabold text-[#172B4D]">{r.relativePrice || 105.0}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-[#627D98] uppercase font-semibold">Avg Live Fare</p>
                  <p className="text-xl font-bold text-[#0D8A73]">₹{(r.avgLiveFare || 5000).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-[#F5F8FB] p-3 rounded-xl border border-[#D9E2EC] flex justify-between items-center text-xs font-mono">
                <span className="text-[#486581]">Static Base Fare (DB1):</span>
                <span className="font-bold text-[#172B4D]">₹{(r.avgStaticFare || 4500).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono pt-1">
                <span className="text-[#627D98]">24h Variance:</span>
                <span className={`font-bold flex items-center gap-1 ${isUp ? "text-[#C0392B]" : "text-[#0D8A73]"}`}>
                  {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {isUp ? `+${changePct.toFixed(1)}%` : `${changePct.toFixed(1)}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
