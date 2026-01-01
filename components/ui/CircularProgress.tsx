"use client";

import { useEffect, useState } from "react";

interface CircularProgressProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    showLabel?: boolean;
    label?: string;
    className?: string;
    animated?: boolean;
}

export function CircularProgress({
    value,
    max = 100,
    size = 120,
    strokeWidth = 8,
    showLabel = true,
    label,
    className = "",
    animated = true
}: CircularProgressProps) {
    const [animatedValue, setAnimatedValue] = useState(animated ? 0 : value);

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => setAnimatedValue(value), 100);
            return () => clearTimeout(timer);
        }
    }, [value, animated]);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percent = Math.min(animatedValue / max, 1);
    const offset = circumference - percent * circumference;

    const getColor = () => {
        if (percent >= 0.8) return "text-green-500";
        if (percent >= 0.5) return "text-blue-500";
        if (percent >= 0.3) return "text-amber-500";
        return "text-red-500";
    };

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-200"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${getColor()} transition-all duration-1000 ease-out`}
                />
            </svg>
            {showLabel && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800">
                        {Math.round(animatedValue)}
                    </span>
                    <span className="text-xs text-slate-500">
                        {label || `/ ${max}`}
                    </span>
                </div>
            )}
        </div>
    );
}

export default CircularProgress;
