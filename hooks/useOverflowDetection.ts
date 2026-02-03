"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface OverflowState {
    isOverflowing: boolean;
    overflowAmount: number; // px above the page height
    suggestDense: boolean;
    pageCount: number;
}

interface UseOverflowDetectionOptions {
    /** Page height in pixels (A4 at 96dpi = 1123px) */
    pageHeight?: number;
    /** Page format */
    format?: "A4" | "Letter";
    /** Auto-enable dense mode on overflow */
    autoDense?: boolean;
    /** Callback when overflow changes */
    onOverflowChange?: (state: OverflowState) => void;
}

const PAGE_HEIGHTS: Record<string, number> = {
    A4: 1123, // 297mm at 96dpi
    Letter: 1056, // 279.4mm at 96dpi
};

/**
 * Hook to detect when CV content overflows the page boundary.
 * Inspired by Reactive Resume's useResizeObserver approach.
 *
 * Returns overflow state and a ref to attach to the CV container.
 */
export function useOverflowDetection(options: UseOverflowDetectionOptions = {}) {
    const {
        format = "A4",
        autoDense = false,
        onOverflowChange,
    } = options;

    const containerRef = useRef<HTMLDivElement>(null);
    const [overflowState, setOverflowState] = useState<OverflowState>({
        isOverflowing: false,
        overflowAmount: 0,
        suggestDense: false,
        pageCount: 1,
    });
    const [isDense, setIsDense] = useState(false);

    const checkOverflow = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const pageHeight = PAGE_HEIGHTS[format] || PAGE_HEIGHTS.A4;
        const scrollHeight = container.scrollHeight;
        const overflowAmount = Math.max(0, scrollHeight - pageHeight);
        const isOverflowing = overflowAmount > 10; // 10px threshold
        const pageCount = Math.ceil(scrollHeight / pageHeight);
        const suggestDense = overflowAmount > 50 && overflowAmount < pageHeight * 0.3; // 5-30% overflow

        const newState: OverflowState = {
            isOverflowing,
            overflowAmount,
            suggestDense,
            pageCount,
        };

        setOverflowState(newState);
        onOverflowChange?.(newState);

        if (autoDense && suggestDense && !isDense) {
            setIsDense(true);
        }
    }, [format, autoDense, isDense, onOverflowChange]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Initial check
        checkOverflow();

        // Watch for size changes
        const observer = new ResizeObserver(() => {
            checkOverflow();
        });

        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, [checkOverflow]);

    return {
        containerRef,
        overflowState,
        isDense,
        setIsDense,
        checkOverflow,
    };
}
