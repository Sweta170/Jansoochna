"use client";

import React, { useEffect, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    Users,
    PieChart,
    Bell,
    ArrowUpRight,
    Clock,
    MapPin,
    Lock as LockIcon
} from "lucide-react";
import api from "@/services/api";
import { connectSocket } from "@/services/socket";

export default function DashboardContent() {
    const [metrics, setMetrics] = useState<any>({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        avgResolutionHours: 0
    });
    const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [metricsRes, complaintsRes] = await Promise.all([
                    api.get('/admin/metrics'),
                    api.get('/complaints?limit=5')
                ]);
                setMetrics(metricsRes.data);
                setRecentComplaints(complaintsRes.data);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();

        // Setup Socket for real-time updates
        // In a real app, you'd get the token from auth state
        const token = typeof window !== 'undefined' ? localStorage.getItem('jan_admin_token') : null;
        if (token) {
            const socket = connectSocket(token);

            socket.on('complaint:created', (newComplaint: any) => {
                setRecentComplaints((prev: any[]) => [newComplaint, ...prev.slice(0, 4)]);
                setMetrics((prev: any) => ({ ...prev, total: prev.total + 1, open: prev.open + 1 }));
            });

            socket.on('complaint:updated', (updated: any) => {
                setRecentComplaints((prev: any[]) => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
                // Note: Real metrics would require a re-fetch or complex state logic
            });

            return () => {
                socket.off('complaint:created');
                socket.off('complaint:updated');
            };
        }
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-12 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex justify-between items-start mb-16">
                <div>
                    <h1 className="text-5xl font-black font-outfit text-slate-900 dark:text-white tracking-tightest">
                        Command Center
                    </h1>
                    <p className="text-slate-500 mt-3 text-xl font-medium">
                        Active session: <span className="text-slate-900 dark:text-white border-b-2 border-primary-500">Regional Authority (Sector 7)</span>
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3 items-center">
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="admin" />
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Officer" alt="officer" />
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                            +12
                        </div>
                    </div>

                    <div className="h-10 w-[1px] bg-slate-200 mx-2" />

                    <button
                        onClick={() => {
                            localStorage.removeItem('jan_admin_token');
                            window.location.href = '/login';
                        }}
                        className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-100 dark:hover:border-rose-900 hover:text-rose-600 transition-all font-outfit"
                    >
                        <LockIcon className="w-4 h-4" /> Secure Sign Out
                    </button>
                </div>
            </header>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {[
                    { label: "Urgent Alerts", value: metrics.open, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50", trend: "+12% vs last week" },
                    { label: "Successfully Closed", value: metrics.resolved, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", trend: "78% efficiency rate" },
                    { label: "Community Active", value: metrics.total, icon: Users, color: "text-primary-500", bg: "bg-primary-50", trend: "4 new today" },
                    { label: "Resolution Time", value: `${metrics.avgResolutionHours?.toFixed(1) || '0'}h`, icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50", trend: "-1.2h improvement" },
                ].map((stat, i) => (
                    <div key={i} className="relative p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-primary-100 dark:hover:shadow-primary-950/20 transition-all duration-500">
                        <div className={`w-14 h-14 ${stat.bg} dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6`}>
                            <stat.icon className={`w-7 h-7 ${stat.color}`} />
                        </div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                        <p className="text-slate-400 text-[10px] mt-4 font-bold flex items-center gap-1 italic">
                            <ArrowUpRight className="w-3 h-3 text-emerald-500" /> {stat.trend}
                        </p>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white">Immediate Response Required</h2>
                            <button className="text-sm font-bold text-primary-600 hover:underline">View All Tickets</button>
                        </div>

                        <div className="space-y-6">
                            {recentComplaints.length > 0 ? recentComplaints.map((complaint, i) => (
                                <div key={complaint.id} className="group flex items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-transparent hover:border-primary-100 dark:hover:border-primary-900 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-600 flex items-center justify-center mr-6 group-hover:rotate-6 transition-transform shadow-sm relative">
                                        <MapPin className="w-6 h-6 text-slate-400" />
                                        {complaint.is_anonymous && (
                                            <div className="absolute -top-2 -right-2 bg-slate-900 rounded-full p-1 shadow-md border-2 border-white">
                                                <Users className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full font-black text-slate-600 lowercase tracking-widest">#{complaint.id}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${complaint.status === 'open' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                {complaint.status}
                                            </span>
                                            {complaint.sla_deadline && new Date(complaint.sla_deadline) < new Date() && complaint.status !== 'resolved' && (
                                                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">
                                                    OVERDUE
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-black text-lg text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                                            {complaint.title}
                                            {complaint.is_anonymous && <span className="text-[10px] font-medium text-slate-400 italic">(Anonymous)</span>}
                                        </h4>
                                        <p className="text-sm text-slate-400 font-medium truncate max-w-md">{complaint.description}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight">AI Urgency: {Math.round(complaint.priority_score || 0)}%</span>
                                            {complaint.ai_summary?.sentiment_score !== undefined && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${complaint.ai_summary.sentiment_score < 0 ? 'bg-rose-400' : 'bg-emerald-400'}`}
                                                            style={{ width: `${Math.min(100, Math.abs(complaint.ai_summary.sentiment_score) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                        {complaint.ai_summary.sentiment_score < 0 ? 'Urgent' : 'Normal'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <button className="px-6 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-xs font-black hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 hover:border-slate-900 dark:hover:border-white transition-all">
                                            Assign Now
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 text-slate-400 font-bold italic">
                                    Great Job! No immediate alerts at the moment.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="bg-slate-950 dark:bg-black rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-400 dark:shadow-none border border-white/5">
                        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mb-8">
                            <PieChart className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-4xl font-black font-outfit leading-[0.9] tracking-tighter mb-4">Sentiment <br /> Analytics</h2>
                        <p className="text-slate-400 font-medium mb-10 text-sm leading-relaxed">
                            AI analysis of citizen comments reveals a <span className="text-emerald-400 font-bold">12% increase</span> in community satisfaction this month.
                        </p>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-emerald-500 w-[68%]" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Satisfaction Score: 68/100</p>
                    </div>

                    <div className="bg-primary-50 dark:bg-primary-950/20 rounded-[3rem] border border-primary-100 dark:border-primary-900/30 p-10">
                        <h3 className="text-xl font-black text-primary-900 dark:text-primary-100 mb-2 underline decoration-primary-200 dark:decoration-primary-800 underline-offset-4">Governance Tip</h3>
                        <p className="text-primary-700 dark:text-primary-300 text-sm font-medium leading-relaxed">
                            Public holidays next week typically see a spike in waste-related reports. Brief the sanitation department now to reduce escalation risk.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
