"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Clock, MapPin } from "lucide-react";

type Activity = {
    id: string;
    type: "REPORT" | "RESOLVED" | "VERIFIED";
    text: string;
    location: string;
    time: string;
};

const ACTIVITIES: Activity[] = [
    { id: "1", type: "REPORT", text: "Pothole reported", location: "Main St & 5th", time: "Just now" },
    { id: "2", type: "RESOLVED", text: "Streetlight fixed", location: "Oak Avenue", time: "2m ago" },
    { id: "3", type: "VERIFIED", text: "Garbage cleared", location: "Central Park", time: "5m ago" },
    { id: "4", type: "REPORT", text: "Illegal parking", location: "Market Square", time: "8m ago" },
    { id: "5", type: "RESOLVED", text: "Water leak fixed", location: "West End", time: "12m ago" },
];

export const LiveFeed = ({ className }: { className?: string }) => {
    const [activities, setActivities] = useState<Activity[]>(ACTIVITIES);

    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate new activity by rotating the array
            setActivities((prev) => {
                const newArr = [...prev];
                const last = newArr.pop();
                if (last) newArr.unshift(last);
                return newArr;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn("flex flex-col gap-4 w-full max-w-sm", className)}>
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Live Setup Pulse</span>
            </div>

            <div className="relative h-[300px] overflow-hidden mask-gradient-b">
                {/* mask-image not standard tailwind, simulate with gradient overlay if needed, or just let it cut off */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background z-10" />

                <AnimatePresence mode="popLayout">
                    {activities.map((activity, i) => (
                        <motion.div
                            layout
                            key={activity.id}
                            initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5, type: "spring" }}
                            className="mb-3"
                        >
                            <ActivityCard activity={activity} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ActivityCard = ({ activity }: { activity: Activity }) => {
    const getIcon = () => {
        switch (activity.type) {
            case "REPORT": return <AlertCircle className="w-4 h-4 text-orange-400" />;
            case "RESOLVED": return <CheckCircle className="w-4 h-4 text-green-400" />;
            case "VERIFIED": return <CheckCircle className="w-4 h-4 text-blue-400" />;
        }
    };

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="mt-1">{getIcon()}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{activity.text}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {activity.location}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {activity.time}
                    </span>
                </div>
            </div>
        </div>
    );
};
