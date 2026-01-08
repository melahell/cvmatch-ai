"use client";

import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
    score: number;
    size?: "sm" | "md" | "lg";
    showPercentage?: boolean;
    className?: string;
}

/**
 * Unified score badge component with dynamic colors based on score level
 * Used across: Candidatures, CVs, Analyser pages
 */
export function ScoreBadge({
    score,
    size = "md",
    showPercentage = true,
    className
}: ScoreBadgeProps) {
    const getScoreColor = (s: number) => {
        if (s >= 80) return "bg-green-100 text-green-700 border-green-200";
        if (s >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-red-100 text-red-700 border-red-200";
    };

    const sizeClasses = {
        sm: "text-xs px-1.5 py-0.5",
        md: "text-sm px-2 py-0.5",
        lg: "text-base px-3 py-1"
    };

    return (
        <span
            className={cn(
                "font-bold rounded border",
                getScoreColor(score),
                sizeClasses[size],
                className
            )}
        >
            {score}{showPercentage && "%"}
        </span>
    );
}

/**
 * Colored indicator dot for list items - matches score color
 */
export function ScoreIndicator({ score, className }: { score: number; className?: string }) {
    const getColor = (s: number) => {
        if (s >= 80) return "bg-green-500";
        if (s >= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", getColor(score), className)} />
    );
}

/**
 * Score legend component - shows color coding explanation
 */
export function ScoreLegend({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500", className)}>
            <span className="font-medium text-slate-600">Légende Score de Match :</span>
            <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                ≥80% Excellent
            </span>
            <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                60-79% Bon
            </span>
            <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                &lt;60% Faible
            </span>
        </div>
    );
}
