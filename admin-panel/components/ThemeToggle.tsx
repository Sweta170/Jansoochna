"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className="w-10 h-10 bg-slate-800 rounded-xl animate-pulse ml-6" />
    );

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-4 px-6 py-4 w-full text-slate-400 hover:text-primary-400 transition-all group relative overflow-hidden"
            aria-label="Toggle Theme"
        >
            <div className={`transition-all duration-500 transform ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 opacity-0'}`}>
                <Sun className="w-5 h-5 text-amber-400" />
            </div>
            <div className={`absolute transition-all duration-500 transform ${theme === 'dark' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100'}`}>
                <Moon className="w-5 h-5 text-slate-300 group-hover:text-primary-400" />
            </div>
            <span className="font-black text-[10px] uppercase tracking-widest ml-1">
                {theme === 'dark' ? 'Solstice Mode' : 'Shadow Mode'}
            </span>
            <div className={`ml-auto w-8 h-4 rounded-full p-1 transition-colors duration-300 flex items-center ${theme === 'dark' ? 'bg-primary-500' : 'bg-slate-700'}`}>
                <div className={`w-2 h-2 bg-white rounded-full transition-all duration-300 transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
        </button>
    );
}
