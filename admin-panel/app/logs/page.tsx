"use client";

import React, { useEffect, useState } from "react";
import {
    Terminal,
    Activity,
    Shield,
    Cpu,
    Info,
    AlertTriangle,
    Clock,
    Filter,
    X,
    Search,
    Trash2,
    RefreshCw
} from "lucide-react";

const INITIAL_LOGS = [
    { id: 1, type: "system", event: "AI Standalone Worker initialization successful", timestamp: "2 mins ago", severity: "info" },
    { id: 2, type: "security", event: "Unauthorized access attempt at /api/admin/config (IP: 192.168.0.12)", timestamp: "15 mins ago", severity: "warning" },
    { id: 3, type: "action", event: "Official Vikram Singh resolved Complaint #4290", timestamp: "45 mins ago", severity: "success" },
    { id: 4, type: "system", event: "SLA Escalation: Complaint #5501 moved to High Priority", timestamp: "1 hour ago", severity: "error" },
    { id: 5, type: "ai", event: "Sentiment Analysis batch completed (150 records processed)", timestamp: "2 hours ago", severity: "info" },
    { id: 6, type: "security", event: "DDoS mitigation active: Filtered 5,000 requests from AS24940", timestamp: "3 hours ago", severity: "warning" },
    { id: 7, type: "system", event: "Database migration: Schema updated to v2.4.1", timestamp: "5 hours ago", severity: "success" },
];

export default function LogsPage() {
    const [logs, setLogs] = useState(INITIAL_LOGS);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

    const clearView = () => {
        setLogs([]);
    };

    const resetView = () => {
        setLogs(INITIAL_LOGS);
        setFilter("all");
        setSearchTerm("");
    };

    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === "all" || log.type === filter || log.severity === filter;
        const matchesSearch = log.event.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="p-12 animate-in fade-in duration-700 relative">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white">System Audit Trail</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Real-time technical logs and operational history</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                            className={`flex items-center gap-2 px-6 py-3 border rounded-2xl text-sm font-bold shadow-sm transition-all active:scale-95 ${isFilterDropdownOpen ? 'bg-primary-600 text-white border-primary-600 shadow-primary-200 dark:shadow-none' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            {filter === 'all' ? 'Filter Logs' : `Type: ${filter}`}
                        </button>

                        {isFilterDropdownOpen && (
                            <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 p-4 animate-in slide-in-from-top-4 duration-300">
                                <div className="space-y-1">
                                    <p className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Filter by Type</p>
                                    {['all', 'system', 'security', 'action', 'ai'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => { setFilter(f); setIsFilterDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${filter === f ? 'bg-slate-900 dark:bg-primary-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                                    <p className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Filter by Severity</p>
                                    {['info', 'warning', 'error', 'success'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => { setFilter(s); setIsFilterDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${filter === s ? 'bg-slate-900 dark:bg-primary-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={clearView}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-primary-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-primary-700 transition-all active:scale-95"
                    >
                        <Trash2 className="w-4 h-4" /> Clear View
                    </button>

                    {logs.length === 0 && (
                        <button
                            onClick={resetView}
                            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4" /> Reload
                        </button>
                    )}
                </div>
            </header>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                {[
                    { label: "AI Status", value: "Operational", icon: Cpu, color: "text-emerald-500", bg: "bg-emerald-50/50 dark:bg-emerald-950/20" },
                    { label: "Security", value: "Shielded", icon: Shield, color: "text-primary-500", bg: "bg-primary-50/50 dark:bg-primary-950/20" },
                    { label: "Active Nodes", value: "3 Primary", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50/50 dark:bg-indigo-950/20" },
                    { label: "Latency", value: "12ms", icon: Clock, color: "text-emerald-500", bg: "bg-emerald-50/50 dark:bg-emerald-950/20" },
                ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                        <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">{s.label}</p>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{s.value}</h4>
                    </div>
                ))}
            </div>

            {/* Consola-style logs view */}
            <div className="bg-slate-950 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden border-8 border-slate-900/50 group">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-rose-500 rounded-full" />
                        <div className="w-3 h-3 bg-amber-500 rounded-full" />
                        <div className="w-3 h-3 bg-emerald-500 rounded-full mr-4" />
                        <Terminal className="w-5 h-5 text-emerald-500" />
                        <span className="text-emerald-500 font-mono text-sm font-bold tracking-tighter">root@jansoochna:~/audit-logs$ tail -f master.log</span>
                    </div>
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Grep events..."
                            className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono pl-9 pr-4 py-1.5 rounded-full outline-none focus:border-emerald-500/50 transition-all w-48"
                        />
                    </div>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                    {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                        <div key={log.id} className="group flex items-start gap-6 hover:bg-slate-900/40 p-5 rounded-3xl transition-all border border-transparent hover:border-slate-800/50">
                            <span className="text-[10px] bg-slate-900 text-slate-500 px-3 py-1.5 rounded-xl font-mono border border-slate-800 group-hover:border-slate-700 transition-colors shrink-0">{log.timestamp}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${log.severity === 'error' ? 'bg-rose-500/10 text-rose-500' :
                                        (log.severity === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                            (log.severity === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary-500/10 text-primary-500'))
                                        }`}>
                                        [{log.severity}]
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                                        // {log.type}
                                    </span>
                                </div>
                                <p className="text-slate-300 font-mono text-[13px] leading-relaxed group-hover:text-emerald-50 transition-colors tracking-tight">
                                    <span className="text-emerald-500 opacity-50 mr-2">&gt;</span>
                                    {log.event}
                                </p>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-800 rounded-xl">
                                <Info className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                    )) : (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                                <Terminal className="w-8 h-8 text-slate-700" />
                            </div>
                            <p className="text-slate-500 font-mono text-xs italic">
                                {logs.length === 0 ? "Log stream cleared by administrator." : "No entries matching the current grep filter."}
                            </p>
                        </div>
                    )}

                    {logs.length > 0 && (
                        <div className="animate-pulse flex items-center gap-3 text-emerald-500/40 px-5 py-4 border-t border-slate-900/50 mt-4">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase">Awaiting new events...</span>
                        </div>
                    )}
                </div>

                {/* Cyberpunk background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />
            </div>
        </div>
    );
}
