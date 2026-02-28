import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { Calendar, TrendingUp, AlertCircle, BarChart3, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PredictionsView() {
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const token = localStorage.getItem('smartbed_token');
        const res = await fetch('http://localhost:8000/api/forecast', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setForecast(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (loading || !forecast) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading AI Forecast...</div>;
  }

  // Format data for Recharts, combining lower/upper into an array for area chart
  const formattedData = forecast.data.map((d: any) => ({
    ...d,
    range: d.lower && d.upper ? [d.lower, d.upper] : null
  }));

  const metrics = forecast.metrics;

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 glow-brand">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">AI Admission Forecast</h2>
          </div>
          <p className="text-slate-400 text-sm">
            7-day predictive model using <span className="text-indigo-300 font-mono font-medium">{metrics.model_type}</span>.
            Forecasts daily emergency department inflows to optimize hospital-wide bed availability.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-center">
          <span className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Mean Absolute Error
          </span>
          <div className="text-2xl font-bold text-emerald-400">{metrics.mae} beds</div>
          <p className="text-xs text-slate-500 mt-1">Accuracy on validation set</p>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-center">
          <span className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Root Mean Sq. Error
          </span>
          <div className="text-2xl font-bold text-emerald-400">{metrics.rmse}</div>
          <p className="text-xs text-slate-500 mt-1">Penalty for large deviations</p>
        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">7-Day Occupancy Projection</h3>
            <p className="text-sm text-slate-400">Showing historical actuals vs predicted future</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-3 h-3 rounded-full bg-slate-500" /> Actual
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-3 h-3 rounded-full bg-indigo-500" /> Predicted (95% CI)
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formattedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
              />
              {/* Confidence Interval Area */}
              <Area type="monotone" dataKey="range" stroke="none" fill="#4f46e5" fillOpacity={0.15} />
              {/* Actuals Line */}
              <Line type="monotone" dataKey="actual" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4, fill: '#94a3b8' }} strokeDasharray="5 5" />
              {/* Predicted Line */}
              <Line type="monotone" dataKey="predicted" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: '#818cf8' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-amber-500">Weekend Surge Detected</h3>
          </div>
          <p className="text-sm text-amber-200/80 leading-relaxed">
            The model predicts a <span className="font-bold text-amber-300">18% increase</span> in admissions this coming Saturday compared to the historical baseline. We recommend pre-allocating an additional 12 step-down beds by Friday evening.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Model Last Trained</h3>
          <div className="text-xl font-mono text-white mb-4">Today, 04:00 AM</div>
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors px-6 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
            <Database className="w-4 h-4" /> Trigger Re-training
          </button>
        </div>
      </div>
    </div>
  );
}
