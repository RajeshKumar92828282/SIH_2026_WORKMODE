"use client";

import React, { useEffect, useState } from "react";
import { Map } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function HeatmapPage() {
  const [heatmap, setHeatmap] = useState<any[]>([]);

  useEffect(() => {
    apiClient.getHeatmap().then((res) => {
      if (res && res.data) setHeatmap(res.data);
    }).catch(() => {});
  }, []);

  const displayHeatmap = heatmap.length > 0 ? heatmap : [
    { state: "Delhi (NCR)", code: "DEL", indexValue: 106.4, status: "HIGH", hub: "Indira Gandhi Intl (DEL)" },
    { state: "Maharashtra", code: "MH", indexValue: 104.2, status: "MODERATE", hub: "Chhatrapati Shivaji Intl (BOM)" },
    { state: "Karnataka", code: "KA", indexValue: 103.8, status: "MODERATE", hub: "Kempegowda Intl (BLR)" },
    { state: "Tamil Nadu", code: "TN", indexValue: 102.1, status: "STABLE", hub: "Chennai Intl (MAA)" },
    { state: "West Bengal", code: "WB", indexValue: 101.9, status: "STABLE", hub: "Netaji Subhash Chandra Bose (CCU)" },
    { state: "Telangana", code: "TG", indexValue: 103.1, status: "MODERATE", hub: "Rajiv Gandhi Intl (HYD)" }
  ];

  return (
    <main className="p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto font-sans">
      <div>
        <div className="flex items-center gap-2.5">
          <Map className="w-7 h-7 text-rose-400" />
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">
            India Regional Airfare Index Heatmap
          </h1>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
            STATE-LEVEL
          </span>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-1">
          State-level aggregated fare pressures informed by primary origin-destination corridor traffic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayHeatmap.map((h) => (
          <div key={h.code} className="glass-panel p-5 rounded-2xl border border-[#143159] space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base font-display">{h.state}</h3>
              <span className="text-xs font-mono font-semibold bg-[#071529] px-2 py-0.5 rounded text-slate-300 border border-[#143159]">
                {h.code}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">{h.hub}</p>

            <div className="pt-2 flex justify-between items-baseline font-mono">
              <span className="text-2xl font-extrabold text-white">{h.indexValue}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                h.status === 'HIGH' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {h.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
