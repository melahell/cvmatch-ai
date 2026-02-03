"use client";

import React from "react";
import { sanitizeText } from "@/lib/cv/sanitize-text";

export interface ClientReferencesProps {
    clients: string[];
    secteurs?: Array<{ secteur: string; clients: string[] }>;
    primaryColor?: string;
    variant?: "pills" | "grouped" | "tags" | "list";
    maxClients?: number;
    textSize?: string;
    className?: string;
}

export default function ClientReferences({
    clients,
    secteurs,
    primaryColor = "#6366f1",
    variant = "pills",
    maxClients = 0,
    textSize = "text-[7pt]",
    className = "",
}: ClientReferencesProps) {
    if (!clients || clients.length === 0) return null;

    if (variant === "grouped" && secteurs && secteurs.length > 0) {
        return (
            <div className={`space-y-2 ${className}`}>
                {secteurs.map((group, i) => (
                    <div key={i}>
                        <span
                            className={`inline-block text-white ${textSize} uppercase font-bold px-1.5 py-0.5 rounded mb-1`}
                            style={{ backgroundColor: primaryColor }}
                        >
                            {sanitizeText(group.secteur)}
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {group.clients.map((client, j) => (
                                <span key={j} className={`${textSize} text-gray-600`}>
                                    {sanitizeText(client)}{j < group.clients.length - 1 ? "," : ""}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "list") {
        const items = maxClients > 0 ? clients.slice(0, maxClients) : clients;
        return (
            <ul className={`space-y-0.5 ${textSize} ${className}`}>
                {items.map((client, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                        <span style={{ color: primaryColor }}>·</span>
                        <span>{sanitizeText(client)}</span>
                    </li>
                ))}
            </ul>
        );
    }

    if (variant === "tags") {
        const items = maxClients > 0 ? clients.slice(0, maxClients) : clients;
        return (
            <div className={`flex flex-wrap gap-1 ${className}`}>
                {items.map((client, i) => (
                    <span
                        key={i}
                        className={`px-2 py-0.5 rounded ${textSize}`}
                        style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                    >
                        {sanitizeText(client)}
                    </span>
                ))}
            </div>
        );
    }

    // Pills (default)
    const items = maxClients > 0 ? clients.slice(0, maxClients) : clients;
    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            {items.map((client, i) => (
                <span
                    key={i}
                    className={`px-2.5 py-0.5 rounded-full border ${textSize}`}
                    style={{ borderColor: `${primaryColor}40`, color: "inherit" }}
                >
                    {sanitizeText(client)}
                </span>
            ))}
        </div>
    );
}
