"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Filter,
    Download,
    ChevronRight,
    MoreVertical,
    Clock,
    AlertCircle,
    CheckCircle2,
    Users,
    ChevronDown,
    Loader2,
    X,
    CheckSquare,
    Square
} from "lucide-react";
import api from "@/services/api";

export default function ComplaintsPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchStatus, setBatchStatus] = useState("");
    const [submittingBatch, setSubmittingBatch] = useState(false);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const res = await api.get('/complaints');
            setComplaints(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const filtered = complaints.filter(c => {
        if (filter === "overdue") return new Date(c.sla_deadline) < new Date() && c.status !== 'resolved';
        if (filter === "urgent") return c.priority_score > 70;
        if (filter === "anonymous") return c.is_anonymous;
        return true;
    });

    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filtered.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map(c => c.id));
        }
    };

    const exportToCSV = () => {
        const headers = ["ID", "Title", "Category", "Reporter", "Priority", "Status", "SLA Deadline"];
        const rows = filtered.map(c => [
            c.id,
            `"${c.title.replace(/"/g, '""')}"`,
            c.category?.name || "Uncategorized",
            c.is_anonymous ? "Anonymous" : c.reporter?.name || "Unknown",
            Math.round(c.priority_score || 0),
            c.status,
            c.sla_deadline ? new Date(c.sla_deadline).toLocaleDateString() : "N/A"
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `city_complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBatchUpdate = async () => {
        if (!batchStatus || selectedIds.length === 0) return;
        setSubmittingBatch(true);
        try {
            await api.post('/admin/complaints/batch-update', {
                ids: selectedIds,
                updates: { status: batchStatus }
            });
            setIsBatchModalOpen(false);
            setSelectedIds([]);
            fetchComplaints();
        } catch (err) {
            console.error("Batch Update Error:", err);
            alert("Failed to update complaints");
        } finally {
            setSubmittingBatch(false);
        }
    };

    return (
        <div className="p-12 animate-in fade-in duration-700 relative">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white">Issue Ledger</h1>
                    <p className="text-slate-500 font-medium">Comprehensive audit trail of city-wide civic reports</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 text-slate-900 dark:text-white"
                    >
                        <Download className="w-4 h-4 text-primary-600" /> Export CSV
                    </button>
                    <button
                        onClick={() => selectedIds.length > 0 && setIsBatchModalOpen(true)}
                        disabled={selectedIds.length === 0}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95 ${selectedIds.length > 0 ? 'bg-slate-900 dark:bg-primary-600 text-white shadow-slate-200 dark:shadow-none hover:bg-slate-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                            }`}
                    >
                        Batch Action {selectedIds.length > 0 && `(${selectedIds.length})`}
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex gap-2">
                    {["all", "urgent", "overdue", "anonymous"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary-600 text-white shadow-xl shadow-primary-100 dark:shadow-none ring-2 ring-primary-100 dark:ring-primary-900' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:text-slate-500 dark:hover:text-slate-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="relative group">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        placeholder="Filter by ID, Title or Dept..."
                        className="pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 ring-primary-50 dark:ring-primary-950/20 outline-none w-80 transition-all border-transparent focus:border-primary-200 dark:focus:border-primary-800 text-slate-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden border-b-8 border-b-slate-50 dark:border-b-slate-950">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <th className="px-8 py-6 w-12">
                                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-primary-600 transition-colors">
                                    {selectedIds.length === filtered.length && filtered.length > 0 ? <CheckSquare className="w-5 h-5 text-primary-600" /> : <Square className="w-5 h-5" />}
                                </button>
                            </th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Complaint Details</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Urgency</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">SLA Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Official Status</th>
                            <th className="px-8 py-5"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={6} className="p-32 text-center animate-pulse">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="w-10 h-10 text-slate-200 animate-spin" />
                                    <span className="text-slate-400 font-black italic tracking-tighter">Syncing city records...</span>
                                </div>
                            </td></tr>
                        ) : filtered.length > 0 ? filtered.map(c => (
                            <tr
                                key={c.id}
                                className={`transition-all group ${selectedIds.includes(c.id) ? 'bg-primary-50/30 dark:bg-primary-900/20' : 'hover:bg-slate-50/40 dark:hover:bg-slate-800/50'}`}
                            >
                                <td className="px-8 py-6">
                                    <button onClick={() => toggleSelection(c.id)} className={`${selectedIds.includes(c.id) ? 'text-primary-600' : 'text-slate-300'} hover:text-primary-500 transition-colors`}>
                                        {selectedIds.includes(c.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    </button>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className={`w-12 h-12 ${selectedIds.includes(c.id) ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'} rounded-2xl flex items-center justify-center transition-colors`}>
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            {c.is_anonymous && (
                                                <div className="absolute -top-1.5 -right-1.5 bg-slate-900 dark:bg-black rounded-full p-1 border-2 border-white dark:border-slate-800 shadow-sm">
                                                    <Users className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400">#{c.id}</span>
                                                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                                                    {c.title}
                                                </h4>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{c.category?.name || 'Uncategorized sector'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full transition-all duration-1000 ${c.priority_score > 70 ? 'bg-gradient-to-r from-rose-400 to-rose-600' : (c.priority_score > 40 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-indigo-400 to-indigo-600')}`}
                                                style={{ width: `${Math.round(c.priority_score || 0)}%` }}
                                            />
                                        </div>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${c.priority_score > 70 ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' : (c.priority_score > 40 ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' : 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30')}`}>
                                            LEVEL {Math.round(c.priority_score || 0)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    {c.sla_deadline ? (
                                        <div className="inline-flex flex-col items-center">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${new Date(c.sla_deadline) < new Date() && c.status !== 'resolved' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {new Date(c.sla_deadline) < new Date() && c.status !== 'resolved' ? 'OVERDUE' : 'ON TRACK'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-black flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" /> {new Date(c.sla_deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}
                                            </span>
                                        </div>
                                    ) : '--'}
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${c.status === 'resolved' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' :
                                        (c.status === 'open' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30')
                                        }`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="p-3 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 active:scale-90">
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 transition-colors" />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="py-24 text-center">
                                <p className="text-slate-400 font-black italic tracking-tighter">No records matching the selected filter.</p>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Batch Action Modal */}
            {isBatchModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-slate-100 dark:border-slate-800">
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-2xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white">Batch Operation</h2>
                                    <p className="text-slate-500 text-sm font-medium italic">Executing action on {selectedIds.length} records</p>
                                </div>
                                <button
                                    onClick={() => setIsBatchModalOpen(false)}
                                    className="w-10 h-10 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full flex items-center justify-center transition-all"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Target Status</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['in_progress', 'resolved', 'closed'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setBatchStatus(s)}
                                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${batchStatus === s ? 'bg-slate-900 dark:bg-primary-600 text-white border-slate-900 dark:border-primary-600 shadow-xl' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent hover:border-slate-100 dark:hover:border-slate-700'
                                                    }`}
                                            >
                                                {s.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-[2rem] border border-amber-100 dark:border-amber-900/30">
                                    <div className="flex gap-4">
                                        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                                        <p className="text-xs text-amber-700 font-bold leading-relaxed">
                                            This will instantly update the status for all selected complaints. Citizens will receive notifications regarding these updates.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    disabled={!batchStatus || submittingBatch}
                                    onClick={handleBatchUpdate}
                                    className="w-full bg-slate-900 dark:bg-primary-600 hover:bg-slate-800 dark:hover:bg-primary-700 text-white py-5 rounded-[2rem] font-black text-sm transition-all shadow-2xl shadow-slate-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                                >
                                    {submittingBatch ? <Loader2 className="w-5 h-5 animate-spin" /> : `Execute for ${selectedIds.length} Items`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
