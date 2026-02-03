"use client";

import React from "react";

export interface SectionTitleProps {
    title: string;
    primaryColor?: string;
    variant?: "underline" | "accent-line" | "badge" | "simple" | "sidebar";
    textSize?: string;
    className?: string;
}

export default function SectionTitle({
    title,
    primaryColor = "#6366f1",
    variant = "underline",
    textSize = "text-[10pt]",
    className = "",
}: SectionTitleProps) {
    if (variant === "accent-line") {
        return (
            <h2 className={`${textSize} font-extrabold mb-2 flex items-center gap-2 uppercase tracking-widest text-gray-900 ${className}`}>
                <span className="w-5 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                {title}
            </h2>
        );
    }

    if (variant === "badge") {
        return (
            <h2 className={`${textSize} font-bold mb-2 ${className}`}>
                <span className="px-2 py-0.5 rounded text-white" style={{ backgroundColor: primaryColor }}>
                    {title}
                </span>
            </h2>
        );
    }

    if (variant === "sidebar") {
        return (
            <h3
                className={`font-bold uppercase text-[7pt] tracking-widest border-b-2 pb-1.5 mb-2 ${className}`}
                style={{ color: `${primaryColor}cc`, borderBottomColor: `${primaryColor}50` }}
            >
                {title}
            </h3>
        );
    }

    if (variant === "simple") {
        return (
            <h2 className={`${textSize} font-bold mb-2 ${className}`} style={{ color: primaryColor }}>
                {title}
            </h2>
        );
    }

    // Underline (default)
    return (
        <h2
            className={`${textSize} font-bold mb-3 pb-2 border-b-2 ${className}`}
            style={{ borderBottomColor: primaryColor, color: primaryColor }}
        >
            {title}
        </h2>
    );
}
