import React, { useState, useEffect } from 'react';
import {
  Users,
  BedDouble,
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Badge } from '@/components/ui/badge';
import BedFloorPlan from '../BedFloorPlan';

interface DashboardProps {
  onConnectionChange?: (connected: boolean) => void;
}

export default function DashboardView({ onConnectionChange }: DashboardProps) {
  const [kpis, setKpis] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('smartbed_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [kpiRes, alertRes, wardRes] = await Promise.all([
          fetch('http://localhost:8000/api/dashboard/kpis', { headers }),
          fetch('http://localhost:8000/api/dashboard/alerts', { headers }),
          fetch('http://localhost:8000/api/wards', { headers })
        ]);

        if (kpiRes.ok) setKpis(await kpiRes.json());
        if (alertRes.ok) setAlerts(await alertRes.json());
        if (wardRes.ok) setWards(await wardRes.json());
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // WebSocket for real-time KPIs
  useEffect(() => {
    const token = localStorage.getItem('smartbed_token');
    const ws = new WebSocket(`ws://localhost:8000/api/ws/dashboard?token=${token}`);

    ws.onopen = () => {
      onConnectionChange?.(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'UPDATE_KPI') {
          setKpis(data.payload);
        }
      } catch (e) {
        console.error("WebSocket message error", e);
      }
    };

    ws.onclose = () => {
      onConnectionChange?.(false);
    };

    return () => {
      ws.close();
      onConnectionChange?.(false);
    };
  }, [onConnectionChange]);


  if (loading || !kpis) {
    return <div className="flex justify-center items-center h-64 text-slate-400">Loading Dashboard Data...</div>;
  }

  // Mock chart data - representing today's hourly occupancy
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}:00`,
    occupancy: Math.floor(80 + Math.random() * 15)
  }));

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Occupancy"
          value={`${kpis.occupancy_rate}%`}
          subtext={`${kpis.available_beds} beds available`}
          trend="+2.5% vs yesterday"
          icon={BedDouble}
          color="indigo"
          alert={kpis.occupancy_rate > 90}
        />
        <KPICard
          title="Patients in ED Queue"
          value={kpis.ed_queue_length}
          subtext="Waiting for allocation"
          trend="+4 patients/hr"
          icon={Users}
          color="amber"
          alert={kpis.ed_queue_length > 5}
        />
        <KPICard
          title="Avg Wait Time"
          value={`${kpis.avg_wait_time_mins}m`}
          subtext="Target: <30m"
          trend="-5m vs yesterday"
          icon={Clock}
          color="emerald"
        />
        <KPICard
          title="Critical Patients"
          value={kpis.critical_patients}
          subtext="Acuity Score > 80"
          trend="Stable"
          icon={Activity}
          color="red"
          alert={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Occupancy Trend</h3>
              <p className="text-sm text-slate-400">Live hospital-wide bed utilization</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Today</Badge>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="occupancy" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorOcc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white tracking-tight">Active Alerts</h3>
            <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">{alerts.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {alerts.length === 0 ? (
              <p className="text-slate-400 text-sm italic">No active alerts.</p>
            ) : alerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-xl relative overflow-hidden border border-red-500/20 bg-red-500/5 group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-amber-500" />
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-200 text-sm">{alert.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-3 block">{alert.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-indigo-400 font-medium hover:text-indigo-300 transition-colors flex items-center justify-center gap-1 border-t border-slate-700/50 pt-4">
            View All Alerts <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ward Floor Plans */}
      <h2 className="text-xl font-bold text-white mt-8 mb-4">Ward Floor Plans</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {wards.map(ward => (
          <BedFloorPlan key={ward.id} ward={ward} />
        ))}
      </div>
    </div>
  );
}

function KPICard({ title, value, subtext, trend, icon: Icon, color, alert }: any) {
  const isAlert = alert === true;

  return (
    <div className={`glass-card p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${isAlert ? 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(79,70,229,0.15)]'}`}>
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon className={`w-16 h-16 text-${color}-500`} />
      </div>
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <h3 className="font-medium text-slate-400">{title}</h3>
      </div>
      <div className="relative z-10">
        <span className={`text-4xl font-bold tracking-tight ${isAlert ? 'text-red-400' : 'text-white'}`}>{value}</span>
        <p className="text-sm text-slate-400 mt-2 font-medium">{subtext}</p>
      </div>
      <div className={`mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-xs relative z-10 ${trend.startsWith('+') && !isAlert ? 'text-emerald-400' : 'text-slate-400'}`}>
        <TrendingUp className="w-3 h-3" />
        {trend}
      </div>
    </div>
  );
}
