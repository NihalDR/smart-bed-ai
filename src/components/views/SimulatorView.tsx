import React, { useState } from 'react';
import {
  Play,
  Settings2,
  AlertTriangle,
  Hospital,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SimulatorView() {
  const [params, setParams] = useState({
    acuity_modifier: 1.0,
    inflow_modifier: 1.0,
    staff_availability: 1.0
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('smartbed_token');
      const res = await fetch('http://localhost:8000/api/simulator/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        setResults(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    setParams({
      ...params,
      [key]: parseFloat(e.target.value)
    });
  };

  const setScenario = (scenario: 'baseline' | 'surge' | 'disaster') => {
    if (scenario === 'baseline') setParams({ acuity_modifier: 1.0, inflow_modifier: 1.0, staff_availability: 1.0 });
    if (scenario === 'surge') setParams({ acuity_modifier: 1.2, inflow_modifier: 1.5, staff_availability: 0.9 });
    if (scenario === 'disaster') setParams({ acuity_modifier: 1.5, inflow_modifier: 2.5, staff_availability: 0.7 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Constraints Panel */}
      <div className="glass-card rounded-2xl p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Scenario Parameters</h3>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          {/* Presets */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            <button onClick={() => setScenario('baseline')} className="text-xs font-medium py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition">Baseline</button>
            <button onClick={() => setScenario('surge')} className="text-xs font-medium py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition">Flu Surge</button>
            <button onClick={() => setScenario('disaster')} className="text-xs font-medium py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition">MCI / Disaster</button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">Patient Inflow Multiplier</span>
              <span className="text-indigo-400 font-mono">{params.inflow_modifier}x</span>
            </div>
            <input
              type="range"
              min="0.5" max="3.0" step="0.1"
              value={params.inflow_modifier}
              onChange={(e) => handleSliderChange(e, 'inflow_modifier')}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-2"
            />
            <p className="text-xs text-slate-500">Base: ~120 emergency admissions/day</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">Average Acuity Level</span>
              <span className="text-indigo-400 font-mono">{params.acuity_modifier}x</span>
            </div>
            <input
              type="range"
              min="0.8" max="2.0" step="0.1"
              value={params.acuity_modifier}
              onChange={(e) => handleSliderChange(e, 'acuity_modifier')}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg appearance-none h-2"
            />
            <p className="text-xs text-slate-500">Increases proportion of critical (Red) patients</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">Staff Availability</span>
              <span className="text-indigo-400 font-mono">{Math.round(params.staff_availability * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5" max="1.0" step="0.05"
              value={params.staff_availability}
              onChange={(e) => handleSliderChange(e, 'staff_availability')}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg appearance-none h-2"
            />
            <p className="text-xs text-slate-500">Affects bed cleaning times and nurse ratios</p>
          </div>
        </div>

        <button
          onClick={runSimulation}
          disabled={loading}
          className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
        >
          {loading ? 'Running Event-Driven Simulation...' : <><Play className="w-5 h-5 fill-current" /> Run Simulation</>}
        </button>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card rounded-2xl p-6 min-h-[400px] flex flex-col relative overflow-hidden">
          {(!results && !loading) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
              <Activity className="w-16 h-16 mb-4 opacity-20" />
              <p>Configure parameters and run simulation to view projections.</p>
            </div>
          )}

          {results && (
            <>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">72-Hour Stress Projection</h3>
                  <p className="text-sm text-slate-400">Monte Carlo simulation results ({results.metrics.max_occupancy_pct}% peak occupancy)</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider
                  ${results.metrics.max_occupancy_pct >= 100 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    results.metrics.max_occupancy_pct >= 85 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}
                `}>
                  {results.metrics.max_occupancy_pct >= 100 ? 'Capacity Exceeded' : 'Manageable'}
                </div>
              </div>

              <div className="h-64 mb-6 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.timeline}>
                    <defs>
                      <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} domain={[60, 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                      labelFormatter={(l) => `Hour ${l}`}
                    />
                    <Area type="monotone" dataKey="occupancy" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorSim)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto relative z-10">
                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 mb-1">Peak Occupancy</div>
                  <div className="text-lg font-bold text-white">{results.metrics.max_occupancy_pct}%</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 mb-1">Avg Wait Time</div>
                  <div className={`text-lg font-bold ${results.metrics.avg_wait_mins > 60 ? 'text-red-400' : 'text-amber-400'}`}>
                    {results.metrics.avg_wait_mins}m
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 mb-1">Beds Shortfall</div>
                  <div className="text-lg font-bold text-red-400">{results.metrics.patients_diverted}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 mb-1">Bottleneck</div>
                  <div className="text-sm font-bold text-white mt-1 pt-1 truncate">ICU Capacity</div>
                </div>
              </div>
            </>
          )}
        </div>

        {results && results.metrics.max_occupancy_pct >= 95 && (
          <div className="glass-card rounded-2xl p-6 border-red-500/30 bg-red-500/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-full text-red-500 glow-critical">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white">System Failure Probable</h4>
                <p className="text-sm text-slate-400 mt-1">This scenario exceeds critical capacity. Activate mitigation protocols.</p>
              </div>
            </div>
            <button className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-6 rounded-lg transition text-sm">
              Activate Preemption
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
