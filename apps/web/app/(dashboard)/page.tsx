'use client';

import { useEffect, useState } from 'react';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { IndexTrendChart } from '@/components/charts/IndexTrendChart';
import { apiClient } from '@/lib/api-client';
import { TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, histRes, routeRes] = await Promise.all([
        apiClient.getIndexSummary(),
        apiClient.getIndexHistory(30),
        apiClient.getRoutes()
      ]);
      setSummary(sumRes.data);
      setHistory(histRes.data || []);
      setRoutes(routeRes.data || []);
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Polling every 15s for live feed
    return () => clearInterval(interval);
  }, []);

  const currentIndex = summary?.currentIndex || 100.0;
  const pctChange = summary?.pctChange24h || 0.0;
  const isUp = pctChange >= 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <HeaderBar lastUpdated={summary?.lastUpdated} sampleCount={summary?.sampleCount || 12} />

      <main className="p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Airfare Price Index Overview
              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
                CPI Sub-Group Augment
              </span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              High-frequency weighted Laspeyres Index across key domestic corridors (DEL, BOM, BLR).
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-xl border border-gray-700 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Top Summary Stat Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Main Index Value */}
          <div className="glass-panel-glow p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Current APIx Index</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline space-x-3">
              <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                {currentIndex.toFixed(2)}
              </span>
              <span
                className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                  isUp
                    ? 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                    : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                }`}
              >
                {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {Math.abs(pctChange).toFixed(2)}%
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Baseline = 100.00 (Fixed Base Period)</p>
          </div>

          {/* Card 2: Intraday Range */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Intraday Range</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-3 flex items-baseline space-x-2 font-mono">
              <span className="text-2xl font-bold text-gray-300">{(currentIndex * 0.95).toFixed(1)}</span>
              <span className="text-xs text-gray-500">to</span>
              <span className="text-2xl font-bold text-white">{(currentIndex * 1.08).toFixed(1)}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Intraday dynamic fare variation range</p>
          </div>

          {/* Card 3: Weight Normalization Basket */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Active Route Basket</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white font-mono">
              3 Routes / 2 Carriers
            </div>
            <p className="text-[11px] text-gray-400 mt-2">DGCA passenger traffic weighted</p>
          </div>

          {/* Card 4: Index Volatility Status */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Market Stability</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="mt-3 text-2xl font-bold text-emerald-400 uppercase font-mono">
              {summary?.status || 'STABLE'}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">No critical systemic fare spikes</p>
          </div>
        </div>

        {/* Main Visualization Container */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">APIx Real-Time Index Time-Series</h2>
              <p className="text-xs text-gray-400">Laspeyres Index aggregate + per-route contributions over tick cycles</p>
            </div>
          </div>
          <IndexTrendChart data={history} />
        </div>

        {/* Route Contribution Breakdown Table */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80">
          <h2 className="text-lg font-bold text-white mb-4">Route Weight Basket & Relative Price Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 uppercase font-semibold border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Origin / Destination</th>
                  <th className="py-3 px-4">DGCA Weight</th>
                  <th className="py-3 px-4">Relative Price Index</th>
                  <th className="py-3 px-4">Avg Live Fare (₹)</th>
                  <th className="py-3 px-4">Fare Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {routes.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-800/30 transition">
                    <td className="py-3.5 px-4 font-bold text-blue-400">{r.id}</td>
                    <td className="py-3.5 px-4 font-sans text-gray-200">{r.origin} ➔ {r.destination}</td>
                    <td className="py-3.5 px-4 text-purple-300">{r.weightPercentage}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{r.relativePrice}</td>
                    <td className="py-3.5 px-4 text-gray-100">₹{r.avgLiveFare.toLocaleString('en-IN')}</td>
                    <td className={`py-3.5 px-4 font-semibold ${r.fareChangePct >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {r.fareChangePct >= 0 ? `+${r.fareChangePct.toFixed(1)}%` : `${r.fareChangePct.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
