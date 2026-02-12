"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export const HeroBackground = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center w-full min-h-screen bg-background overflow-hidden",
                className
            )}
        >
            <div className="absolute inset-0 z-0">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                {/* Glowing Orbs/Beams */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

                {/* Moving Lines */}
                <div className="absolute inset-0 opacity-30">
                    <MovingLines />
                </div>
            </div>
            <div className="relative z-10 w-full">{children}</div>
        </div>
    );
};

const MovingLines = () => {
    const [lines, setLines] = useState<{
        id: number;
        style: React.CSSProperties;
        animate: any;
        transition: any;
    }[]>([]);

    useEffect(() => {
        const horizontalLines = [...Array(5)].map((_, i) => ({
            id: i,
            style: {
                top: `${Math.random() * 100}%`,
                left: -500,
                position: 'absolute' as const,
                height: '1px',
                width: '500px',
                background: 'linear-gradient(90deg, transparent, var(--primary), transparent)'
            },
            animate: {
                x: ["0vw", "100vw"],
                opacity: [0, 1, 0]
            },
            transition: {
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
            }
        }));

        const verticalLines = [...Array(5)].map((_, i) => ({
            id: i + 10,
            style: {
                left: `${Math.random() * 100}%`,
                top: -500,
                position: 'absolute' as const,
                width: '1px',
                height: '500px',
                background: 'linear-gradient(180deg, transparent, var(--secondary), transparent)'
            },
            animate: {
                y: ["0vh", "100vh"],
                opacity: [0, 1, 0]
            },
            transition: {
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
            }
        }));

        setLines([...horizontalLines, ...verticalLines]);
    }, []);

    return (
        <div className="relative h-full w-full overflow-hidden">
            {lines.map((line) => (
                <motion.div
                    key={line.id}
                    className="absolute" // base class
                    style={line.style}
                    animate={line.animate}
                    transition={line.transition}
                />
            ))}
        </div>
    )
}
