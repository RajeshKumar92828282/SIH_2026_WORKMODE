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
            <Plane className="w-7 h-7 text-[#87D6EB]" />
            <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">
              Basket Route Corridors & Relative Price Benchmarking
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
              DGCA WEIGHTED
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Per-corridor airfare relative price index breakdown across primary domestic air travel trunk routes.
          </p>
        </div>

        {/* Corridor Selector Filter Tabs */}
        <div className="flex items-center gap-2 bg-[#071529] p-1.5 rounded-xl border border-[#143159]">
          <Filter className="w-4 h-4 text-cyan-400 ml-1.5" />
          {["ALL", "DEL-BOM", "DEL-BLR", "BOM-BLR"].map((rId) => (
            <button
              key={rId}
              onClick={() => setSelectedRoute(rId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedRoute === rId
                  ? "bg-[#87D6EB] text-[#003247] shadow-[0_0_10px_rgba(135,214,235,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              {rId}
            </button>
          ))}
          <button
            onClick={fetchRouteData}
            className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Refresh Route Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Corridor Visual Trend Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-[#143159] space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white font-display">Corridor Price Relative Trajectory</h3>
            <p className="text-xs text-slate-400 font-mono">Relative fare index movement vs Base = 100</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#143159" opacity={0.5} vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace" }} />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#64748b" tick={{ fontSize: 11, fontFamily: "monospace" }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#071529]/95 p-3 rounded-xl border border-cyan-500/40 text-xs font-mono text-white">
                        <div className="font-bold border-b border-cyan-500/20 pb-1 mb-1">{label}</div>
                        <div>Relative Index: <strong className="text-cyan-400">{payload[0].value} pts</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={100} stroke="#64748b" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="apixValue" stroke="#87D6EB" strokeWidth={3} dot={{ r: 4, fill: "#87D6EB" }} />
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
            <div key={r.id} className="glass-panel p-6 rounded-2xl border border-[#143159] space-y-4 hover:border-[#87D6EB]/50 transition-all shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800 font-mono">
                    {r.id}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2 font-display">{r.origin} ➔ {r.destination}</h3>
                </div>
                <span className="text-xs bg-purple-950 text-purple-300 font-semibold px-2.5 py-1 rounded border border-purple-800 font-mono">
                  Weight: {r.weightPercentage || `${((r.weight || 0.33) * 100).toFixed(0)}%`}
                </span>
              </div>

              <div className="pt-3 border-t border-[#143159] flex justify-between items-baseline font-mono">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase">Relative Price Index</p>
                  <p className="text-3xl font-extrabold text-white">{r.relativePrice || 105.0}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 uppercase">Avg Live Fare</p>
                  <p className="text-xl font-bold text-emerald-400">₹{(r.avgLiveFare || 5000).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-[#002636]/60 p-3 rounded-xl border border-[#143159] flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Static Base Fare (DB1):</span>
                <span className="font-bold text-slate-300">₹{(r.avgStaticFare || 4500).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono pt-1">
                <span className="text-slate-400">24h Variance:</span>
                <span className={`font-bold flex items-center gap-1 ${isUp ? "text-red-400" : "text-emerald-400"}`}>
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
