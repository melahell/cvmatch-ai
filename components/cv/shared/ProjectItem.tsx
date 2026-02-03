"use client";

import React from "react";
import { sanitizeText } from "@/lib/cv/sanitize-text";

export interface ProjectItemProps {
    nom: string;
    description?: string;
    technologies?: string[];
    lien?: string;
    primaryColor?: string;
    variant?: "card" | "compact" | "inline";
    className?: string;
}

export default function ProjectItem({
    nom,
    description,
    technologies = [],
    lien,
    primaryColor = "#6366f1",
    variant = "card",
    className = "",
}: ProjectItemProps) {
    if (variant === "inline") {
        return (
            <div className={`cv-item break-inside-avoid ${className}`}>
                <span className="font-bold text-[8pt]">{sanitizeText(nom)}</span>
                {description && <span className="text-[7pt] text-gray-500"> — {sanitizeText(description)}</span>}
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className={`cv-item break-inside-avoid ${className}`}>
                <h4 className="font-bold text-[8pt]">{sanitizeText(nom)}</h4>
                {description && <p className="text-[7pt] text-gray-600">{sanitizeText(description)}</p>}
                {technologies.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {technologies.map((tech, i) => (
                            <span key={i} className="text-[5pt] px-1 py-0.5 rounded" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                                {sanitizeText(tech)}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Card (default)
    return (
        <div className={`cv-item break-inside-avoid pl-3 py-2 border-l-2 ${className}`} style={{ borderLeftColor: `${primaryColor}40` }}>
            <h4 className="font-bold text-[8pt] text-gray-900">{sanitizeText(nom)}</h4>
            {description && <p className="text-[7pt] text-gray-600 mt-0.5">{sanitizeText(description)}</p>}
            {technologies.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-1">
                    {technologies.map((tech, i) => (
                        <span key={i} className="text-[6pt] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                            {sanitizeText(tech)}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
