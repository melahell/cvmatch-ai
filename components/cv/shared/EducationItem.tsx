"use client";

import React from "react";
import { sanitizeText } from "@/lib/cv/sanitize-text";

export interface EducationItemProps {
    diplome: string;
    etablissement: string;
    annee?: string;
    primaryColor?: string;
    variant?: "standard" | "compact" | "inline";
    className?: string;
}

export default function EducationItem({
    diplome,
    etablissement,
    annee,
    primaryColor = "#6366f1",
    variant = "standard",
    className = "",
}: EducationItemProps) {
    if (variant === "inline") {
        return (
            <div className={`break-inside-avoid ${className}`}>
                <span className="font-bold text-[8pt]">{sanitizeText(diplome)}</span>
                {etablissement && <span className="text-[8pt] text-gray-500"> — {sanitizeText(etablissement)}</span>}
                {annee && <span className="text-[7pt] text-gray-400 ml-1">({sanitizeText(annee)})</span>}
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className={`break-inside-avoid mb-1.5 ${className}`}>
                <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[8pt]">{sanitizeText(diplome)}</span>
                    {annee && <span className="text-[7pt] text-gray-500">{sanitizeText(annee)}</span>}
                </div>
                {etablissement && <p className="text-[7pt]" style={{ color: primaryColor }}>{sanitizeText(etablissement)}</p>}
            </div>
        );
    }

    // Standard
    return (
        <div className={`break-inside-avoid mb-2 pl-3 py-1.5 border-l-2 ${className}`} style={{ borderLeftColor: `${primaryColor}40` }}>
            <h4 className="font-bold text-[9pt] text-gray-900">{sanitizeText(diplome)}</h4>
            {etablissement && <p className="text-[8pt] font-medium" style={{ color: primaryColor }}>{sanitizeText(etablissement)}</p>}
            {annee && <p className="text-[7pt] text-gray-500 mt-0.5">{sanitizeText(annee)}</p>}
        </div>
    );
}
