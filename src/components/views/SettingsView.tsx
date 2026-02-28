import React, { useState } from 'react';
import {
  Database,
  Server,
  Link2,
  CheckCircle2,
  AlertCircle,
  Save,
  Key
} from 'lucide-react';

export default function SettingsView() {
  const [config, setConfig] = useState({
    apiUrl: 'http://localhost:8000',
    wsUrl: 'ws://localhost:8000',
    apiKey: 'sk-hackathon-xxxxxxxxxxxx',
    webhookUrl: 'https://smartbed-ai.pagerduty.com/trigger'
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">System Configuration</h2>
        <p className="text-slate-400 mt-1">Manage API endpoints, webhook integrations, and authentication keys.</p>
      </div>

      <div className="glass-card rounded-2xl p-8 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
          <Server className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">Backend Connectivity</h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">FastAPI REST Endpoint</label>
              <div className="relative">
                <input
                  type="text"
                  value={config.apiUrl}
                  onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white pl-10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm"
                />
                <Link2 className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">WebSocket URL (Real-time)</label>
              <div className="relative">
                <input
                  type="text"
                  value={config.wsUrl}
                  onChange={(e) => setConfig({ ...config, wsUrl: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white pl-10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm"
                />
                <Database className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
          <Key className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">Security & Integrations</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">API Gateway Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full max-w-md bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Emergency Webhook (e.g. PagerDuty, Slack)</label>
            <input
              type="text"
              value={config.webhookUrl}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Fired automatically when MILP solver fails to allocate critical patients.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 mt-8">
        <button className="px-6 py-2.5 rounded-lg text-slate-300 font-medium hover:bg-slate-800 transition-colors">
          Reset Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/25 border border-indigo-500"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : status === 'success' ? (
            <><CheckCircle2 className="w-5 h-5" /> Saved</>
          ) : (
            <><Save className="w-5 h-5" /> Save Configuration</>
          )}
        </button>
      </div>
    </div>
  );
}
