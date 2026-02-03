"use client";

import React from "react";

export interface PageLayoutProps {
    /** Layout type */
    layout: "full-width" | "sidebar-left" | "sidebar-right";
    /** Sidebar width (CSS value, e.g. "35%", "75mm", "var(--cv-sidebar-width)") */
    sidebarWidth?: string;
    /** Sidebar background color */
    sidebarBg?: string;
    /** Sidebar text color */
    sidebarTextColor?: string;
    /** Sidebar padding */
    sidebarPadding?: string;
    /** Main content padding */
    mainPadding?: string;
    /** Gap between sidebar and main */
    gap?: string;
    /** Page height constraint (set to "auto" for multi-page) */
    minHeight?: string;
    /** Children: [main, sidebar] or just [main] for full-width */
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Responsive page layout component with configurable sidebar.
 * Supports left sidebar, right sidebar, or full-width layouts.
 *
 * Usage:
 * ```tsx
 * <PageLayout layout="sidebar-left" sidebarWidth="35%" sidebarBg="#f8fafc">
 *   <main>...</main>
 *   <aside>...</aside>
 * </PageLayout>
 * ```
 */
export default function PageLayout({
    layout = "sidebar-right",
    sidebarWidth = "var(--cv-sidebar-width, 35%)",
    sidebarBg = "var(--cv-sidebar-bg, #f8fafc)",
    sidebarTextColor = "var(--cv-sidebar-text, #1f2937)",
    sidebarPadding = "var(--cv-margin-y, 5mm) var(--cv-margin-x, 5mm)",
    mainPadding = "var(--cv-margin-y, 5mm) var(--cv-margin-x, 5mm)",
    gap = "0",
    minHeight = "1123px",
    children,
    className = "",
    style,
}: PageLayoutProps) {
    const childArray = React.Children.toArray(children);
    const mainContent = childArray[0];
    const sidebarContent = childArray[1];

    if (layout === "full-width" || !sidebarContent) {
        return (
            <div
                className={`cv-page-layout ${className}`}
                style={{
                    minHeight,
                    background: "var(--cv-background, #ffffff)",
                    ...style,
                }}
            >
                <div style={{ padding: mainPadding }}>
                    {mainContent}
                </div>
            </div>
        );
    }

    const sidebarElement = (
        <aside
            style={{
                width: sidebarWidth,
                flexShrink: 0,
                backgroundColor: sidebarBg,
                color: sidebarTextColor,
                padding: sidebarPadding,
            }}
        >
            {sidebarContent}
        </aside>
    );

    const mainElement = (
        <main
            style={{
                flex: 1,
                minWidth: 0,
                padding: mainPadding,
            }}
        >
            {mainContent}
        </main>
    );

    return (
        <div
            className={`cv-page-layout ${className}`}
            style={{
                display: "flex",
                gap,
                minHeight,
                background: "var(--cv-background, #ffffff)",
                fontFamily: "var(--cv-font-body, 'Inter', sans-serif)",
                color: "var(--cv-text, #1f2937)",
                lineHeight: "var(--cv-line-height, 1.35)",
                ...style,
            }}
        >
            {layout === "sidebar-left" ? (
                <>
                    {sidebarElement}
                    {mainElement}
                </>
            ) : (
                <>
                    {mainElement}
                    {sidebarElement}
                </>
            )}
        </div>
    );
}
