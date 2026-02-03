"use client";

import React from "react";
import { sanitizeText } from "@/lib/cv/sanitize-text";

export interface SummaryBlockProps {
    text: string;
    primaryColor?: string;
    variant?: "border-left" | "quote" | "box" | "plain";
    textSize?: string;
    className?: string;
}

export default function SummaryBlock({
    text,
    primaryColor = "#6366f1",
    variant = "border-left",
    textSize = "text-[9pt]",
    className = "",
}: SummaryBlockProps) {
    if (!text) return null;

    const cleanText = sanitizeText(text);

    if (variant === "quote") {
        return (
            <blockquote className={`${textSize} italic text-gray-600 leading-relaxed border-l-3 pl-3 ${className}`} style={{ borderLeftColor: primaryColor }}>
                &ldquo;{cleanText}&rdquo;
            </blockquote>
        );
    }

    if (variant === "box") {
        return (
            <div className={`${textSize} text-gray-700 leading-relaxed px-3 py-2 rounded-lg ${className}`} style={{ backgroundColor: `${primaryColor}08` }}>
                {cleanText}
            </div>
        );
    }

    if (variant === "plain") {
        return (
            <p className={`${textSize} text-gray-600 leading-relaxed ${className}`}>
                {cleanText}
            </p>
        );
    }

    // Border-left (default)
    return (
        <p className={`${textSize} text-gray-700 leading-relaxed border-l-4 pl-3 font-medium ${className}`} style={{ borderLeftColor: `${primaryColor}30` }}>
            {cleanText}
        </p>
    );
}
