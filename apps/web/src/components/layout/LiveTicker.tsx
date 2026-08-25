"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Radio } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export function LiveTicker() {
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    apiClient.getRoutes().then((res) => {
      if (res && res.data) setRoutes(res.data);
    }).catch(() => {});
  }, []);

  const displayRoutes = routes.length > 0 ? routes : [
    { id: "DEL-BOM", avgLiveFare: 5800, fareChangePct: 12.4 },
    { id: "DEL-BLR", avgLiveFare: 6650, fareChangePct: 8.2 },
    { id: "BOM-BLR", avgLiveFare: 4700, fareChangePct: -3.1 }
  ];

  return (
    <div className="w-full h-9 bg-[#002636]/70 backdrop-blur-xl border-b border-[rgba(135,214,235,0.25)] flex items-center overflow-hidden z-40 sticky top-16 font-mono select-none shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex-shrink-0 px-4 flex items-center gap-2 bg-[#001b27] z-20 border-r border-[rgba(135,214,235,0.3)] h-full shadow-[4px_0_12px_rgba(0,0,0,0.6)]">
        <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
        <span className="text-[11px] font-bold text-[#00daf3] uppercase tracking-wider">TICKER (1-MIN LIVE):</span>
      </div>

      <div className="ticker-wrap flex-1 overflow-hidden relative">
        <div className="ticker-scroll">
          <div className="inline-flex items-center gap-6 px-4 text-xs font-mono shrink-0">
            {displayRoutes.map((r) => {
              const isUp = (r.fareChangePct ?? 0) >= 0;
              return (
                <div key={`set1-${r.id}`} className="flex items-center gap-2 shrink-0">
                  <span className="text-white font-bold">{r.id}</span>
                  <span className="text-slate-300">₹{(r.avgLiveFare || 5000).toLocaleString()}</span>
                  <span
                    className={`flex items-center text-[11px] font-semibold ${
                      isUp ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isUp ? `+${(r.fareChangePct || 0).toFixed(1)}%` : `${(r.fareChangePct || 0).toFixed(1)}%`}
                  </span>
                  <span className="text-white/20 font-light">|</span>
                </div>
              );
            })}
            <div className="flex items-center gap-2 shrink-0 text-amber-400">
              <span className="font-semibold">NATIONAL APIx: 114.28</span>
              <span className="text-emerald-400 font-bold">+1.42% (24H)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
