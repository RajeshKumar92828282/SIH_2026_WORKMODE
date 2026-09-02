"use client";

import React, { useEffect, useState } from "react";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

export function QuickLeadTimeWidget() {
  const [t1Fare,  setT1Fare]  = useState(5800);
  const [t15Fare, setT15Fare] = useState(3900);

  useEffect(() => {
    apiClient.getLeadTimeAnalysis().then((res) => {
      if (res && res.data && res.data.length >= 2) {
        const t1Obj  = res.data.find((d: any) => d.window === "T+1");
        const t15Obj = res.data.find((d: any) => d.window === "T+15");
        if (t1Obj)  setT1Fare(t1Obj.avgLiveFare);
        if (t15Obj) setT15Fare(t15Obj.avgLiveFare);
      }
    }).catch(() => {});
  }, []);

  const spreadPct = Number((((t1Fare - t15Fare) / (t15Fare || 1)) * 100).toFixed(1));

  return (
    <div className="apix-card apix-card-hover p-5 h-full" style={{ background: "#FFFFFF" }}>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(245,166,35,0.10)", border: "1px solid rgba(245,166,35,0.25)" }}
          >
            <Clock className="w-4 h-4" style={{ color: "#F5A623" }} />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold leading-tight" style={{ color: "#172B4D" }}>
              Advance Booking Premium Spread
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: "#7B8A9A" }}>
              T+1 (Emergency) vs T+15 (Planned)
            </p>
          </div>
        </div>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ml-2"
          style={{
            background: "rgba(239,91,91,0.10)",
            color:      "#C0392B",
            border:     "1px solid rgba(239,91,91,0.25)",
          }}
        >
          +{spreadPct}% SPREAD
        </span>
      </div>

      {/* ── T+1 vs T+15 comparison ── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* T+1 Last Minute */}
        <div
          className="p-4 rounded-xl"
          style={{
            background:  "#FFF5F5",
            border:      "1px solid rgba(239,91,91,0.2)",
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#EF5B5B" }}>
            T+1 Last Minute
          </div>
          <div className="text-[22px] font-extrabold leading-tight" style={{ color: "#172B4D" }}>
            ₹{t1Fare.toLocaleString()}
          </div>
          <div className="text-[11px] mt-1.5" style={{ color: "#7B8A9A" }}>
            Surge Prob:{"  "}
            <span style={{ color: "#EF5B5B", fontWeight: 700 }}>78%</span>
          </div>
        </div>

        {/* T+15 Advance */}
        <div
          className="p-4 rounded-xl"
          style={{
            background: "#F0FDF9",
            border:     "1px solid rgba(22,199,163,0.2)",
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#16C7A3" }}>
            T+15 Advance
          </div>
          <div className="text-[22px] font-extrabold leading-tight" style={{ color: "#172B4D" }}>
            ₹{t15Fare.toLocaleString()}
          </div>
          <div className="text-[11px] mt-1.5" style={{ color: "#7B8A9A" }}>
            Volatility:{"  "}
            <span style={{ color: "#16C7A3", fontWeight: 700 }}>±4.2%</span>
          </div>
        </div>
      </div>

      {/* ── Surge Intensity Bar ── */}
      <div className="mb-5 space-y-2">
        <div className="flex justify-between text-[11px]">
          <span style={{ color: "#526579" }}>T+1 Price Surge Intensity</span>
          <span style={{ color: "#F5A623", fontWeight: 600 }}>High Volatility (34.2%)</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "#EAF0F5" }}>
          <div
            className="h-full rounded-full"
            style={{
              width:      "78%",
              background: "linear-gradient(90deg, #16C7A3 0%, #F5A623 55%, #EF5B5B 100%)",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px]" style={{ color: "#7B8A9A" }}>
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* ── Footer link ── */}
      <Link
        href="/lead-time"
        className="flex items-center justify-between text-[12px] font-semibold py-2 px-3 rounded-lg transition-colors no-underline"
        style={{ background: "#F5F8FB", color: "#00B8D9", border: "1px solid #D9E2EC" }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,184,217,0.06)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#F5F8FB"; }}
      >
        <span>Explore All 6 Booking Windows</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
