'use client';

import { useEffect, useState } from 'react';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { apiClient } from '@/lib/api-client';
import { GitRoute, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    apiClient.getRoutes().then((res) => setRoutes(res.data || []));
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <HeaderBar />
      <main className="p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <GitRoute className="w-8 h-8 text-blue-400" /> Route Trend Analysis
          </h1>
          <p className="text-sm text-gray-400 mt-1">Per-corridor airfare relative price index breakdown across top domestic routes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routes.map((r) => (
            <div key={r.id} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-800">
                    {r.id}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">{r.origin} ➔ {r.destination}</h3>
                </div>
                <span className="text-xs bg-purple-950 text-purple-300 font-semibold px-2 py-1 rounded border border-purple-800">
                  Weight: {r.weightPercentage}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-800 flex justify-between items-baseline font-mono">
                <div>
                  <p className="text-[11px] text-gray-400">Relative Price Index</p>
                  <p className="text-3xl font-extrabold text-white">{r.relativePrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400">Avg Live Fare</p>
                  <p className="text-xl font-bold text-emerald-400">₹{r.avgLiveFare.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
