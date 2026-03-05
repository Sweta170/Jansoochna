"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
    ShieldCheck,
    UserPlus,
    Search,
    MoreHorizontal,
    Briefcase,
    Zap,
    MapPin,
    Star,
    X,
    Shield,
    Mail,
    Lock,
    Building,
    Loader2
} from "lucide-react";
import api from "@/services/api";

export default function AuthorityHubPage() {
    const [officials, setOfficials] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        department_id: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            const [officialsRes, deptsRes] = await Promise.all([
                api.get('/admin/officials'),
                api.get('/admin/departments')
            ]);
            setOfficials(officialsRes.data);
            setDepartments(deptsRes.data);
        } catch (err) {
            console.error("Authority Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddOfficial = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            await api.post('/admin/create-official', formData);
            setIsModalOpen(false);
            setFormData({ name: "", email: "", password: "", department_id: "" });
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to create official");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-12 animate-in fade-in duration-700 relative">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white">Authority Hub</h1>
                    <p className="text-slate-500 font-medium">Manage municipal officials, roles, and operational capacity</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            placeholder="Find official..."
                            className="pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 ring-primary-500 outline-none w-64 text-slate-900 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary-200 hover:scale-105 transition-all"
                    >
                        <UserPlus className="w-4 h-4" /> Add Official
                    </button>
                </div>
            </header>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl overflow-hidden relative group">
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl -mr-24 -mb-24" />
                    <ShieldCheck className="w-10 h-10 text-primary-500 mb-6 group-hover:rotate-12 transition-transform" />
                    <h3 className="text-4xl font-black font-outfit tracking-tighter mb-2">{officials.length} Active</h3>
                    <p className="text-slate-400 text-sm font-medium italic">Verified municipal officials across {departments.length} sectors</p>
                </div>
                {/* ... existing metrics ... */}
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm flex items-center justify-between group hover:border-indigo-100 dark:hover:border-indigo-900 transition-all">
                    <div>
                        <Briefcase className="w-8 h-8 text-indigo-500 mb-4" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Departments</h3>
                        <p className="text-slate-400 text-sm font-bold">{departments.length} Operational Units</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-50 dark:border-indigo-950/30 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-xl">
                        {departments.length}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm flex items-center justify-between group hover:border-emerald-100 dark:hover:border-emerald-900 transition-all">
                    <div>
                        <Zap className="w-8 h-8 text-emerald-500 mb-4" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Performance</h3>
                        <p className="text-slate-400 text-sm font-bold">4.2h Avg Response</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-50 dark:border-emerald-950/30 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400">
                        4.2h
                    </div>
                </div>
            </div>

            {/* Officials List */}
            <h2 className="text-2xl font-black font-outfit tracking-tighter mb-8 text-slate-900 dark:text-white">Registered Officials</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {officials.length > 0 ? officials.map(p => (
                    <div key={p.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex items-center gap-8 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-2 h-full ${p.status === 'online' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />

                        <div className="w-24 h-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-slate-50 dark:border-slate-800 group-hover:scale-105 transition-transform shadow-sm flex-shrink-0">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt={p.name} />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-black text-slate-900 dark:text-white">{p.name}</h4>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${p.status === 'online' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    }`}>
                                    {p.status || 'offline'}
                                </span>
                                {p.role?.name === 'admin' && (
                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400">
                                        Admin
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {p.role?.name || 'Official'}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.department?.name || 'Unassigned'}</span>
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {p.email}</span>
                            </div>
                            <div className="flex items-center gap-6 mt-6">
                                <div>
                                    <p className="text-[9px] font-black uppercase text-slate-300 dark:text-slate-600">Level</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{p.rank || 'Junior'}</p>
                                </div>
                                <div className="h-6 w-[1px] bg-slate-100 dark:bg-slate-800" />
                                <div>
                                    <p className="text-[9px] font-black uppercase text-slate-300 dark:text-slate-600">Merit Points</p>
                                    <div className="flex items-center gap-1">
                                        <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{p.points || 0}</p>
                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                            <MoreHorizontal className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                )) : (
                    <div className="col-span-2 py-20 text-center text-slate-400 font-bold italic border-2 border-dashed border-slate-100 rounded-[3rem]">
                        No officials registered yet. Start by adding one.
                    </div>
                )}
            </div>

            {/* Add Official Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-slate-100 dark:border-slate-800">
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-primary-50 dark:bg-primary-950/20 rounded-2xl flex items-center justify-center">
                                        <UserPlus className="w-7 h-7 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white">Add New Official</h2>
                                        <p className="text-slate-500 text-sm font-medium italic">Create administrative city credentials</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full flex items-center justify-center transition-all"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAddOfficial} className="space-y-6">
                                {error && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-xs font-bold text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Full Name</label>
                                        <div className="relative">
                                            <Shield className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. Anand Verma"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none transition-all text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Email Address</label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="official@city.gov"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none transition-all text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Access Password</label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="••••••••"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none transition-all text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Department Assignment</label>
                                        <select
                                            required
                                            value={formData.department_id}
                                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 rounded-2xl py-4 px-6 text-sm font-bold outline-none transition-all appearance-none cursor-pointer text-slate-900 dark:text-white"
                                        >
                                            <option value="" className="bg-white dark:bg-slate-900">Select Sector...</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900">{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    disabled={submitting}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-primary-100 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register Official Personnel"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
