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
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <Map className="w-7 h-7 text-[#EF5B5B]" />
          <h1 className="text-2xl font-extrabold text-[#172B4D] font-display tracking-tight">
            India Regional Airfare Index Heatmap
          </h1>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
            STATE-LEVEL
          </span>
        </div>
        <p className="text-xs text-[#486581] font-mono mt-1">
          State-level aggregated fare pressures informed by primary origin-destination corridor traffic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayHeatmap.map((h) => (
          <div key={h.code} className="apix-card apix-card-hover p-5 space-y-3 shadow-sm" style={{ background: "#FFFFFF" }}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#172B4D] text-base font-display">{h.state}</h3>
              <span className="text-xs font-mono font-semibold bg-[#F5F8FB] px-2 py-0.5 rounded text-[#486581] border border-[#D9E2EC]">
                {h.code}
              </span>
            </div>
            <p className="text-[11px] text-[#627D98] font-mono">{h.hub}</p>

            <div className="pt-2 flex justify-between items-baseline font-mono border-t border-[#EAF0F5]">
              <span className="text-2xl font-extrabold text-[#172B4D]">{h.indexValue}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                h.status === 'HIGH' ? 'bg-red-50 text-[#C0392B] border border-red-200' : 'bg-emerald-50 text-[#0D8A73] border border-emerald-200'
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
