"use client";

import React, { useEffect, useState } from "react";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

export function QuickLeadTimeWidget() {
  const [t1Fare, setT1Fare] = useState(5800);
  const [t15Fare, setT15Fare] = useState(3900);

  useEffect(() => {
    apiClient.getLeadTimeAnalysis().then((res) => {
      if (res && res.data && res.data.length >= 2) {
        const t1Obj = res.data.find((d: any) => d.window === "T+1");
        const t15Obj = res.data.find((d: any) => d.window === "T+15");
        if (t1Obj) setT1Fare(t1Obj.avgLiveFare);
        if (t15Obj) setT15Fare(t15Obj.avgLiveFare);
      }
    }).catch(() => {});
  }, []);

  const spreadPct = Number((((t1Fare - t15Fare) / (t15Fare || 1)) * 100).toFixed(1));

  return (
    <div className="glass-panel rounded-xl p-5 border border-[#143159]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">Advance Booking Premium Spread</h3>
            <p className="text-[11px] text-slate-400 font-mono">T+1 (Emergency) vs T+15 (Advance Plan)</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-bold">
          +{spreadPct}% SPREAD
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 font-mono">
        <div className="p-3 rounded-lg bg-[#071529] border border-red-500/30 relative overflow-hidden">
          <div className="text-[10px] text-red-400 font-semibold uppercase">T+1 (Last Minute)</div>
          <div className="text-lg font-bold text-white mt-1">₹{t1Fare.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-1">Surge Prob: <span className="text-red-400 font-bold">78%</span></div>
        </div>

        <div className="p-3 rounded-lg bg-[#071529] border border-emerald-500/30 relative overflow-hidden">
          <div className="text-[10px] text-emerald-400 font-semibold uppercase">T+15 (Advance Plan)</div>
          <div className="text-lg font-bold text-white mt-1">₹{t15Fare.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-1">Volatility: <span className="text-emerald-400 font-bold">±4.2%</span></div>
        </div>
      </div>

      {/* Progress / Surge Bar */}
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>T+1 Price Surge Intensity</span>
          <span className="text-amber-400 font-semibold">High Volatility (34.2%)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 rounded-full" style={{ width: '78%' }} />
        </div>
      </div>

      <Link
        href="/lead-time"
        className="flex items-center justify-between text-xs font-mono text-cyan-400 hover:text-cyan-300 py-1 transition-colors"
      >
        <span>Explore All 6 Advance Booking Windows</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
