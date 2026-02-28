import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  BrainCircuit,
  Check,
  AlertTriangle,
  ArrowRight,
  Clock,
  Activity,
  UserCheck,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TriageView() {
  const [queue, setQueue] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [allocations, setAllocations] = useState<any>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    name: '',
    age: '',
    condition: '',
    triage_level: 'Yellow',
    acuity_score: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('smartbed_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [qRes, bRes] = await Promise.all([
        fetch('http://localhost:8000/api/patients/queue', { headers }),
        fetch('http://localhost:8000/api/beds', { headers })
      ]);
      if (qRes.ok) setQueue(await qRes.json());
      if (bRes.ok) setBeds(await bRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runOptimization = async () => {
    try {
      setOptimizing(true);
      const token = localStorage.getItem('smartbed_token');
      const res = await fetch('http://localhost:8000/api/allocation/optimize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAllocations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizing(false);
    }
  };

  const acceptAllocation = async (patientId: string, bedId: string) => {
    try {
      const token = localStorage.getItem('smartbed_token');
      const res = await fetch(`http://localhost:8000/api/patients/${patientId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bed_id: bedId, priority_override: false })
      });
      if (res.ok) {
        // Refresh data
        await fetchData();
        // Remove from allocations
        if (allocations) {
          const newAlloc = { ...allocations.assignments };
          delete newAlloc[patientId];
          setAllocations({ ...allocations, assignments: newAlloc });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const acceptAllAssignments = async () => {
    if (!allocations || !allocations.assignments) return;
    
    const assignments = Object.entries(allocations.assignments) as [string, string][];
    let successCount = 0;
    
    for (const [patientId, bedId] of assignments) {
      try {
        const token = localStorage.getItem('smartbed_token');
        const res = await fetch(`http://localhost:8000/api/patients/${patientId}/assign`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ bed_id: bedId, priority_override: false })
        });
        if (res.ok) {
          successCount++;
        }
      } catch (e) {
        console.error(`Failed to assign patient ${patientId} to bed ${bedId}`, e);
      }
    }
    
    // Refresh data after all assignments
    await fetchData();
    
    // Clear allocations panel
    if (successCount === assignments.length) {
      setAllocations(null);
    }
  };

  const submitQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quickAddForm.name || !quickAddForm.age || !quickAddForm.condition || !quickAddForm.acuity_score) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('smartbed_token');
      const res = await fetch('http://localhost:8000/api/patients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: quickAddForm.name,
          age: parseInt(quickAddForm.age),
          condition: quickAddForm.condition,
          triage_level: quickAddForm.triage_level,
          acuity_score: parseInt(quickAddForm.acuity_score)
        })
      });

      if (res.ok) {
        // Reset form and close modal
        setShowQuickAdd(false);
        setQuickAddForm({
          name: '',
          age: '',
          condition: '',
          triage_level: 'Yellow',
          acuity_score: ''
        });
        
        // Refresh queue
        await fetchData();
      } else {
        alert('Failed to add patient');
      }
    } catch (e) {
      console.error('Error adding patient:', e);
      alert('Error adding patient');
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading Triage Data...</div>;
  }

  const availableBeds = beds.filter(b => b.status === 'Available');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Triage Queue */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              ED Triage Queue
            </h2>
            <p className="text-sm text-slate-400 mt-1">Patients awaiting bed assignment</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 font-mono text-base">
              {queue.length} Waiting
            </Badge>
            <button
              onClick={() => setShowQuickAdd(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Quick Add
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {queue.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-200">Queue Empty</h3>
              <p className="text-slate-400 mt-1">All patients have been allocated beds.</p>
            </div>
          ) : queue.map((patient) => {
            const isRed = patient.triage_level === 'Red';
            const isYellow = patient.triage_level === 'Yellow';
            // Recommended bed from ML if exists
            const recBedId = allocations?.assignments?.[patient.id];

            return (
              <div key={patient.id} className="glass-card p-5 rounded-2xl flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isRed ? 'bg-red-500' : isYellow ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                {/* Patient Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-200">{patient.name}</h3>
                      <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{patient.id}</span>
                    </div>
                    <Badge variant={isRed ? 'destructive' : 'outline'} className={isRed ? 'bg-red-500/10 text-red-500 border-red-500/20' : isYellow ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}>
                      {patient.triage_level} Triage
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Activity className="w-4 h-4 text-slate-300" />
                      Acuity Score: <span className="font-mono text-white">{patient.acuity_score}/100</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Clock className="w-4 h-4 text-slate-300" />
                      Waiting: <span className="text-white">15m</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <AlertTriangle className="w-4 h-4 text-slate-300" />
                      Diagnosis: {patient.diagnosis}
                    </div>
                  </div>
                </div>

                {/* AI Recommendation Panel */}
                <div className="md:w-64 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 flex flex-col justify-center">
                  {recBedId ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider flex items-center gap-1">
                          <BrainCircuit className="w-3 h-3" /> AI Match
                        </span>
                        <span className="text-xs text-emerald-400 font-mono">98% Match</span>
                      </div>
                      <div className="text-lg font-bold text-white mb-3">{recBedId}</div>
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => acceptAllocation(patient.id, recBedId)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 rounded-lg font-medium transition-colors"
                        >
                          Accept
                        </button>
                        <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 text-xs py-2 rounded-lg font-medium transition-colors">
                          Change
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-slate-400 mb-3 block">Pending Allocation</p>
                      <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 text-xs py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1">
                        Manual Assign <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Allocation Engine Panel */}
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 glow-brand">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">MILP Allocator</h3>
              <p className="text-sm text-slate-400">Mixed-Integer Linear Programming</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10 text-sm mb-8">
            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-slate-400">Available Beds</span>
              <span className="text-white font-mono font-medium">{availableBeds.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-slate-400">Patients in Queue</span>
              <span className="text-white font-mono font-medium">{queue.length}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400">Objective</span>
              <span className="text-emerald-400 font-medium text-xs border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded">Max Survival Prob</span>
            </div>
          </div>

          <button
            onClick={runOptimization}
            disabled={optimizing || queue.length === 0}
            className={`w-full relative z-10 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all 
              ${optimizing ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]'}
            `}
          >
            {optimizing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Solving MILP...</>
            ) : (
              <><BrainCircuit className="w-5 h-5" /> Run Global Optimization</>
            )}
          </button>
        </div>

        {allocations && (
          <div className="glass-card rounded-2xl p-6 border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
            <h3 className="text-lg font-bold text-emerald-400 tracking-tight flex items-center gap-2 mb-4 relative z-10">
              <Check className="w-5 h-5" /> Optimization Complete
            </h3>
            <div className="space-y-3 text-sm relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Matches Found</span>
                <span className="text-white font-mono">{Object.keys(allocations.assignments).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Objective Value</span>
                <span className="text-emerald-300 font-mono">{allocations.objective_value.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Est. Wait Reduction</span>
                <span className="text-emerald-300 font-mono">{allocations.metrics.wait_time_reduction_mins}m</span>
              </div>
            </div>
            <button onClick={acceptAllAssignments} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 border border-emerald-700 text-white py-2 rounded-xl text-sm font-medium transition-colors relative z-10">
              Accept All Assignments
            </button>
          </div>
        )}
      </div>

      {/* Quick Add Patient Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" /> Add Patient to Queue
            </h3>
            
            <form onSubmit={submitQuickAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={quickAddForm.name}
                  onChange={(e) => setQuickAddForm({ ...quickAddForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={quickAddForm.age}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, age: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    placeholder="45"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Acuity (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quickAddForm.acuity_score}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, acuity_score: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    placeholder="7"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Condition</label>
                <input
                  type="text"
                  value={quickAddForm.condition}
                  onChange={(e) => setQuickAddForm({ ...quickAddForm, condition: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Chest pain, Head injury"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Triage Level</label>
                <select
                  value={quickAddForm.triage_level}
                  onChange={(e) => setQuickAddForm({ ...quickAddForm, triage_level: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Red">Red (Critical)</option>
                  <option value="Yellow">Yellow (Urgent)</option>
                  <option value="Green">Green (Standard)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                >
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
