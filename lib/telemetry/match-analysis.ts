/**
 * Match Analysis Telemetry (Optional)
 *
 * This file provides OpenTelemetry instrumentation for match analysis operations.
 * It's loaded conditionally by safe-telemetry.ts when OpenTelemetry is available.
 */

// No-op implementations (telemetry disabled by default)
const noOpSpan = {
    setAttributes: () => {},
    setStatus: () => {},
    recordException: () => {},
    end: () => {},
};

export function startMatchAnalysisTrace(attributes: {
    userId: string;
    source: 'url' | 'text' | 'file';
    jobTitle?: string;
}): any {
    return noOpSpan;
}

export function recordMatchAnalysisSuccess(
    span: any,
    data: {
        userId: string;
        source: 'url' | 'text' | 'file';
        score: number;
        modelUsed: string;
        hasEnrichment: boolean;
        validationPassed: boolean;
        durationMs: number;
        costUsd?: number;
    }
): void {
    // No-op: telemetry disabled
}

export function recordMatchAnalysisError(
    span: any,
    error: Error,
    phase: 'extraction' | 'analysis' | 'validation' | 'save',
    attributes: {
        userId: string;
        source: 'url' | 'text' | 'file';
        modelUsed?: string;
    }
): void {
    // No-op: telemetry disabled
}

export function recordValidationFailure(
    modelUsed: string,
    missingFields: string[]
): void {
    // No-op: telemetry disabled
}

export function traceAIModelCall<T>(
    modelName: string,
    operation: 'extraction' | 'analysis',
    fn: () => Promise<T>
): Promise<T> {
    // Just execute without tracing
    return fn();
}

export function calculateAnalysisCost(
    inputTokens: number,
    outputTokens: number,
    model: string
): number {
    // Fallback cost calculation (Gemini Flash pricing)
    const GEMINI_FLASH_INPUT = 0.075 / 1_000_000;
    const GEMINI_FLASH_OUTPUT = 0.30 / 1_000_000;
    return (inputTokens * GEMINI_FLASH_INPUT) + (outputTokens * GEMINI_FLASH_OUTPUT);
}
