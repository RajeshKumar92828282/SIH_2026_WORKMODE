"use client";

import React, { useEffect, useState } from "react";
import { Aircraft3DHero } from "@/components/visualizer/Aircraft3DHero";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { IndexChart } from "@/components/dashboard/IndexChart";
import { QuickLeadTimeWidget } from "@/components/dashboard/QuickLeadTimeWidget";
import { RouteContributionTable } from "@/components/dashboard/RouteContributionTable";
import { useAppStore } from "@/lib/store";
import { apiClient } from "@/lib/api-client";
import {
  TrendingUp,
  Activity,
  Layers,
  ShieldCheck,
  Zap,
  Radio,
  Eye,
  Maximize2
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { show3DHero, toggle3DHero } = useAppStore();
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, histRes] = await Promise.all([
        apiClient.getIndexSummary().catch(() => null),
        apiClient.getIndexHistory(30).catch(() => null)
      ]);

      if (sumRes && sumRes.data) setSummary(sumRes.data);
      if (histRes && histRes.data) setHistory(histRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const currentIndex = summary?.currentIndex || 114.28;
  const pctChange = summary?.pctChange24h || 1.42;

  return (
    <main className="p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto font-sans">
      {/* 3D Aeronautical Telemetry Hero Section */}
      {show3DHero && (
        <div className="w-full h-[400px] md:h-[460px] transition-all duration-500 animate-fadeIn">
          <Aircraft3DHero />
        </div>
      )}

      {/* Hero Control Bar if Hidden */}
      {!show3DHero && (
        <div className="flex items-center justify-between p-4 rounded-xl glass-panel border border-[rgba(135,214,235,0.25)] font-mono text-xs">
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-white font-bold">AIRCRAFT 3D TELEMETRY STREAM MINIMIZED</span>
          </div>
          <button
            onClick={toggle3DHero}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors font-bold"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>EXPAND 3D CFD CANVAS</span>
          </button>
        </div>
      )}

      {/* Cockpit HUD Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="NATIONAL APIx INDEX"
          value={currentIndex.toFixed(2)}
          unit="pts"
          change={pctChange}
          changeLabel="vs 24h ago"
          icon={TrendingUp}
          variant="cyan"
          badge="HEADLINE"
        />

        <MetricCard
          title="INTRADAY FARE RANGE"
          value={`₹${(currentIndex * 42).toFixed(0)}`}
          unit="AVG"
          subtext="200–400% Intraday Dynamic Swings"
          icon={Activity}
          variant="emerald"
          badge="DYNAMIC"
        />

        <MetricCard
          title="BASKET CORRIDORS"
          value="6 Routes"
          unit="ACTIVE"
          subtext="5 Airlines • DGCA Traffic Weighted"
          icon={Layers}
          variant="purple"
          badge="2-PASS"
        />

        <MetricCard
          title="CALIBRATION STATUS"
          value="STABLE"
          unit="IQR 1.5"
          subtext="Outlier Filtering Operational"
          icon={ShieldCheck}
          variant="amber"
          badge="AUDIT"
        />
      </div>

      {/* Main Index Time Series Chart */}
      <IndexChart data={history} />

      {/* Grid: Quick Lead-Time & Route Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickLeadTimeWidget />
        </div>
        <div className="lg:col-span-2">
          <RouteContributionTable />
        </div>
      </div>
    </main>
  );
}
