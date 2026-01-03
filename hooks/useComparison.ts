"use client";

import { useState, useCallback } from "react";

export interface Comparison {
    analysisA: any;
    analysisB: any;
}

export function useComparison(initialA?: any, initialB?: any) {
    const [comparison, setComparison] = useState<Comparison | null>(
        initialA && initialB ? { analysisA: initialA, analysisB: initialB } : null
    );

    const setAnalysisA = useCallback((analysis: any) => {
        setComparison(prev => ({
            analysisA: analysis,
            analysisB: prev?.analysisB || null
        }));
    }, []);

    const setAnalysisB = useCallback((analysis: any) => {
        setComparison(prev => ({
            analysisA: prev?.analysisA || null,
            analysisB: analysis
        }));
    }, []);

    const swap = useCallback(() => {
        setComparison(prev => prev ? {
            analysisA: prev.analysisB,
            analysisB: prev.analysisA
        } : null);
    }, []);

    const clear = useCallback(() => {
        setComparison(null);
    }, []);

    const scoreDiff = comparison
        ? Math.abs((comparison.analysisA?.match_score || 0) - (comparison.analysisB?.match_score || 0))
        : 0;

    return {
        comparison,
        setAnalysisA,
        setAnalysisB,
        swap,
        clear,
        scoreDiff,
        isReady: !!(comparison?.analysisA && comparison?.analysisB)
    };
}
