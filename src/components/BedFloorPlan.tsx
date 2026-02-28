import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Activity } from 'lucide-react';

interface Bed {
    id: string;
    ward_id: string;
    bed_type: string;
    status: string;
    patient?: {
        id: string;
        name: string;
        age: number;
        condition: string;
        triage_level: string;
        acuity_score: number;
        status: string;
        wait_time: number;
    };
}

interface Ward {
    id: string;
    name: string;
    capacity: number;
    current_occupancy: number;
}

export default function BedFloorPlan({ ward }: { ward: Ward }) {
    const [beds, setBeds] = useState<Bed[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBeds = async () => {
            try {
                const token = localStorage.getItem('smartbed_token');
                const res = await fetch(`http://localhost:8000/api/beds`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const allBeds: Bed[] = await res.json();
                // Filter beds for this ward
                setBeds(allBeds.filter(b => b.ward_id === ward.id));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBeds();
    }, [ward.id]);

    if (loading) {
        return <div className="animate-pulse flex space-x-4 p-8 justify-center">Loading bed map...</div>;
    }

    return (
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{ward.name} Ward</h3>
                    <p className="text-slate-400 text-sm mt-1">Live Floor Plan & Occupancy Map</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-xs text-slate-300">Available</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-xs text-slate-300">Occupied</span></div>
                </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {beds.map((bed) => {
                    const isOccupied = bed.status === "Occupied";
                    return (
                        <div
                            key={bed.id}
                            className={`relative aspect-square rounded-lg flex flex-col items-center justify-center p-2 border transition-all hover:scale-105 cursor-pointer group
                ${isOccupied
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:border-red-400'
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-400'}
              `}
                        >
                            <span className="text-[10px] font-mono absolute top-1 right-1 opacity-50">{bed.id.split('-')[1]}</span>
                            {isOccupied ? <User className="w-6 h-6 mb-1" /> : <BedDouble className="w-6 h-6 mb-1 opacity-50" />}

                            {/* Tooltip */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 z-50 pointer-events-none">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-white font-bold text-sm tracking-tight">{bed.id}</span>
                                    <Badge className={isOccupied ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}>
                                        {bed.status}
                                    </Badge>
                                </div>
                                                {isOccupied ? (
                                    // Show patient info if assigned to this bed
                                    (() => {
                                        const patient = bed.patient;
                                        if (patient && patient.name) {
                                            const triage = patient.triage_level;
                                            const dotColor = triage === 'Red' ? 'bg-red-500' : triage === 'Yellow' ? 'bg-amber-500' : triage === 'Green' ? 'bg-emerald-500' : 'bg-red-400';
                                            return (
                                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700">
                                                    <span className={`w-3 h-3 rounded-full ${dotColor} shrink-0`} />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-300 font-medium">{patient.name}</span>
                                                        <span className="text-[10px] text-slate-400">{triage} triage • {patient.acuity_score}</span>
                                                        <span className="text-[10px] text-slate-500">{patient.condition}</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return <p className="text-xs text-slate-400 mt-1">Occupied — no patient assigned</p>;
                                    })()
                                ) : (
                                    <p className="text-xs text-slate-400 mt-1">Ready for admission</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Just importing BedDouble here to avoid breaking the file
import { BedDouble } from 'lucide-react';
