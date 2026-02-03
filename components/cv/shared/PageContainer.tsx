"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

export interface PageContainerProps {
    /** Page format */
    format?: "A4" | "Letter";
    /** Fond de page */
    backgroundColor?: string;
    /** Font family pour la page */
    fontFamily?: string;
    /** Base font size */
    fontSize?: string;
    /** Line height */
    lineHeight?: string;
    /** Auto-detect overflow and switch to dense mode */
    autoDense?: boolean;
    /** Dense mode forced */
    dense?: boolean;
    /** Called when overflow is detected */
    onOverflow?: (isOverflowing: boolean) => void;
    /** CSS variables to inject as style */
    cssVariables?: Record<string, string>;
    /** Additional classes */
    className?: string;
    children: React.ReactNode;
}

const FORMAT_DIMENSIONS = {
    A4: { width: "210mm", height: "297mm", pxHeight: 1123 },
    Letter: { width: "215.9mm", height: "279.4mm", pxHeight: 1056 },
};

export default function PageContainer({
    format = "A4",
    backgroundColor = "#ffffff",
    fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize = "9pt",
    lineHeight = "1.35",
    autoDense = true,
    dense = false,
    onOverflow,
    cssVariables = {},
    className = "",
    children,
}: PageContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [autoDenseActive, setAutoDenseActive] = useState(false);

    const checkOverflow = useCallback(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const overflow = el.scrollHeight > el.clientHeight + 2; // 2px tolerance
        setIsOverflowing(overflow);
        onOverflow?.(overflow);

        if (autoDense && overflow && !dense && !autoDenseActive) {
            setAutoDenseActive(true);
        }
    }, [autoDense, dense, autoDenseActive, onOverflow]);

    useEffect(() => {
        checkOverflow();
        // Recheck after fonts load
        if (typeof document !== "undefined" && document.fonts) {
            document.fonts.ready.then(() => {
                setTimeout(checkOverflow, 100);
            });
        }
    }, [checkOverflow, children]);

    const dims = FORMAT_DIMENSIONS[format];
    const effectiveDense = dense || autoDenseActive;
    const effectiveFontSize = effectiveDense ? "8pt" : fontSize;
    const effectiveLineHeight = effectiveDense ? "1.25" : lineHeight;

    const style: React.CSSProperties = {
        width: dims.width,
        minHeight: dims.height,
        maxHeight: dims.height,
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily,
        fontSize: effectiveFontSize,
        lineHeight: effectiveLineHeight,
        backgroundColor,
        color: "#1e293b",
        position: "relative",
        // Inject CSS variables
        ...Object.fromEntries(
            Object.entries(cssVariables).map(([k, v]) => [k, v])
        ),
    } as React.CSSProperties;

    return (
        <div
            ref={containerRef}
            className={`cv-page print:shadow-none ${className}`}
            style={style}
            data-format={format}
            data-dense={effectiveDense ? "true" : "false"}
            data-overflowing={isOverflowing ? "true" : "false"}
        >
            {children}

            {/* Overflow warning indicator (visible only in preview, hidden in print) */}
            {isOverflowing && !effectiveDense && (
                <div className="absolute bottom-0 left-0 right-0 bg-amber-50 border-t border-amber-200 px-3 py-1 text-[7pt] text-amber-700 no-print">
                    Contenu trop long — le mode compact a été activé automatiquement
                </div>
            )}
        </div>
    );
}
