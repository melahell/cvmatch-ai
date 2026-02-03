"use client";

import React from "react";
import { sanitizeText } from "@/lib/cv/sanitize-text";

export interface ExperienceItemProps {
    poste: string;
    entreprise: string;
    date_debut: string;
    date_fin?: string;
    lieu?: string;
    realisations?: string[];
    clients?: string[];
    contexte?: string;
    technologies?: string[];
    /** Primary accent color */
    primaryColor?: string;
    /** Layout variant */
    variant?: "timeline" | "standard" | "compact" | "minimal";
    /** Show relevance badge */
    relevanceScore?: number;
    /** Max realisations to show (0 = all) */
    maxRealisations?: number;
    /** Bullet style */
    bulletStyle?: "dot" | "dash" | "arrow" | "disc";
    className?: string;
}

export default function ExperienceItem({
    poste,
    entreprise,
    date_debut,
    date_fin,
    lieu,
    realisations = [],
    clients = [],
    contexte,
    technologies = [],
    primaryColor = "#6366f1",
    variant = "standard",
    relevanceScore,
    maxRealisations = 0,
    bulletStyle = "dot",
    className = "",
}: ExperienceItemProps) {
    const displayRealisations = maxRealisations > 0 ? realisations.slice(0, maxRealisations) : realisations;
    const dateStr = `${date_debut} - ${date_fin || "Présent"}`;

    const bulletChar = bulletStyle === "dash" ? "—" : bulletStyle === "arrow" ? "→" : bulletStyle === "disc" ? "•" : "";

    if (variant === "timeline") {
        return (
            <div className={`cv-item relative pl-5 py-2 border-l-[3px] break-inside-avoid ${className}`} style={{ borderLeftColor: primaryColor }}>
                {/* Timeline dot */}
                <div
                    className="absolute -left-[8px] top-3 w-3.5 h-3.5 rounded-full bg-white border-[3px]"
                    style={{ borderColor: primaryColor }}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-1 mb-0.5">
                    <h4 className="text-[10pt] font-bold text-gray-900">{sanitizeText(poste)}</h4>
                    <span className="text-[7pt] font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                        {dateStr}
                    </span>
                </div>
                <p className="text-[9pt] font-semibold mb-1" style={{ color: primaryColor }}>
                    {sanitizeText(entreprise)}{lieu ? ` · ${sanitizeText(lieu)}` : ""}
                </p>
                {contexte && <p className="text-[7pt] italic text-gray-500 mb-1">{sanitizeText(contexte)}</p>}
                {technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                        {technologies.map((tech, i) => (
                            <span key={i} className="text-[6pt] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                                {sanitizeText(tech)}
                            </span>
                        ))}
                    </div>
                )}
                {displayRealisations.length > 0 && (
                    <ul className="text-[8pt] text-gray-700 space-y-0.5 list-disc list-outside pl-4">
                        {displayRealisations.map((r, j) => (
                            <li key={j}>{sanitizeText(r)}</li>
                        ))}
                    </ul>
                )}
                {clients.length > 0 && (
                    <p className="text-[7pt] text-gray-500 mt-1">Clients : {clients.map(sanitizeText).join(", ")}</p>
                )}
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className={`cv-item break-inside-avoid mb-2 ${className}`}>
                <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[9pt]">{sanitizeText(poste)}</span>
                    <span className="text-[7pt] text-gray-500">{dateStr}</span>
                </div>
                <p className="text-[8pt] font-medium" style={{ color: primaryColor }}>{sanitizeText(entreprise)}</p>
                {displayRealisations.length > 0 && (
                    <ul className="text-[7pt] text-gray-600 mt-0.5 space-y-0">
                        {displayRealisations.slice(0, 3).map((r, j) => (
                            <li key={j} className="flex gap-1"><span style={{ color: primaryColor }}>·</span> {sanitizeText(r)}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    if (variant === "minimal") {
        return (
            <div className={`cv-item break-inside-avoid mb-1.5 ${className}`}>
                <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[9pt]">{sanitizeText(poste)} — <span className="font-medium" style={{ color: primaryColor }}>{sanitizeText(entreprise)}</span></span>
                    <span className="text-[7pt] text-gray-500 flex-shrink-0">{dateStr}</span>
                </div>
            </div>
        );
    }

    // Standard variant
    return (
        <div className={`cv-item break-inside-avoid mb-3 ${className}`}>
            <div className="flex justify-between items-start mb-0.5">
                <div>
                    <h4 className="font-bold text-[10pt] text-gray-900">
                        {sanitizeText(poste)}
                        {relevanceScore !== undefined && relevanceScore >= 50 && (
                            <span className="ml-2 bg-green-100 text-green-700 text-[6pt] px-1.5 py-0.5 rounded font-bold align-middle">
                                Pertinent
                            </span>
                        )}
                    </h4>
                    <p className="font-medium text-[9pt]" style={{ color: primaryColor }}>
                        {sanitizeText(entreprise)}
                        {lieu ? ` · ${sanitizeText(lieu)}` : ""}
                    </p>
                </div>
                <span className="text-[8pt] text-gray-500 flex-shrink-0 ml-2">
                    {dateStr}
                </span>
            </div>
            {contexte && <p className="text-[7pt] italic text-gray-500 mb-1">{sanitizeText(contexte)}</p>}
            {technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                    {technologies.map((tech, i) => (
                        <span key={i} className="text-[6pt] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                            {sanitizeText(tech)}
                        </span>
                    ))}
                </div>
            )}
            {displayRealisations.length > 0 && (
                <ul className="text-[8pt] text-gray-700 space-y-0.5 mt-1">
                    {displayRealisations.map((r, j) => (
                        <li key={j} className="flex items-start gap-1.5">
                            {bulletStyle === "dot" ? (
                                <span className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                            ) : (
                                <span className="flex-shrink-0" style={{ color: primaryColor }}>{bulletChar}</span>
                            )}
                            <span>{sanitizeText(r)}</span>
                        </li>
                    ))}
                </ul>
            )}
            {clients.length > 0 && (
                <p className="text-[7pt] text-gray-500 mt-1">
                    <span className="font-medium">Clients : </span>{clients.map(sanitizeText).join(", ")}
                </p>
            )}
        </div>
    );
}
