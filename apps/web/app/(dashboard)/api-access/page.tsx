'use client';

import { useState } from 'react';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { apiClient } from '@/lib/api-client';
import { Key, Copy, Check, Shield } from 'lucide-react';

export default function ApiAccessPage() {
  const [orgId, setOrgId] = useState('rbi-monetary-policy');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateKey = async () => {
    try {
      setLoading(true);
      const res = await apiClient.createApiKey(orgId, 'read:index', 'institutional');
      setNewKey(res.data.apiKey);
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
    <div className="flex-1 flex flex-col min-h-screen">
      <HeaderBar />
      <main className="p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Key className="w-8 h-8 text-purple-400" /> Institutional API Access & Documentation
          </h1>
          <p className="text-sm text-gray-400 mt-1">Issue API keys for automated institutional consumers (RBI Monetary Policy, NSO, MoSPI, Academic Researchers).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Key Generator */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Generate Institutional Bearer API Key</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Organization Identifier</label>
                <input
                  type="text"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white font-mono"
                />
              </div>

              <button
                onClick={handleGenerateKey}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-blue-500/20"
              >
                {loading ? 'Generating...' : 'Issue New API Key'}
              </button>
            </div>

            {newKey && (
              <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800 space-y-2">
                <p className="text-xs font-semibold text-emerald-400">Key Generated (Copy immediately - shown once):</p>
                <div className="flex items-center justify-between bg-gray-950 p-2.5 rounded-lg border border-gray-800 font-mono text-xs text-white">
                  <span className="truncate pr-2">{newKey}</span>
                  <button onClick={copyToClipboard} className="text-gray-400 hover:text-white">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* cURL Usage Code Snippet */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h2 className="text-lg font-bold text-white">cURL Request Example</h2>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto">
              <p className="text-gray-500"># Institutional Auth Header</p>
              <p className="text-emerald-400">curl -X GET "http://localhost:3000/api/v1/index" \</p>
              <p className="pl-4 text-blue-300">-H "Authorization: Bearer {newKey || 'apix_live_sample_key'}" \</p>
              <p className="pl-4 text-purple-300">-H "Content-Type: application/json"</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
