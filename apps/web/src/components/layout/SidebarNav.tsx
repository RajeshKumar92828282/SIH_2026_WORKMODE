'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  GitRoute,
  Clock,
  Plane,
  MapPin,
  Database,
  Bell,
  Key,
  BookOpen,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { name: 'Index Overview', href: '/', icon: TrendingUp },
  { name: 'Route Trend Analysis', href: '/routes', icon: GitRoute },
  { name: 'Lead-Time Analysis', href: '/lead-time', icon: Clock },
  { name: 'Airline Comparison', href: '/airlines', icon: Plane },
  { name: 'India Heatmap', href: '/heatmap', icon: MapPin },
  { name: 'Data Explorer', href: '/data-explorer', icon: Database },
  { name: 'Alerts & Anomalies', href: '/alerts', icon: Bell },
  { name: 'API Access Portal', href: '/api-access', icon: Key },
  { name: 'Methodology & Trust', href: '/methodology', icon: BookOpen }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass-panel border-r border-gray-800/60 flex flex-col h-screen sticky top-0 z-40">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-800/60 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
            APIx <span className="text-xs bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">INDIA</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium">Airfare Price Index Engine</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              <Icon
                className={`w-4 h-4 mr-3 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Institutional Banner */}
      <div className="p-4 border-t border-gray-800/60">
        <div className="bg-gray-900/80 rounded-xl p-3 border border-gray-800 text-xs">
          <p className="text-gray-400 font-medium">Institutional Access:</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-blue-800/50">RBI</span>
            <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-800/50">NSO</span>
            <span className="bg-purple-950 text-purple-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-purple-800/50">MoSPI</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
