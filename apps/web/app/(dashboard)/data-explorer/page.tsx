'use client';

import { useEffect, useState } from 'react';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { apiClient } from '@/lib/api-client';
import { Database, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataExplorerPage() {
  const [observations, setObservations] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [routeFilter, setRouteFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');

  const fetchObservations = async () => {
    try {
      const res = await apiClient.getObservations(page, 20, routeFilter || undefined, carrierFilter || undefined);
      setObservations(res.data || []);
      setMeta(res.meta || {});
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, [page, routeFilter, carrierFilter]);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <HeaderBar />
      <main className="p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Database className="w-8 h-8 text-cyan-400" /> Data Explorer
            </h1>
            <p className="text-sm text-gray-400 mt-1">Raw, audit-ready index result observation browser across all computed tick batches.</p>
          </div>

          <div className="flex space-x-3">
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-gray-200"
            >
              <option value="">All Routes</option>
              <option value="DEL-BOM">DEL-BOM</option>
              <option value="DEL-BLR">DEL-BLR</option>
              <option value="BOM-BLR">BOM-BLR</option>
            </select>

            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-gray-200"
            >
              <option value="">All Carriers</option>
              <option value="IGO">IndiGo (IGO)</option>
              <option value="SEJ">SpiceJet (SEJ)</option>
            </select>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 uppercase font-semibold border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Tick Timestamp</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Carrier</th>
                  <th className="py-3 px-4">Lead Time</th>
                  <th className="py-3 px-4">Static Fare</th>
                  <th className="py-3 px-4">Live Fare</th>
                  <th className="py-3 px-4">Relative Price</th>
                  <th className="py-3 px-4">Index Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {observations.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(o.computedAt).toLocaleTimeString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-400">{o.routeId}</td>
                    <td className="py-3 px-4 text-purple-300">{o.carrierId}</td>
                    <td className="py-3 px-4 text-amber-300">{o.leadTimeWindow}</td>
                    <td className="py-3 px-4 text-gray-400">₹{o.staticTotalFare}</td>
                    <td className="py-3 px-4 font-semibold text-white">₹{o.liveTotalFare}</td>
                    <td className="py-3 px-4 text-emerald-400">{o.relativePrice}</td>
                    <td className="py-3 px-4 font-bold text-indigo-300">{o.indexContribution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-800 text-xs text-gray-400">
            <span>Page {meta.page || 1} of {Math.ceil((meta.total || 1) / (meta.limit || 20))} ({meta.total || 0} Total Records)</span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg bg-gray-800 disabled:opacity-40 hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= Math.ceil((meta.total || 1) / (meta.limit || 20))}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg bg-gray-800 disabled:opacity-40 hover:bg-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
