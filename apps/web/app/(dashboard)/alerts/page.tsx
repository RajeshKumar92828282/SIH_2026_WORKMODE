'use client';

import { useEffect, useState } from 'react';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { apiClient } from '@/lib/api-client';
import { Bell, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    apiClient.getAlerts().then((res) => setAlerts(res.data || []));
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <HeaderBar />
      <main className="p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-rose-400" /> Systemic Alerts & Anomaly Notifications
          </h1>
          <p className="text-sm text-gray-400 mt-1">Real-time automated fare spike detectors (&gt;25% intraday surge) and data quality monitors.</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <p className="font-semibold text-white">No active fare anomalies or quality flags</p>
              <p className="text-xs">The market mutator and compare engine report normal variation baseline.</p>
            </div>
          ) : (
            alerts.map((a) => (
              <div key={a.id} className="bg-rose-950/40 p-4 rounded-xl border border-rose-800/60 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-rose-400">{a.type}</span>
                    <span className="text-[11px] text-gray-400">{new Date(a.createdAt).toLocaleTimeString('en-IN')}</span>
                  </div>
                  <p className="text-sm font-medium text-white mt-1">{a.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
