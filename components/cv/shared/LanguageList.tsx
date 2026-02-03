"use client";

import React from "react";
import { sanitizeText } from "@/lib/cv/sanitize-text";

export interface LanguageListProps {
    langues: Array<{ langue: string; niveau: string }>;
    primaryColor?: string;
    variant?: "bar" | "badge" | "inline" | "simple";
    textSize?: string;
    className?: string;
}

export default function LanguageList({
    langues,
    primaryColor = "#6366f1",
    variant = "simple",
    textSize = "text-[8pt]",
    className = "",
}: LanguageListProps) {
    if (!langues || langues.length === 0) return null;

    if (variant === "badge") {
        return (
            <div className={`space-y-1.5 ${textSize} ${className}`}>
                {langues.map((lang, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <span className="font-medium">{sanitizeText(lang.langue)}</span>
                        <span
                            className="text-[6pt] px-1.5 py-0.5 rounded uppercase font-semibold text-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {sanitizeText(lang.niveau).split(" ")[0]}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "inline") {
        return (
            <div className={`flex flex-wrap gap-x-3 gap-y-0.5 ${textSize} ${className}`}>
                {langues.map((lang, i) => (
                    <span key={i}>
                        <span className="font-semibold">{sanitizeText(lang.langue)}</span>
                        <span className="text-gray-500"> ({sanitizeText(lang.niveau)})</span>
                    </span>
                ))}
            </div>
        );
    }

    if (variant === "bar") {
        const levelMap: Record<string, number> = {
            "natif": 100, "native": 100, "maternelle": 100,
            "c2": 95, "c1": 85, "b2": 70, "b1": 55, "a2": 40, "a1": 25,
            "courant": 80, "intermédiaire": 55, "débutant": 25, "notions": 15,
        };
        const getLevel = (niveau: string) => {
            const n = niveau.toLowerCase().trim();
            for (const [key, val] of Object.entries(levelMap)) {
                if (n.includes(key)) return val;
            }
            return 50;
        };

        return (
            <div className={`space-y-2 ${textSize} ${className}`}>
                {langues.map((lang, i) => (
                    <div key={i}>
                        <div className="flex justify-between mb-0.5">
                            <span className="font-medium">{sanitizeText(lang.langue)}</span>
                            <span className="text-gray-500 text-[7pt]">{sanitizeText(lang.niveau)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full">
                            <div
                                className="h-full rounded-full"
                                style={{ width: `${getLevel(lang.niveau)}%`, backgroundColor: primaryColor }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Simple (default)
    return (
        <div className={`space-y-1 ${textSize} ${className}`}>
            {langues.map((lang, i) => (
                <div key={i} className="flex justify-between items-center">
                    <span className="font-medium">{sanitizeText(lang.langue)}</span>
                    <span className="text-gray-500">{sanitizeText(lang.niveau)}</span>
                </div>
            ))}
        </div>
    );
}
