"use client";

import React from "react";
import { sanitizeText } from "@/lib/cv/sanitize-text";

export interface SkillsGridProps {
    skills: string[];
    primaryColor?: string;
    variant?: "tags" | "pills" | "dots" | "list" | "columns";
    columns?: number;
    maxItems?: number;
    textSize?: string;
    className?: string;
}

export default function SkillsGrid({
    skills,
    primaryColor = "#6366f1",
    variant = "tags",
    columns = 2,
    maxItems = 0,
    textSize = "text-[8pt]",
    className = "",
}: SkillsGridProps) {
    const displaySkills = maxItems > 0 ? skills.slice(0, maxItems) : skills;

    if (displaySkills.length === 0) return null;

    if (variant === "dots") {
        return (
            <ul className={`space-y-1 ${textSize} ${className}`}>
                {displaySkills.map((skill, i) => (
                    <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                        <span>{sanitizeText(skill)}</span>
                    </li>
                ))}
            </ul>
        );
    }

    if (variant === "list") {
        return (
            <ul className={`space-y-0.5 ${textSize} ${className}`}>
                {displaySkills.map((skill, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                        <span style={{ color: primaryColor }}>●</span>
                        <span>{sanitizeText(skill)}</span>
                    </li>
                ))}
            </ul>
        );
    }

    if (variant === "columns") {
        return (
            <div className={`grid gap-x-3 gap-y-0.5 ${textSize} ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {displaySkills.map((skill, i) => (
                    <span key={i} className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                        {sanitizeText(skill)}
                    </span>
                ))}
            </div>
        );
    }

    if (variant === "pills") {
        return (
            <div className={`flex flex-wrap gap-1.5 ${className}`}>
                {displaySkills.map((skill, i) => (
                    <span
                        key={i}
                        className={`px-2.5 py-1 rounded-full ${textSize} font-medium`}
                        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                        {sanitizeText(skill)}
                    </span>
                ))}
            </div>
        );
    }

    // Tags (default)
    return (
        <div className={`flex flex-wrap gap-1 ${className}`}>
            {displaySkills.map((skill, i) => (
                <span
                    key={i}
                    className={`px-2 py-0.5 rounded ${textSize}`}
                    style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                >
                    {sanitizeText(skill)}
                </span>
            ))}
        </div>
    );
}
