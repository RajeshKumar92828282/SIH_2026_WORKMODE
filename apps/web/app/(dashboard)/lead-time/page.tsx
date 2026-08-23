'use client';

import { useEffect, useState } from 'react';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { apiClient } from '@/lib/api-client';
import { Clock, AlertTriangle } from 'lucide-react';

export default function LeadTimePage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    apiClient.getLeadTimeAnalysis().then((res) => setData(res.data || []));
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <HeaderBar />
      <main className="p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-400" /> Advance Booking Lead-Time Analysis
          </h1>
          <p className="text-sm text-gray-400 mt-1">Comparing intraday urgency premium of T+1 (1-day advance) versus T+15 (15-day advance) booking windows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.map((item) => (
            <div key={item.window} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-800">
                  {item.window} Window
                </span>
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>

              <div className="pt-4 border-t border-gray-800 grid grid-cols-2 gap-4 font-mono">
                <div>
                  <p className="text-xs text-gray-400">Average Live Fare</p>
                  <p className="text-3xl font-extrabold text-white">₹{item.avgLiveFare.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Baseline Fare</p>
                  <p className="text-3xl font-bold text-gray-400">₹{item.avgStaticFare.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                <span className="text-gray-400">Booking Premium Metric:</span>
                <span className="font-bold text-amber-400">{item.premium}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
