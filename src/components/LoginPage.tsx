import React, { useState } from 'react';
import { BedDouble, ShieldAlert, Users, Settings, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginPageProps {
  onLogin: (token: string, user: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      onLogin(data.access_token, { role: data.role, name: data.name, email });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const useDemoCredentials = (r: 'admin' | 'nurse' | 'manager') => {
    setEmail(`${r}@smartbed.ai`);
    setPassword(`${r}123`);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-base)] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />

      <div className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 glow-brand">
            <BedDouble className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SmartBed AI</h1>
          <p className="text-slate-400 text-sm mt-1">Intelligent Resource Optimization</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
              placeholder="admin@smartbed.ai"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
            </div>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center glow-critical">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-6">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Sign In <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider text-center">Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => useDemoCredentials('admin')} className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-indigo-500/50 transition-colors group">
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 mb-1" />
              <span className="text-[10px] text-slate-300">Admin</span>
            </button>
            <button onClick={() => useDemoCredentials('nurse')} className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-emerald-500/50 transition-colors group">
              <Users className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 mb-1" />
              <span className="text-[10px] text-slate-300">Nurse</span>
            </button>
            <button onClick={() => useDemoCredentials('manager')} className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-amber-500/50 transition-colors group">
              <ShieldAlert className="w-4 h-4 text-slate-400 group-hover:text-amber-400 mb-1" />
              <span className="text-[10px] text-slate-300">Manager</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
