'use client';

import { HeaderBar } from '@/components/layout/HeaderBar';
import { BookOpen, CheckCircle, ShieldCheck } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <HeaderBar />
      <main className="p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-400" /> Methodology & Data Quality Architecture
          </h1>
          <p className="text-sm text-gray-400 mt-1">Rigorous CPI-style Laspeyres index formulation designed to augment official transport sub-group inflation metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Index Formulation (Laspeyres Family)
            </h2>
            <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
              <p>
                The APIx Index follows the standard Consumer Price Index (CPI) Laspeyres basket methodology.
                A fixed basket of top domestic air corridors is assigned weights proportional to DGCA annual passenger traffic volume share:
              </p>
              <ul className="list-disc list-inside space-y-1 font-mono text-gray-400">
                <li>DEL-BOM (Delhi ➔ Mumbai): 45% Basket Weight</li>
                <li>DEL-BLR (Delhi ➔ Bengaluru): 35% Basket Weight</li>
                <li>BOM-BLR (Mumbai ➔ Bengaluru): 20% Basket Weight</li>
              </ul>
              <p>
                Relative price ratios are calculated as <code className="text-emerald-400 font-mono">P_live / P_static * 100</code>.
                Weights are applied in a 2-pass aggregation step to ensure routes with multiple lead-time windows (T+1, T+15) or carriers are normalized without double-counting.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-400" /> Data Quality & Audit Guarantee
            </h2>
            <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
              <p>
                To maintain institutional trust for RBI and NSO statistical requirements:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Every tick compute batch generates an append-only <code className="text-blue-400 font-mono">index_results</code> record.</li>
                <li>All underlying fare components (Base fare, Taxes, Fuel Surcharges) are stored individually.</li>
                <li>Automatic alert triggers flag intraday surges exceeding +25%.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
