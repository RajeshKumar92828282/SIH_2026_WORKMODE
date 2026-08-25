"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

export function RouteContributionTable() {
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    apiClient.getRoutes().then((res) => {
      if (res && res.data) setRoutes(res.data);
    }).catch(() => {});
  }, []);

  const displayRoutes = routes.length > 0 ? routes : [
    { id: "DEL-BOM", origin: "Delhi", destination: "Mumbai", weight: 0.45, relativePrice: 108.4, avgLiveFare: 5800, avgStaticFare: 4800, fareChangePct: 12.4 },
    { id: "DEL-BLR", origin: "Delhi", destination: "Bengaluru", weight: 0.35, relativePrice: 104.2, avgLiveFare: 6650, avgStaticFare: 5500, fareChangePct: 8.2 },
    { id: "BOM-BLR", origin: "Mumbai", destination: "Bengaluru", weight: 0.20, relativePrice: 101.9, avgLiveFare: 4700, avgStaticFare: 3900, fareChangePct: -3.1 }
  ];

  return (
    <div className="glass-panel rounded-xl p-5 border border-[#143159]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white font-display">
            Basket Route Weights & Price Relatives
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Two-pass Laspeyres aggregation preventing carrier-window multi-counting
          </p>
        </div>
        <Link
          href="/routes"
          className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>All Corridors</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#143159] text-slate-400 font-semibold bg-[#071529]/60">
              <th className="py-2.5 px-3">ROUTE CORRIDOR</th>
              <th className="py-2.5 px-3">DGCA WEIGHT</th>
              <th className="py-2.5 px-3">BASE FARE (DB1)</th>
              <th className="py-2.5 px-3">LIVE FARE (DB2)</th>
              <th className="py-2.5 px-3">RELATIVE PRICE</th>
              <th className="py-2.5 px-3">INDEX CONTRIBUTION</th>
              <th className="py-2.5 px-3 text-right">24H CHANGE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#143159]/50 text-slate-300">
            {displayRoutes.map((r) => {
              const changePct = r.fareChangePct ?? 0;
              const isUp = changePct >= 0;
              const weightVal = r.weight || 0.33;
              const weightPct = `${(weightVal * 100).toFixed(1)}%`;
              const staticFare = r.avgStaticFare || 4500;
              const liveFare = r.avgLiveFare || 5000;
              const relPrice = r.relativePrice || 105.0;
              const contrib = (weightVal * relPrice).toFixed(2);

              return (
                <tr key={r.id} className="hover:bg-[#0e264a]/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{r.id}</span>
                      <span className="text-[10px] text-slate-400">({r.origin} → {r.destination})</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${weightVal * 100 * 2.2}%` }}
                        />
                      </div>
                      <span className="text-cyan-300 font-semibold">{weightPct}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">₹{staticFare.toLocaleString()}</td>
                  <td className="py-3 px-3 font-semibold text-white">₹{liveFare.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-cyan-400">{relPrice}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">+{contrib} pts</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-bold text-[11px] ${
                        isUp
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {isUp ? `+${changePct.toFixed(1)}%` : `${changePct.toFixed(1)}%`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
