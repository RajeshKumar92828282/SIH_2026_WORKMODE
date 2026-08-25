"use client";

import React from "react";
import { Aircraft3DHero } from "@/components/visualizer/Aircraft3DHero";
import { Compass, Radio, Activity, ShieldCheck } from "lucide-react";

export default function Telemetry3DPage() {
  return (
    <main className="p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-[#87D6EB]" />
            <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">
              Aeronautical 3D CFD Flight Telemetry
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
              WEBGL2
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time aerodynamics flight attitude mesh rendering & high-altitude atmospheric tone mapping.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-[#071529] border border-[rgba(135,214,235,0.3)] text-emerald-400 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>STREAM: 60 FPS</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Canvas Container */}
      <div className="w-full h-[650px] rounded-2xl overflow-hidden shadow-2xl border border-[rgba(135,214,235,0.3)]">
        <Aircraft3DHero />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="glass-panel p-4 rounded-xl border border-[#143159]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>FLIGHT DYNAMICS MODEL</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-sm font-bold text-white mt-1">Widebody Airbus A340-600</p>
          <p className="text-[11px] text-slate-400 mt-1">Interactive attitude yaw, pitch & roll dampening</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-[#143159]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>ATMOSPHERIC SHADER</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-white mt-1">ACES Filmic Tone-Mapping</p>
          <p className="text-[11px] text-slate-400 mt-1">Equirectangular PMREM sky environment</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-[#143159]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>DATA PIPELINE LATENCY</span>
            <Compass className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-sm font-bold text-white mt-1">4.2ms Direct Buffer</p>
          <p className="text-[11px] text-slate-400 mt-1">Synchronized with 1-min market mutator ticks</p>
        </div>
      </div>
    </main>
  );
}
