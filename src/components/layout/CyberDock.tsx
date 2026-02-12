"use client";

import { motion } from "framer-motion";
import { Home, Shield, User, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const CyberDock = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const dockItems = [
        { icon: <Home size={20} />, label: "Feed", href: "/dashboard" },
        { icon: <User size={20} />, label: "Map", href: "/dashboard/map" },
        { icon: <Shield size={20} />, label: "Report", href: "/dashboard/report" },
        { icon: <Settings size={20} />, label: "Rewards", href: "/dashboard/rewards" },
    ];

    if (!mounted) return null;

    return (
        <>
            {/* Mobile Bottom Dock */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden">
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-white/5"
                >
                    {dockItems.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.href}
                            className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors active:scale-95"
                        >
                            {item.icon}
                            <span className="text-[10px] font-mono uppercase tracking-wider">{item.label}</span>
                        </a>
                    ))}
                </motion.div>
            </div>

        </>
    );
};
