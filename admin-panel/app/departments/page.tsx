"use client";

import React, { useEffect, useState } from "react";
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    Users,
    ChevronRight,
    Search,
    Filter,
    BarChart2,
    Plus,
    X,
    Building,
    FileText,
    Loader2
} from "lucide-react";
import api from "@/services/api";

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filteredDepartments = departments
        .filter(d =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "efficiency") return (b.efficiency || 0) - (a.efficiency || 0);
            return 0;
        });

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/admin/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error("Fetch Departments Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleAddDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            await api.post('/admin/departments', formData);
            setIsModalOpen(false);
            setFormData({ name: "", description: "" });
            fetchDepartments();
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to create department");
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

    const colors = ["bg-emerald-500", "bg-amber-500", "bg-sky-500", "bg-indigo-500", "bg-rose-500", "bg-violet-500"];

    return (
        <div className="p-12 animate-in fade-in duration-700 relative">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white">Departmental Audit</h1>
                    <p className="text-slate-500 font-medium">Performance monitoring and ownership across municipal sectors</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-6 py-3 border rounded-2xl text-sm font-bold shadow-sm transition-all active:scale-95 ${isFilterOpen ? 'bg-slate-900 dark:bg-primary-600 text-white border-slate-900 dark:border-primary-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            {sortBy === 'name' ? 'Filter' : `Sorted: ${sortBy}`}
                        </button>

                        {isFilterOpen && (
                            <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 p-4 animate-in slide-in-from-top-4 duration-300">
                                <p className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Sort Records By</p>
                                <div className="space-y-1">
                                    {[
                                        { label: "Alphabetical", value: "name" },
                                        { label: "High Efficiency", value: "efficiency" },
                                    ].map(s => (
                                        <button
                                            key={s.value}
                                            onClick={() => { setSortBy(s.value); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${sortBy === s.value ? 'bg-slate-900 dark:bg-primary-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-primary-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 dark:shadow-none hover:scale-105 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Add Department
                    </button>
                </div>
            </header>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {[
                    { label: "Active Sectors", value: departments.length.toString(), icon: BarChart2, color: "text-primary-500", bg: "bg-primary-50 dark:bg-primary-950/20" },
                    { label: "Total Workforce", value: "348", icon: Users, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
                    { label: "On-Track SLA", value: "88%", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
                    { label: "Escalation Risk", value: "Low", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
                ].map((stat, i) => (
                    <div key={i} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl transition-all">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-6`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Quick Search */}
            <div className="mb-10 relative max-w-md group">
                <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
                <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by department name or scope..."
                    className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-sm font-bold shadow-sm focus:ring-4 ring-slate-50 dark:ring-slate-950/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
                />
            </div>

            {/* Department Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredDepartments.length > 0 ? filteredDepartments.map((dept, idx) => {
                    const color = colors[idx % colors.length];
                    const efficiency = 90 - (idx * 3);
                    return (
                        <div key={dept.id} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                            <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] rounded-full -mr-16 -mt-16`} />

                            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg shadow-slate-100 dark:shadow-none`}>
                                        <span className="text-white font-black text-xl">{dept.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-xl text-slate-900 dark:text-white leading-tight">{dept.name}</h4>
                                        <p className="text-sm text-slate-400 font-medium truncate max-w-[150px]">{dept.description || 'Municipal Service'}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black bg-slate-900 dark:bg-primary-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                                    {efficiency}% Efficiency
                                </span>
                            </div>

                            <div className="space-y-4 mb-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Resolution Authority</span>
                                    <span className="font-black text-slate-900 dark:text-white">Level 4</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${color}`}
                                        style={{ width: `${efficiency}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-8">
                                <div className="flex -space-x-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-sm">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${dept.id + i}`} alt="official" />
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400 shadow-sm">
                                        +5
                                    </div>
                                </div>
                                <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-slate-900 dark:group-hover:bg-primary-600 transition-colors">
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-20 text-center text-slate-400 font-bold italic border-2 border-dashed border-slate-100 rounded-[3rem]">
                        No departments found matching your criteria.
                    </div>
                )}
            </div>

            {/* Add Department Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-slate-100 dark:border-slate-800">
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl flex items-center justify-center">
                                        <Building className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white">New Department</h2>
                                        <p className="text-slate-500 text-sm font-medium italic">Define a new municipal sector</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full flex items-center justify-center transition-all"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAddDepartment} className="space-y-6">
                                {error && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-xs font-bold text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Sector Name</label>
                                    <div className="relative">
                                        <Building className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Urban Planning"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none transition-all text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Scope / Description</label>
                                    <div className="relative">
                                        <FileText className="w-4 h-4 absolute left-5 top-6 text-slate-400" />
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe the responsibilities of this sector..."
                                            rows={3}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none transition-all resize-none text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={submitting}
                                    className="w-full bg-slate-900 dark:bg-primary-600 hover:bg-slate-800 dark:hover:bg-primary-700 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initialize Sector"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
