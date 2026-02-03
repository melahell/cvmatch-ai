"use client";

import React from "react";

export interface SectionGridProps {
    /** Number of columns (1-4) */
    columns?: 1 | 2 | 3 | 4;
    /** Gap between items in the grid */
    gapX?: string;
    gapY?: string;
    /** Children to render in the grid */
    children: React.ReactNode;
    className?: string;
}

/**
 * Configurable CSS Grid for CV sections.
 * Inspired by Reactive Resume's section grid system.
 *
 * Usage:
 * ```tsx
 * <SectionGrid columns={2} gapX="4mm" gapY="2mm">
 *   {skills.map(skill => <SkillTag key={skill} label={skill} />)}
 * </SectionGrid>
 * ```
 */
export default function SectionGrid({
    columns = 1,
    gapX = "var(--cv-gap-x, 4mm)",
    gapY = "var(--cv-gap-y, 3mm)",
    children,
    className = "",
}: SectionGridProps) {
    return (
        <div
            className={`section-grid ${className}`}
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                columnGap: gapX,
                rowGap: gapY,
            }}
        >
            {children}
        </div>
    );
}

/**
 * Section wrapper with title, grid layout, and print break rules
 */
export interface PageSectionProps {
    title: string;
    /** Primary color for the section title */
    primaryColor?: string;
    /** Number of columns */
    columns?: 1 | 2 | 3 | 4;
    /** Section visibility */
    visible?: boolean;
    /** Variant for title styling */
    titleVariant?: "border-bottom" | "accent" | "uppercase" | "minimal";
    children: React.ReactNode;
    className?: string;
}

export function PageSection({
    title,
    primaryColor = "var(--cv-primary, #3b82f6)",
    columns = 1,
    visible = true,
    titleVariant = "border-bottom",
    children,
    className = "",
}: PageSectionProps) {
    if (!visible) return null;

    const titleStyles: Record<string, React.CSSProperties> = {
        "border-bottom": {
            fontSize: "var(--cv-font-size-section, 10pt)",
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.5pt",
            color: primaryColor,
            borderBottom: `1.5px solid ${primaryColor}`,
            paddingBottom: "1.5mm",
            marginBottom: "2.5mm",
        },
        accent: {
            fontSize: "var(--cv-font-size-section, 10pt)",
            fontWeight: 700,
            color: primaryColor,
            marginBottom: "2mm",
        },
        uppercase: {
            fontSize: "var(--cv-font-size-small, 8pt)",
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "1pt",
            color: "var(--cv-text-muted, #6b7280)",
            marginBottom: "2mm",
        },
        minimal: {
            fontSize: "var(--cv-font-size-section, 10pt)",
            fontWeight: 600,
            color: "var(--cv-text, #1f2937)",
            marginBottom: "2mm",
        },
    };

    return (
        <section className={`cv-section mb-3 ${className}`}>
            <h2 style={titleStyles[titleVariant]}>{title}</h2>
            {columns > 1 ? (
                <SectionGrid columns={columns}>
                    {children}
                </SectionGrid>
            ) : (
                children
            )}
        </section>
    );
}
