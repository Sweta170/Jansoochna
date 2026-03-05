"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Users, Info, MapPin, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { getSocket } from '@/services/socket';

// Custom icons for different priorities
const createIcon = (color: string) => L.divIcon({
    html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

const icons = {
    high: createIcon('#f43f5e'), // rose-500
    medium: createIcon('#f59e0b'), // amber-500
    low: createIcon('#6366f1'),    // indigo-500
    resolved: createIcon('#10b981') // emerald-500
};

interface MapProps {
    filter?: string;
    searchQuery?: string;
}

export default function MapComponent({ filter = 'all', searchQuery = '' }: MapProps) {
    const [complaints, setComplaints] = useState<any[]>([]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        async function fetchComplaints() {
            try {
                const res = await api.get('/complaints');
                if (res.data && Array.isArray(res.data)) {
                    setComplaints(res.data.filter((c: any) => c.latitude && c.longitude));
                }
            } catch (err) {
                console.error("Map Fetch Error:", err);
            }
        }
        fetchComplaints();

        const socket = getSocket();
        if (socket) {
            socket.on('complaint:created', (newComplaint) => {
                if (newComplaint.latitude && newComplaint.longitude) {
                    setComplaints(prev => [...prev, newComplaint]);
                }
            });
            socket.on('complaint:updated', (updated) => {
                setComplaints(prev => prev.map((c: any) => c.id === updated.id ? { ...c, ...updated } : c));
            });
            return () => {
                socket.off('complaint:created');
                socket.off('complaint:updated');
            };
        }
    }, []);

    if (!mounted) return (
        <div className="w-full h-full bg-slate-900 rounded-[3rem] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
    );

    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = !searchQuery ||
            c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.id?.toString().includes(searchQuery);

        if (!matchesSearch) return false;

        if (filter === 'urgent') return c.priority_score > 70;
        if (filter === 'overdue') return new Date(c.sla_deadline) < new Date() && c.status !== 'resolved';
        if (filter === 'resolved') return c.status === 'resolved';

        return true;
    });

    return (
        <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            key="city-map" // Stable key but helps if we need remount
            className="w-full h-full rounded-[3rem] overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl"
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {filteredComplaints.map((c: any) => (
                <Marker
                    key={c.id}
                    position={[parseFloat(c.latitude), parseFloat(c.longitude)]}
                    icon={
                        c.status === 'resolved' ? icons.resolved :
                            (c.priority_score > 70 ? icons.high : (c.priority_score > 40 ? icons.medium : icons.low))
                    }
                >
                    <Popup className="premium-popup">
                        <div className="p-2 min-w-[200px]">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{c.id}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${c.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                    }`}>{c.status}</span>
                            </div>
                            <h4 className="font-black text-slate-900 mb-1 flex items-center gap-1 text-sm">
                                {c.title}
                                {c.is_anonymous && <Users className="w-3 h-3 text-slate-400" />}
                            </h4>
                            <p className="text-[11px] text-slate-500 mb-2 leading-tight">{c.description}</p>
                            {c.sla_deadline && (
                                <div className={`mb-3 p-2 rounded-lg text-[10px] font-bold uppercase tracking-tight ${new Date(c.sla_deadline) < new Date() && c.status !== 'resolved' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500'
                                    }`}>
                                    Deadline: {new Date(c.sla_deadline).toLocaleDateString()}
                                    {new Date(c.sla_deadline) < new Date() && c.status !== 'resolved' && " (OVERDUE)"}
                                </div>
                            )}
                            <button className="w-full py-2 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-primary-600 transition-colors">
                                Assign Official
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
