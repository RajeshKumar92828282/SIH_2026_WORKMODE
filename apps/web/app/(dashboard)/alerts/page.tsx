"use client";

import React, { useEffect, useState } from "react";
import { Bell, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [simulated, setSimulated] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await apiClient.getAlerts();
      if (res && res.data) setAlerts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const triggerSimulatedAlert = () => {
    const mockAlert = {
      id: `alt_${Date.now()}`,
      type: "HIGH_VOLATILITY_SPIKE",
      message: "Intraday emergency fare surge detected on DEL-BOM (IndiGo 6E) exceeding +28.4% threshold.",
      createdAt: new Date().toISOString()
    };
    setAlerts([mockAlert, ...alerts]);
    setSimulated(true);
    setTimeout(() => setSimulated(false), 3000);
  };

  return (
    <main className="p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-[#EF5B5B]" />
            <h1 className="text-2xl font-extrabold text-[#172B4D] font-display tracking-tight">
              Systemic Fare Volatility & Anomaly Alerts
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
              SPIKE MONITOR
            </span>
          </div>
          <p className="text-xs text-[#486581] font-mono mt-1">
            Automated real-time anomaly detection triggers flagging intraday fare surges exceeding +25%.
          </p>
        </div>

        {/* Action: Simulate Anomaly Button */}
        <button
          onClick={triggerSimulatedAlert}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-mono font-bold transition-all shadow-sm"
        >
          <Zap className="w-4 h-4 text-rose-600" />
          <span>{simulated ? "SPIKE TRIGGERED!" : "SIMULATE SURGE ANOMALY"}</span>
        </button>
      </div>

      <div className="apix-card p-6 space-y-4" style={{ background: "#FFFFFF" }}>
        {alerts.length === 0 ? (
          <div className="py-12 text-center text-[#486581] flex flex-col items-center justify-center space-y-3 font-mono">
            <CheckCircle2 className="w-10 h-10 text-[#0D8A73]" />
            <p className="font-bold text-[#172B4D] text-base">No active systemic fare spikes or data quality anomalies</p>
            <p className="text-xs text-[#627D98]">Market mutator tick feed calibrated cleanly within baseline limits.</p>
          </div>
        ) : (
          alerts.map((a) => (
            <div key={a.id} className="bg-rose-50/70 p-4.5 rounded-xl border border-rose-200 flex items-start space-x-3.5 font-mono shadow-sm">
              <AlertCircle className="w-5 h-5 text-[#C0392B] flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#C0392B] uppercase tracking-wider">{a.type}</span>
                  <span className="text-[11px] text-[#627D98]">{new Date(a.createdAt).toLocaleTimeString('en-IN')}</span>
                </div>
                <p className="text-sm font-semibold text-[#172B4D] mt-1.5 font-sans leading-relaxed">{a.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
