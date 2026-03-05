"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    ShieldCheck,
    MapPin,
    Clock,
    PieChart,
    CheckCircle2,
    Bell,
    ArrowUpRight
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: "Overview", href: "/" },
        { icon: MapPin, label: "Spatial Core", href: "/map" },
        { icon: Clock, label: "Issue Ledger", href: "/complaints" },
        { icon: PieChart, label: "Neural Insights", href: "/analytics" },
        { icon: CheckCircle2, label: "Departmental", href: "/departments" },
        { icon: Users, label: "Authority Hub", href: "/authority" },
        { icon: Bell, label: "System Logs", href: "/logs" },
        { icon: ArrowUpRight, label: "Export Data", href: "/export" },
    ];

    return (
        <aside className="w-80 h-screen bg-slate-900 text-white flex flex-col sticky top-0">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center font-black text-xl">
                        JS
                    </div>
                    <span className="text-2xl font-black font-outfit tracking-tighter italic">JanSoochna</span>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={i}
                                href={item.href}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 group ${isActive
                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-900/50"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "group-hover:scale-110"}`} />
                                <span className="font-bold text-sm tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-8 border-t border-slate-800 space-y-2">
                <ThemeToggle />
                <button className="flex items-center gap-4 px-6 py-4 w-full text-slate-400 hover:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-wide">Secure Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
