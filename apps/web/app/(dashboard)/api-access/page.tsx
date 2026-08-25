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
      <div>
        <div className="flex items-center gap-2.5">
          <Key className="w-7 h-7 text-purple-400" />
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">
            Institutional API Developer Portal & Bearer Keys
          </h1>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
            REST v1.4
          </span>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Issue Bearer API keys for automated institutional callers (RBI Monetary Policy, NSO, MoSPI, Academic Researchers).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Key Generator */}
        <div className="glass-panel p-6 rounded-2xl border border-[#143159] space-y-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-bold text-white font-display">Generate Institutional Bearer API Key</h2>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Organization Identifier</label>
              <input
                type="text"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                className="w-full bg-[#071529] border border-[#143159] rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <button
              onClick={handleGenerateKey}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#002636] font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/20"
            >
              {loading ? "Generating..." : "Issue New Bearer API Key"}
            </button>
          </div>

          {newKey && (
            <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800 space-y-2 font-mono">
              <p className="text-xs font-semibold text-emerald-400">Key Generated (Copy immediately - shown once):</p>
              <div className="flex items-center justify-between bg-[#040d1a] p-2.5 rounded-lg border border-[#143159] text-xs text-white">
                <span className="truncate pr-2">{newKey}</span>
                <button onClick={copyToClipboard} className="text-slate-400 hover:text-white">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* cURL Usage Code Snippet */}
        <div className="glass-panel p-6 rounded-2xl border border-[#143159] space-y-4">
          <h2 className="text-lg font-bold text-white font-display">cURL Request Specification</h2>
          <div className="bg-[#040d1a] p-4 rounded-xl border border-[#143159] font-mono text-xs text-slate-300 overflow-x-auto space-y-1">
            <p className="text-slate-500"># Institutional Bearer Auth Header</p>
            <p className="text-emerald-400">curl -X GET "http://localhost:3000/api/v1/index" \</p>
            <p className="pl-4 text-cyan-300">-H "Authorization: Bearer {newKey || 'apix_live_sec_89df2019a84b0e'}" \</p>
            <p className="pl-4 text-purple-300">-H "Content-Type: application/json"</p>
          </div>
        </div>
      </div>
    </main>
  );
}
