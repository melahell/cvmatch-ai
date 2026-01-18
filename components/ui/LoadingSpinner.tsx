"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    text?: string;
    fullScreen?: boolean;
}

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
};

export function LoadingSpinner({
    size = "md",
    className = "",
    text,
    fullScreen = false
}: LoadingSpinnerProps) {
    const spinner = (
        <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
            <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
            {text && <span className="text-sm text-slate-600">{text}</span>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="flex h-screen items-center justify-center">
                {spinner}
            </div>
        );
    }

    return spinner;
}

export default LoadingSpinner;
