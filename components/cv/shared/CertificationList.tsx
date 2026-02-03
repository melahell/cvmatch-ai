"use client";

import React from "react";
import { sanitizeText } from "@/lib/cv/sanitize-text";

export interface CertificationListProps {
    certifications: string[];
    primaryColor?: string;
    variant?: "tags" | "list" | "inline";
    maxItems?: number;
    textSize?: string;
    className?: string;
}

export default function CertificationList({
    certifications,
    primaryColor = "#6366f1",
    variant = "tags",
    maxItems = 0,
    textSize = "text-[7pt]",
    className = "",
}: CertificationListProps) {
    const items = maxItems > 0 ? certifications.slice(0, maxItems) : certifications;
    if (items.length === 0) return null;

    if (variant === "list") {
        return (
            <ul className={`space-y-1 ${textSize} ${className}`}>
                {items.map((cert, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                        <span style={{ color: primaryColor }}>✓</span>
                        <span>{sanitizeText(cert)}</span>
                    </li>
                ))}
            </ul>
        );
    }

    if (variant === "inline") {
        return (
            <div className={`${textSize} ${className}`}>
                {items.map((cert, i) => (
                    <span key={i}>
                        {i > 0 && <span className="text-gray-300"> · </span>}
                        <span>{sanitizeText(cert)}</span>
                    </span>
                ))}
            </div>
        );
    }

    // Tags (default)
    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            {items.map((cert, i) => (
                <span
                    key={i}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${textSize} font-medium`}
                    style={{ borderColor: `${primaryColor}40`, color: primaryColor, backgroundColor: `${primaryColor}08` }}
                >
                    {sanitizeText(cert)}
                </span>
            ))}
        </div>
    );
}
