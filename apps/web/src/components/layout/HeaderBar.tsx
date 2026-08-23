'use client';

import { Activity, Clock, Shield } from 'lucide-react';

interface HeaderBarProps {
  lastUpdated?: string;
  sampleCount?: number;
}

export function HeaderBar({ lastUpdated, sampleCount = 12 }: HeaderBarProps) {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Live Ticking';

  return (
    <header className="h-16 border-b border-gray-800/60 glass-panel px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50 flex items-center gap-1.5">
          <Activity className="w-3 h-3" /> Live Market Feed Active
        </span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center text-xs text-gray-400 space-x-2 bg-gray-900/60 px-3 py-1.5 rounded-lg border border-gray-800">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Last Ingest Tick: <strong className="text-white font-mono">{formattedTime}</strong></span>
        </div>

        <div className="flex items-center text-xs text-gray-400 space-x-2 bg-gray-900/60 px-3 py-1.5 rounded-lg border border-gray-800">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>Basket Coverage: <strong className="text-white font-mono">{sampleCount} Quotes / Tick</strong></span>
        </div>
      </div>
    </header>
  );
}
