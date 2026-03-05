"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Search, Filter, Layers, X, Check } from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-[3rem] flex items-center justify-center font-black text-slate-400 italic">Initializing Spatial Core...</div>
});

export default function MapPage() {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const filterOptions = [
        { id: 'all', label: 'All Issues' },
        { id: 'urgent', label: 'Urgent Only' },
        { id: 'overdue', label: 'Overdue' },
        { id: 'resolved', label: 'Resolved' }
    ];

    return (
        <div className="p-12 h-screen flex flex-col relative">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white">Spatial Intelligence</h1>
                    <p className="text-slate-500 font-medium">Real-time geospatial tracking of civic complaints</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            placeholder="Search by ID or Title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 ring-primary-500 outline-none w-64 transition-all text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all border ${showFilters ? 'bg-slate-900 dark:bg-primary-600 text-white border-slate-900 dark:border-primary-600 shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            {filterOptions.find(o => o.id === filter)?.label || 'Filter'}
                        </button>

                        {showFilters && (
                            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-[2000] animate-in fade-in zoom-in duration-200 origin-top-right">
                                <div className="flex justify-between items-center px-4 py-2 mb-2 border-b border-slate-50 dark:border-slate-800">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter View</span>
                                    <button onClick={() => setShowFilters(false)}><X className="w-3 h-3 text-slate-300" /></button>
                                </div>
                                <div className="space-y-1">
                                    {filterOptions.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setFilter(opt.id);
                                                setShowFilters(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${filter === opt.id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            {opt.label}
                                            {filter === opt.id && <Check className="w-3 h-3" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex-1 relative">
                <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
                    <button className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Layers className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
                <MapComponent filter={filter} searchQuery={searchQuery} />
            </div>
        </div>
    );
}
