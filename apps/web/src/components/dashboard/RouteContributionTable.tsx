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
    { id: "DEL-BOM", origin: "Delhi",     destination: "Mumbai",    weight: 0.45, relativePrice: 108.4, avgLiveFare: 5800, avgStaticFare: 4800, fareChangePct: 12.4  },
    { id: "DEL-BLR", origin: "Delhi",     destination: "Bengaluru", weight: 0.35, relativePrice: 104.2, avgLiveFare: 6650, avgStaticFare: 5500, fareChangePct: 8.2   },
    { id: "BOM-BLR", origin: "Mumbai",    destination: "Bengaluru", weight: 0.20, relativePrice: 101.9, avgLiveFare: 4700, avgStaticFare: 3900, fareChangePct: -3.1  },
  ];

  return (
    <div className="apix-card apix-card-hover" style={{ background: "#FFFFFF", overflow: "hidden" }}>
      {/* ── Card Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid #D9E2EC" }}
      >
        <div>
          <h3 className="text-[15px] font-semibold" style={{ color: "#172B4D" }}>
            Basket Route Weights & Price Relatives
          </h3>
          <p className="text-[12px] mt-0.5" style={{ color: "#526579" }}>
            Two-pass Laspeyres aggregation · DGCA traffic weighted
          </p>
        </div>
        <Link
          href="/routes"
          className="flex items-center gap-1.5 text-[12px] font-semibold no-underline transition-colors"
          style={{ color: "#00B8D9" }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#0099B5"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#00B8D9"; }}
        >
          <span>All Corridors</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#EAF0F5" }}>
              {[
                "Route Corridor",
                "DGCA Weight",
                "Base Fare (DB1)",
                "Live Fare (DB2)",
                "Relative Price",
                "Index Contribution",
                "24H Change",
              ].map((col, i) => (
                <th
                  key={col}
                  className="py-2.5 px-4 text-left"
                  style={{
                    color:       "#526579",
                    fontSize:    "11px",
                    fontWeight:  600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #D9E2EC",
                    textAlign:   i === 6 ? "right" : "left",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRoutes.map((r, rowIdx) => {
              const changePct  = r.fareChangePct ?? 0;
              const isUp       = changePct >= 0;
              const weightVal  = r.weight || 0.33;
              const weightPct  = `${(weightVal * 100).toFixed(1)}%`;
              const staticFare = r.avgStaticFare || 4500;
              const liveFare   = r.avgLiveFare   || 5000;
              const relPrice   = r.relativePrice  || 105.0;
              const contrib    = (weightVal * relPrice).toFixed(2);

              return (
                <tr
                  key={r.id}
                  style={{
                    background:   "#FFFFFF",
                    borderBottom: "1px solid #EAF0F5",
                    transition:   "background 150ms ease",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "#F2FAFC"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = "#FFFFFF"; }}
                >
                  {/* Route ID */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold" style={{ color: "#172B4D" }}>
                        {r.id}
                      </span>
                      <span className="text-[11px]" style={{ color: "#7B8A9A" }}>
                        {r.origin} → {r.destination}
                      </span>
                    </div>
                  </td>

                  {/* DGCA Weight bar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-16 h-1.5 rounded-full overflow-hidden"
                        style={{ background: "#EAF0F5" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width:      `${Math.min(weightVal * 100 * 2.2, 100)}%`,
                            background: "#00B8D9",
                          }}
                        />
                      </div>
                      <span className="text-[12px] font-semibold" style={{ color: "#172B4D" }}>
                        {weightPct}
                      </span>
                    </div>
                  </td>

                  {/* Base fare */}
                  <td className="py-3 px-4 text-[12px]" style={{ color: "#7B8A9A" }}>
                    ₹{staticFare.toLocaleString()}
                  </td>

                  {/* Live fare */}
                  <td className="py-3 px-4 text-[12px] font-semibold" style={{ color: "#172B4D" }}>
                    ₹{liveFare.toLocaleString()}
                  </td>

                  {/* Relative price */}
                  <td className="py-3 px-4">
                    <span className="text-[12px] font-bold" style={{ color: "#00B8D9" }}>
                      {relPrice}
                    </span>
                  </td>

                  {/* Index contribution */}
                  <td className="py-3 px-4">
                    <span className="text-[12px] font-bold" style={{ color: "#16A98B" }}>
                      +{contrib} pts
                    </span>
                  </td>

                  {/* 24H change badge */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: isUp ? "rgba(22,199,163,0.10)" : "rgba(239,91,91,0.10)",
                        color:      isUp ? "#0D8A73"               : "#C0392B",
                        border:     `1px solid ${isUp ? "rgba(22,199,163,0.25)" : "rgba(239,91,91,0.25)"}`,
                      }}
                    >
                      {isUp
                        ? <ArrowUpRight className="w-3 h-3" />
                        : <ArrowDownRight className="w-3 h-3" />
                      }
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
