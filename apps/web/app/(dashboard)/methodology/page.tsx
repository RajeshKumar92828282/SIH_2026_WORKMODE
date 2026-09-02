"use client";

import React from "react";
import { BookOpen, ShieldCheck, CheckCircle } from "lucide-react";

export default function MethodologyPage() {
  return (
    <main className="p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto font-sans">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-[#0D8A73]" />
          <h1 className="text-2xl font-extrabold text-[#172B4D] font-display tracking-tight">
            Laspeyres Index Formulation & Data Quality Architecture
          </h1>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
            CPI FORMULA
          </span>
        </div>
        <p className="text-xs text-[#486581] font-mono mt-1">
          Rigorous CPI-style Laspeyres index formulation designed to augment official transport sub-group inflation metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="apix-card p-6 space-y-4 shadow-sm" style={{ background: "#FFFFFF" }}>
          <h2 className="text-xl font-bold text-[#172B4D] font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0D8A73]" /> Index Formulation (Laspeyres Family)
          </h2>
          <div className="text-xs text-[#334E68] space-y-3 leading-relaxed font-mono">
            <p>
              The APIx Index follows the standard Consumer Price Index (CPI) Laspeyres basket methodology.
              A fixed basket of top domestic air corridors is assigned weights proportional to DGCA annual passenger traffic volume share:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#486581]">
              <li>DEL-BOM (Delhi ➔ Mumbai): 45% Basket Weight</li>
              <li>DEL-BLR (Delhi ➔ Bengaluru): 35% Basket Weight</li>
              <li>BOM-BLR (Mumbai ➔ Bengaluru): 20% Basket Weight</li>
            </ul>
            <p>
              Relative price ratios are calculated as <code className="text-[#007A99] font-bold">P_live / P_static * 100</code>.
              Weights are applied in a 2-pass aggregation step to ensure routes with multiple lead-time windows (T+1, T+15) or carriers are normalized without double-counting.
            </p>
          </div>
        </div>

        <div className="apix-card p-6 space-y-4 shadow-sm" style={{ background: "#FFFFFF" }}>
          <h2 className="text-xl font-bold text-[#172B4D] font-display flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#00B8D9]" /> Data Quality & Audit Guarantee
          </h2>
          <div className="text-xs text-[#334E68] space-y-3 leading-relaxed font-mono">
            <p>
              To maintain institutional trust for RBI and NSO statistical requirements:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#486581]">
              <li>Every tick compute batch generates an append-only <code className="text-[#007A99] font-bold">index_results</code> record.</li>
              <li>All underlying fare components (Base fare, Taxes, Fuel Surcharges) are stored individually.</li>
              <li>Automatic alert triggers flag intraday surges exceeding +25%.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
