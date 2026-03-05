"use client";

import React, { useEffect, useState } from "react";
import {
    Download,
    FileText,
    Calendar,
    Filter,
    Table,
    Share2,
    Database,
    ChevronDown,
    Activity
} from "lucide-react";

import { Loader2 } from "lucide-react";
import api from "@/services/api";

export default function ExportPage() {
    const [range, setRange] = useState("30");
    const [selectedDept, setSelectedDept] = useState("all");
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState<string | null>(null);

    const toggleFilter = (f: string) => {
        setActiveFilters(prev =>
            prev.includes(f) ? prev.filter(a => a !== f) : [...prev, f]
        );
    };

    const handleGenerateCSV = async () => {
        setGenerating('csv');
        try {
            const res = await api.get('/complaints');
            const complaints = res.data;

            // Simple filtering logic
            const filtered = complaints.filter((c: any) => {
                if (activeFilters.includes("Only Resolved") && c.status !== 'resolved') return false;
                if (activeFilters.includes("Anonymized Only") && !c.is_anonymous) return false;
                return true;
            });

            const headers = ["ID", "Title", "Category", "Status", "Priority", "Department", "Date"];
            const rows = filtered.map((c: any) => [
                c.id,
                `"${c.title.replace(/"/g, '""')}"`,
                c.category?.name || "N/A",
                c.status,
                Math.round(c.priority_score || 0),
                c.department?.name || "General",
                new Date(c.createdAt).toLocaleDateString()
            ]);

            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `jansoochna_audit_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Export Error:", err);
            alert("Failed to generate report");
        } finally {
            setGenerating(null);
        }
    };

    const handleGeneratePDF = () => {
        setGenerating('pdf');
        // Simple print-based "generation" simulation
        setTimeout(() => {
            window.print();
            setGenerating(null);
        }, 1500);
    };
    const handleShare = async (doc: any) => {
        const shareData = {
            title: 'JanSoochna Governance Report',
            text: `Sharing official municipal report: ${doc.name}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`Report: ${doc.name} - ${window.location.href}`);
                alert('Report link copied to clipboard for official distribution.');
            }
        } catch (err) {
            console.error("Share Error:", err);
        }
    };

    return (
        <div className="p-12 animate-in fade-in duration-500">
            <header className="mb-12">
                <h1 className="text-4xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white">Data Hub & Export</h1>
                <p className="text-slate-500 font-medium">Generate comprehensive civic reports and infrastructure datasets</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* Filter Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-slate-200 dark:hover:border-slate-700">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/20 rounded-2xl flex items-center justify-center">
                                <Filter className="w-6 h-6 text-primary-500" />
                            </div>
                            <h2 className="text-2xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white">Report Configuration</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block ml-2">Temporal Range</label>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between border-2 border-transparent hover:border-primary-100 dark:hover:border-primary-900 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                        <select
                                            value={range}
                                            onChange={(e) => setRange(e.target.value)}
                                            className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
                                        >
                                            <option value="7">Last 7 Days</option>
                                            <option value="30">Last 30 Days</option>
                                            <option value="90">Last 90 Days</option>
                                        </select>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block ml-2">Data Source</label>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between border-2 border-transparent hover:border-primary-100 dark:hover:border-primary-900 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Database className="w-5 h-5 text-slate-400" />
                                        <select
                                            value={selectedDept}
                                            onChange={(e) => setSelectedDept(e.target.value)}
                                            className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
                                        >
                                            <option value="all">All Departments</option>
                                            <option value="roads">Roads & Infra</option>
                                            <option value="sanitation">Sanitation</option>
                                            <option value="health">Health</option>
                                        </select>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block ml-2">Advanced Filters</label>
                                <div className="flex flex-wrap gap-3">
                                    {["Only Resolved", "Include Sentiment", "Hardware Logs", "Anonymized Only"].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => toggleFilter(f)}
                                            className={`px-5 py-2.5 border rounded-xl text-xs font-bold transition-all ${activeFilters.includes(f)
                                                ? 'bg-primary-600 text-white border-primary-600 shadow-lg'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex gap-4">
                            <button
                                onClick={handleGenerateCSV}
                                disabled={generating !== null}
                                className={`flex-1 px-8 py-5 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl ${generating === 'csv' ? 'bg-slate-700' : 'bg-slate-950 shadow-slate-200'
                                    }`}
                            >
                                {generating === 'csv' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                {generating === 'csv' ? 'Processing...' : 'Generate CSV Dataset'}
                            </button>
                            <button
                                onClick={handleGeneratePDF}
                                disabled={generating !== null}
                                className={`flex-1 px-8 py-5 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl ${generating === 'pdf' ? 'bg-primary-700' : 'bg-primary-600 shadow-primary-100'
                                    }`}
                            >
                                {generating === 'pdf' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                                {generating === 'pdf' ? 'Formatting...' : 'Generate PDF Briefing'}
                            </button>
                        </div>
                    </div>

                    {/* Recent History */}
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] p-12 border border-transparent">
                        <h3 className="text-xl font-black font-outfit tracking-tighter mb-8 text-slate-900 dark:text-white">Recent Downloads</h3>
                        <div className="space-y-4">
                            {[
                                { name: "February_SLA_Audit.pdf", size: "2.4 MB", type: "PDF" },
                                { name: "City_Sentiment_Raw.csv", size: "842 KB", type: "CSV" },
                                { name: "Road_Infrastructure_Report.pdf", size: "4.1 MB", type: "PDF" },
                            ].map((doc, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                                            <FileText className={`w-6 h-6 ${doc.type === 'PDF' ? 'text-rose-500' : 'text-emerald-500'}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white leading-none mb-1">{doc.name}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.size} • 5h ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleShare(doc)}
                                            className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <Share2 className="w-4 h-4 text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => window.alert('Re-downloading archived report...')}
                                            className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-950 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all shadow-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="bg-primary-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                        <Activity className="w-10 h-10 text-primary-500 mb-8" />
                        <h4 className="text-3xl font-black font-outfit tracking-tighter mb-4 leading-none">Automated <br /> Governance</h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                            Your weekly summary report is scheduled for <span className="text-white font-bold">Monday at 08:00 AM</span>. It will be sent to the District Magistrate's secure portal.
                        </p>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Active Schedule</span>
                            </div>
                            <p className="text-xs text-slate-300 font-mono">CRON: 0 8 * * 1 /scripts/gov-report.sh</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-xl text-slate-900 dark:text-white mb-6">Data Availability</h4>
                        <div className="space-y-6">
                            {[
                                { label: "Civic Records", status: "100%", color: "bg-emerald-500" },
                                { label: "AI Metadata", status: "94%", color: "bg-primary-500" },
                                { label: "Auth Logs", status: "LIVE", color: "bg-indigo-500" },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                                        <span>{s.label}</span>
                                        <span className="text-slate-900 dark:text-white">{s.status}</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${s.color}`} style={{ width: s.status === 'LIVE' ? '100%' : s.status }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
