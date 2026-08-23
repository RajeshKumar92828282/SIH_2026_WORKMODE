'use client';

import { useEffect, useState } from 'react';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { apiClient } from '@/lib/api-client';
import { Plane } from 'lucide-react';

export default function AirlinesPage() {
  const [carriers, setCarriers] = useState<any[]>([]);

  useEffect(() => {
    apiClient.getAirlines().then((res) => setCarriers(res.data || []));
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <HeaderBar />
      <main className="p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Plane className="w-8 h-8 text-indigo-400" /> Carrier & Airline Pricing Comparison
          </h1>
          <p className="text-sm text-gray-400 mt-1">Cross-airline fare benchmarking and dynamic index deviation per carrier.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {carriers.map((c) => (
            <div key={c.id} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">{c.name} ({c.code})</h3>
                  <p className="text-xs text-gray-400 font-mono">Carrier ID: {c.id}</p>
                </div>
                <span className="bg-indigo-950 text-indigo-300 font-semibold px-3 py-1 rounded-full text-xs border border-indigo-800">
                  Active Monitoring
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800 font-mono">
                <div>
                  <p className="text-xs text-gray-400">Average Live Fare</p>
                  <p className="text-2xl font-bold text-white">₹{c.avgLiveFare.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Baseline Fare Variance</p>
                  <p className={`text-2xl font-bold ${c.avgPctChange >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {c.avgPctChange >= 0 ? `+${c.avgPctChange.toFixed(1)}%` : `${c.avgPctChange.toFixed(1)}%`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
