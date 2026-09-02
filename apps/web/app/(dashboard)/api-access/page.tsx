"use client";

import React, { useState } from "react";
import { Key, Copy, Check, Shield } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function ApiAccessPage() {
  const [orgId, setOrgId] = useState("rbi-monetary-policy");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateKey = async () => {
    try {
      setLoading(true);
      const res = await apiClient.createApiKey(orgId, "read:index", "institutional");
      if (res && res.data) setNewKey(res.data.apiKey);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto font-sans">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <Key className="w-7 h-7 text-purple-600" />
          <h1 className="text-2xl font-extrabold text-[#172B4D] font-display tracking-tight">
            Institutional API Developer Portal & Bearer Keys
          </h1>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
            REST v1.4
          </span>
        </div>
        <p className="text-xs text-[#486581] font-mono mt-1">
          Issue Bearer API keys for automated institutional callers (RBI Monetary Policy, NSO, MoSPI, Academic Researchers).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Key Generator */}
        <div className="apix-card p-6 space-y-6 shadow-sm" style={{ background: "#FFFFFF" }}>
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-bold text-[#172B4D] font-display">Generate Institutional Bearer API Key</h2>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[#486581] font-semibold mb-1">Organization Identifier</label>
              <input
                type="text"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                className="w-full bg-[#F5F8FB] border border-[#D9E2EC] rounded-xl px-4 py-2.5 text-[#172B4D] font-semibold focus:outline-none focus:border-[#00B8D9]"
              />
            </div>

            <button
              onClick={handleGenerateKey}
              disabled={loading}
              className="w-full bg-[#00B8D9] hover:bg-[#0099B5] text-[#FFFFFF] font-bold py-3 rounded-xl transition shadow-md"
            >
              {loading ? "Generating..." : "Issue New Bearer API Key"}
            </button>
          </div>

          {newKey && (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2 font-mono">
              <p className="text-xs font-semibold text-[#0D8A73]">Key Generated (Copy immediately - shown once):</p>
              <div className="flex items-center justify-between bg-[#FFFFFF] p-2.5 rounded-lg border border-[#D9E2EC] text-xs text-[#172B4D] font-bold">
                <span className="truncate pr-2">{newKey}</span>
                <button onClick={copyToClipboard} className="text-[#627D98] hover:text-[#172B4D]">
                  {copied ? <Check className="w-4 h-4 text-[#0D8A73]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* cURL Usage Code Snippet */}
        <div className="apix-card p-6 space-y-4 shadow-sm" style={{ background: "#FFFFFF" }}>
          <h2 className="text-lg font-bold text-[#172B4D] font-display">cURL Request Specification</h2>
          <div className="bg-[#0B1726] p-4 rounded-xl border border-[#143159] font-mono text-xs text-slate-200 overflow-x-auto space-y-1">
            <p className="text-slate-400"># Institutional Bearer Auth Header</p>
            <p className="text-emerald-400">curl -X GET "http://localhost:3000/api/v1/index" \</p>
            <p className="pl-4 text-cyan-300">-H "Authorization: Bearer {newKey || 'apix_live_sec_89df2019a84b0e'}" \</p>
            <p className="pl-4 text-purple-300">-H "Content-Type: application/json"</p>
          </div>
        </div>
      </div>
    </main>
  );
}
