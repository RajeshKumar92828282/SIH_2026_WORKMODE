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
    { id: "DEL-BOM", avgLiveFare: 5800,  fareChangePct: 12.4  },
    { id: "DEL-BLR", avgLiveFare: 6650,  fareChangePct: 8.2   },
    { id: "BOM-BLR", avgLiveFare: 4700,  fareChangePct: -3.1  },
    { id: "CCU-BOM", avgLiveFare: 5200,  fareChangePct: 5.7   },
    { id: "MAA-DEL", avgLiveFare: 7100,  fareChangePct: -1.8  },
    { id: "HYD-BOM", avgLiveFare: 4300,  fareChangePct: 9.3   },
  ];

  return (
    <div
      className="w-full h-9 flex items-center overflow-hidden z-40 sticky select-none font-mono"
      style={{
        background:  "#102B3D",
        borderBottom: "1px solid rgba(0,184,217,0.15)",
        boxShadow:   "0 2px 8px rgba(0,0,0,0.15)",
        top: "56px",  /* sits below 14-height header */
      }}
    >
      {/* Left label */}
      <div
        className="flex-shrink-0 px-4 flex items-center gap-2 h-full"
        style={{
          background:   "#0B1726",
          borderRight:  "1px solid rgba(0,184,217,0.2)",
          minWidth:     "fit-content",
        }}
      >
        <Radio className="w-3.5 h-3.5 animate-pulse" style={{ color: "#EF5B5B" }} />
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#00B8D9" }}>
          LIVE FARES:
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="ticker-wrap flex-1 overflow-hidden">
        <div className="ticker-scroll">
          {/* Render twice for seamless loop */}
          {[0, 1].map((set) => (
            <div key={set} className="inline-flex items-center gap-0 shrink-0">
              {displayRoutes.map((r) => {
                const isUp = (r.fareChangePct ?? 0) >= 0;
                return (
                  <div
                    key={`${set}-${r.id}`}
                    className="flex items-center gap-2 px-5 shrink-0"
                    style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <span className="text-[12px] font-bold" style={{ color: "#D9E8F2" }}>
                      {r.id}
                    </span>
                    <span className="text-[12px]" style={{ color: "#7B8A9A" }}>
                      ₹{(r.avgLiveFare || 5000).toLocaleString()}
                    </span>
                    <span
                      className="flex items-center text-[11px] font-semibold"
                      style={{ color: isUp ? "#16C7A3" : "#EF5B5B" }}
                    >
                      {isUp
                        ? <ArrowUpRight className="w-3 h-3" />
                        : <ArrowDownRight className="w-3 h-3" />
                      }
                      {isUp
                        ? `+${(r.fareChangePct || 0).toFixed(1)}%`
                        : `${(r.fareChangePct || 0).toFixed(1)}%`
                      }
                    </span>
                  </div>
                );
              })}

              {/* APIX Headline value */}
              <div
                className="flex items-center gap-2 px-5 shrink-0"
                style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}
              >
                <span className="text-[11px] font-semibold" style={{ color: "#7B8A9A" }}>
                  NATIONAL APIX:
                </span>
                <span className="text-[12px] font-bold" style={{ color: "#F5A623" }}>
                  114.28
                </span>
                <span className="text-[11px] font-bold" style={{ color: "#16C7A3" }}>
                  +1.42% (24H)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
