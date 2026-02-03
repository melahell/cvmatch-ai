"use client";

import React from "react";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

export interface ContactInfoProps {
    email?: string;
    telephone?: string;
    localisation?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    layout?: "vertical" | "horizontal" | "inline";
    iconColor?: string;
    textColor?: string;
    iconSize?: number;
    textSize?: string;
    showIcons?: boolean;
    className?: string;
}

interface ContactItem {
    icon: React.ReactNode;
    value: string;
    href?: string;
}

export default function ContactInfo({
    email,
    telephone,
    localisation,
    linkedin,
    github,
    portfolio,
    layout = "vertical",
    iconColor = "#6366f1",
    textColor = "inherit",
    iconSize = 14,
    textSize = "text-[8pt]",
    showIcons = true,
    className = "",
}: ContactInfoProps) {
    const items: ContactItem[] = [];

    if (email) items.push({ icon: <Mail style={{ width: iconSize, height: iconSize, color: iconColor, flexShrink: 0 }} />, value: email, href: `mailto:${email}` });
    if (telephone) items.push({ icon: <Phone style={{ width: iconSize, height: iconSize, color: iconColor, flexShrink: 0 }} />, value: telephone, href: `tel:${telephone}` });
    if (localisation) items.push({ icon: <MapPin style={{ width: iconSize, height: iconSize, color: iconColor, flexShrink: 0 }} />, value: localisation });
    if (linkedin) items.push({ icon: <Linkedin style={{ width: iconSize, height: iconSize, color: iconColor, flexShrink: 0 }} />, value: linkedin.replace(/https?:\/\/(www\.)?/, ""), href: linkedin.startsWith("http") ? linkedin : `https://${linkedin}` });
    if (github) items.push({ icon: <Github style={{ width: iconSize, height: iconSize, color: iconColor, flexShrink: 0 }} />, value: github.replace(/https?:\/\/(www\.)?/, ""), href: github.startsWith("http") ? github : `https://${github}` });
    if (portfolio) items.push({ icon: <Globe style={{ width: iconSize, height: iconSize, color: iconColor, flexShrink: 0 }} />, value: portfolio.replace(/https?:\/\/(www\.)?/, ""), href: portfolio.startsWith("http") ? portfolio : `https://${portfolio}` });

    if (items.length === 0) return null;

    const containerClass = layout === "horizontal"
        ? "flex flex-wrap gap-x-4 gap-y-1"
        : layout === "inline"
            ? "flex flex-wrap gap-x-3 gap-y-0.5 items-center"
            : "space-y-1.5";

    const separatorInline = layout === "inline" ? <span className="text-gray-300">|</span> : null;

    return (
        <div className={`${containerClass} ${textSize} ${className}`} style={{ color: textColor }}>
            {items.map((item, i) => (
                <React.Fragment key={i}>
                    {layout === "inline" && i > 0 && separatorInline}
                    <div className="flex items-center gap-1.5 min-w-0">
                        {showIcons && item.icon}
                        <span className="truncate">{item.value}</span>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
}
