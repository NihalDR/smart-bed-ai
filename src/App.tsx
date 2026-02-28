import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Activity,
  BedDouble,
  Settings,
  AlertTriangle,
  BrainCircuit,
  Users,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardView from '@/components/views/DashboardView';
import PredictionsView from '@/components/views/PredictionsView';
import TriageView from '@/components/views/TriageView';
import SimulatorView from '@/components/views/SimulatorView';
import SettingsView from '@/components/views/SettingsView';
import LoginPage from '@/components/LoginPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  useEffect(() => {
    // Check local storage on mount
    const token = localStorage.getItem('smartbed_token');
    const savedUser = localStorage.getItem('smartbed_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token: string, userData: any) => {
    localStorage.setItem('smartbed_token', token);
    localStorage.setItem('smartbed_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    // Role-based default view
    if (userData.role === 'nurse') setActiveTab('triage');
    else setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('smartbed_token');
    localStorage.removeItem('smartbed_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'nurse'] },
    { id: 'triage', label: 'Triage & Allocation', icon: Users, roles: ['admin', 'manager', 'nurse'] },
    { id: 'predictions', label: 'AI Predictions', icon: Activity, roles: ['admin', 'manager'] },
    { id: 'simulator', label: 'What-If Simulator', icon: BrainCircuit, roles: ['admin', 'manager'] },
    { id: 'settings', label: 'API Settings', icon: Settings, roles: ['admin'] },
  ].filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen w-full bg-[var(--color-base)] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col z-10 shadow-xl">
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-indigo-400 glow-brand rounded-full">
            <BedDouble className="h-6 w-6" />
            <span className="font-bold text-lg tracking-tight text-white">SmartBed AI</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_1px_0_0_rgba(79,70,229,0.2)]"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-indigo-400" : "text-slate-500")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between px-2 py-2 mb-2 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-sm border border-indigo-500/30">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-slate-200 leading-tight">{user?.name}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors p-1">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 glass-card border-b-0 border-l-0 rounded-none flex items-center px-8 justify-between shrink-0 z-10 sticky top-0">
          <h1 className="text-xl font-semibold text-white">
            {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-6">
            <div className="text-slate-400 font-mono text-sm bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
              {currentTime}
            </div>
            {activeTab !== 'settings' && activeTab !== 'triage' && (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", wsConnected ? "bg-emerald-400" : "bg-amber-400")}></span>
                  <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", wsConnected ? "bg-emerald-500" : "bg-amber-500")}></span>
                </span>
                {wsConnected ? 'Live Connection' : 'Connecting...'}
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'dashboard' && <DashboardView onConnectionChange={setWsConnected} />}
            {activeTab === 'predictions' && <PredictionsView />}
            {activeTab === 'triage' && <TriageView />}
            {activeTab === 'simulator' && <SimulatorView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </div>
      </main>
    </div>
  );
}

