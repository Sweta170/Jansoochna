"use client";

import React, { useEffect, useState } from "react";
import {
    Zap,
    ArrowUp,
    ArrowDown,
    MessageSquare,
    ThumbsUp,
    Target,
    Activity
} from "lucide-react";
import api from "@/services/api";

export default function AnalyticsPage() {
    return (
        <div className="p-12 animate-in fade-in duration-500">
            <header className="mb-12">
                <h1 className="text-4xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white">Neural Insights</h1>
                <p className="text-slate-500 font-medium">AI-driven citizen sentiment and operational efficiency metrics</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-primary-900/50">
                            <Activity className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-5xl font-black font-outfit leading-none tracking-tighter mb-6">Citizen <br /> Sentiment <br /> Index</h2>

                        <div className="flex items-end gap-1 mb-6 h-32">
                            {[40, 65, 55, 80, 70, 90, 85, 95, 100, 85, 75, 90].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-primary-500/20 rounded-t-lg hover:bg-primary-500 transition-all cursor-pointer group/bar relative"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                        {h}%
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center text-slate-400 text-xs font-black uppercase tracking-widest">
                            <span>January</span>
                            <span>February (Live)</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Target className="w-6 h-6 text-rose-500" />
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">SLA Compliance</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">92.4%</h3>
                        <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" /> +4.2% since start
                        </p>
                    </div>

                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6 text-indigo-500" />
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">AI Resolution Priority</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">78/100</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1 italic">
                            System is highly responsive
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: "Waste Management", score: "88%", icon: MessageSquare, color: "text-emerald-500" },
                    { title: "Public Utilities", score: "62%", icon: Activity, color: "text-amber-500" },
                    { title: "Road Infrastructure", score: "45%", icon: Target, color: "text-rose-500" },
                ].map((dept, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-slate-200 dark:hover:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-black text-slate-900 dark:text-white text-lg">{dept.title}</h4>
                            <dept.icon className={`w-5 h-5 ${dept.color}`} />
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                            <div className={`h-full ${dept.color.replace('text', 'bg')} opacity-80`} style={{ width: dept.score }} />
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Efficiency</span>
                            <span>{dept.score}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
