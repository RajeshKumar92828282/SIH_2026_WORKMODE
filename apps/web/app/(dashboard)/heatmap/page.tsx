'use client';

import { useEffect, useState } from 'react';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { apiClient } from '@/lib/api-client';
import { MapPin } from 'lucide-react';

export default function HeatmapPage() {
  const [heatmap, setHeatmap] = useState<any[]>([]);

  useEffect(() => {
    apiClient.getHeatmap().then((res) => setHeatmap(res.data || []));
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <HeaderBar />
      <main className="p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <MapPin className="w-8 h-8 text-rose-400" /> India Regional Airfare Index Heatmap
          </h1>
          <p className="text-sm text-gray-400 mt-1">State-level aggregated fare pressures informed by primary origin-destination corridor traffic.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {heatmap.map((h) => (
            <div key={h.code} className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-base">{h.state}</h3>
                <span className="text-xs font-mono font-semibold bg-gray-800 px-2 py-0.5 rounded text-gray-300">
                  {h.code}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">{h.hub}</p>

              <div className="pt-2 flex justify-between items-baseline font-mono">
                <span className="text-2xl font-extrabold text-white">{h.indexValue}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  h.status === 'HIGH' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {h.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
