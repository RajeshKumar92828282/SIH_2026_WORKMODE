"use client";

import React, { useEffect, useState } from "react";
import { Database, ChevronLeft, ChevronRight, Download, Filter } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function DataExplorerPage() {
  const [observations, setObservations] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [routeFilter, setRouteFilter] = useState("");
  const [carrierFilter, setCarrierFilter] = useState("");
  const [leadTimeFilter, setLeadTimeFilter] = useState("");

  const fetchObservations = async () => {
    try {
      const res = await apiClient.getObservations(
        page,
        20,
        routeFilter || undefined,
        carrierFilter || undefined,
        leadTimeFilter || undefined
      );
      if (res && res.data) setObservations(res.data);
      if (res && res.meta) setMeta(res.meta);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, [page, routeFilter, carrierFilter, leadTimeFilter]);

  const exportCSV = () => {
    if (observations.length === 0) return;
    const headers = ["Timestamp", "Route", "Carrier", "LeadTime", "StaticFare", "LiveFare", "RelativePrice", "Contribution"];
    const rows = observations.map(o => [
      new Date(o.computedAt).toISOString(),
      o.routeId,
      o.carrierId,
      o.leadTimeWindow,
      o.staticTotalFare,
      o.liveTotalFare,
      o.relativePrice,
      o.indexContribution
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `apix_observations_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (observations.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(observations, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.setAttribute("download", `apix_observations_page_${page}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Database className="w-7 h-7 text-[#00B8D9]" />
            <h1 className="text-2xl font-extrabold text-[#172B4D] font-display tracking-tight">
              Raw Observation Data Explorer
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#00B8D9]/10 text-[#007A99] border border-[#00B8D9]/30 font-bold">
              AUDIT-READY
            </span>
          </div>
          <p className="text-xs text-[#486581] font-mono mt-1">
            Filterable inspection table across all 1-minute market tick calculation batches.
          </p>
        </div>

        {/* Action Controls: Export Buttons */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00B8D9]/10 hover:bg-[#00B8D9]/20 text-[#007A99] border border-[#00B8D9]/30 text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="apix-card p-4 flex flex-wrap items-center gap-4 text-xs font-mono shadow-sm" style={{ background: "#FFFFFF" }}>
        <div className="flex items-center gap-2 text-[#486581] font-bold">
          <Filter className="w-4 h-4 text-[#00B8D9]" />
          <span>FILTER OBSERVATIONS:</span>
        </div>

        <select
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          className="bg-[#F5F8FB] border border-[#D9E2EC] rounded-xl px-3 py-2 text-[#172B4D] font-semibold focus:outline-none focus:border-[#00B8D9]"
        >
          <option value="">All Route Corridors</option>
          <option value="DEL-BOM">DEL-BOM (Delhi ➔ Mumbai)</option>
          <option value="DEL-BLR">DEL-BLR (Delhi ➔ Bengaluru)</option>
          <option value="BOM-BLR">BOM-BLR (Mumbai ➔ Bengaluru)</option>
        </select>

        <select
          value={carrierFilter}
          onChange={(e) => setCarrierFilter(e.target.value)}
          className="bg-[#F5F8FB] border border-[#D9E2EC] rounded-xl px-3 py-2 text-[#172B4D] font-semibold focus:outline-none focus:border-[#00B8D9]"
        >
          <option value="">All Carriers</option>
          <option value="IGO">IndiGo (IGO)</option>
          <option value="SEJ">SpiceJet (SEJ)</option>
          <option value="AIC">Air India (AIC)</option>
          <option value="VTI">Vistara (VTI)</option>
          <option value="AKJ">Akasa Air (AKJ)</option>
        </select>

        <select
          value={leadTimeFilter}
          onChange={(e) => setLeadTimeFilter(e.target.value)}
          className="bg-[#F5F8FB] border border-[#D9E2EC] rounded-xl px-3 py-2 text-[#172B4D] font-semibold focus:outline-none focus:border-[#00B8D9]"
        >
          <option value="">All Lead Times</option>
          <option value="T+1">T+1 (1 Day Emergency)</option>
          <option value="T+15">T+15 (15 Days Advance)</option>
        </select>
      </div>

      {/* Observation Data Table */}
      <div className="apix-card p-6 shadow-sm" style={{ background: "#FFFFFF" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#EAF0F5] text-[#486581] uppercase font-semibold border-b border-[#D9E2EC]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Lead Time</th>
                <th className="py-3 px-4">Static Fare (DB1)</th>
                <th className="py-3 px-4">Live Fare (DB2)</th>
                <th className="py-3 px-4">Relative Price</th>
                <th className="py-3 px-4">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF0F5] text-[#172B4D]">
              {observations.map((o) => (
                <tr key={o.id} className="hover:bg-[#F2FAFC] transition-colors">
                  <td className="py-3 px-4 text-[#627D98]">
                    {new Date(o.computedAt).toLocaleTimeString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#007A99]">{o.routeId}</td>
                  <td className="py-3 px-4 text-purple-700 font-semibold">{o.carrierId}</td>
                  <td className="py-3 px-4 text-[#9A6A00] font-semibold">{o.leadTimeWindow}</td>
                  <td className="py-3 px-4 text-[#627D98]">₹{o.staticTotalFare}</td>
                  <td className="py-3 px-4 font-bold text-[#172B4D]">₹{o.liveTotalFare}</td>
                  <td className="py-3 px-4 text-[#0D8A73] font-bold">{o.relativePrice}</td>
                  <td className="py-3 px-4 font-bold text-indigo-700">{o.indexContribution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-[#EAF0F5] text-xs font-mono text-[#486581]">
          <span>Page {meta.page || 1} of {Math.max(1, Math.ceil((meta.total || 1) / (meta.limit || 20)))} ({meta.total || observations.length} Total Records)</span>
          <div className="flex space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg bg-[#F5F8FB] border border-[#D9E2EC] disabled:opacity-40 hover:bg-[#EAF0F5] text-[#172B4D] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= Math.ceil((meta.total || 1) / (meta.limit || 20))}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg bg-[#F5F8FB] border border-[#D9E2EC] disabled:opacity-40 hover:bg-[#EAF0F5] text-[#172B4D] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
