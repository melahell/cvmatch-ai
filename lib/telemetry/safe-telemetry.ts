/**
 * Safe Telemetry Wrapper
 *
 * This file safely loads OpenTelemetry functionality with graceful fallbacks.
 * If OpenTelemetry packages are not installed, it provides no-op functions.
 *
 * To enable telemetry:
 * 1. Install packages: npm install @opentelemetry/api @opentelemetry/sdk-node ...
 * 2. Set environment: OTEL_ENABLED=true
 * 3. Configure instrumentation (see OBSERVABILITY_SETUP.md)
 */

// Check if OpenTelemetry is available
let telemetryAvailable = false;
let otelModule: any = null;

try {
    // Try to load OpenTelemetry API
    otelModule = require('@opentelemetry/api');
    telemetryAvailable = true;
    console.log('✅ OpenTelemetry API loaded successfully');
} catch (error) {
    console.log('⚠️  OpenTelemetry not installed. Telemetry features disabled.');
    console.log('   To enable: npm install @opentelemetry/api @opentelemetry/sdk-node (see OBSERVABILITY_SETUP.md)');
}

// No-op span that does nothing
const noOpSpan = {
    setAttributes: () => {},
    setStatus: () => {},
    recordException: () => {},
    end: () => {},
};

// Export safe versions of telemetry functions
export function startMatchAnalysisTrace(attributes: {
    userId: string;
    source: 'url' | 'text' | 'file';
    jobTitle?: string;
}): any {
    if (!telemetryAvailable || !otelModule) {
        return noOpSpan;
    }

    try {
        // Load real implementation
        const realTelemetry = require('./match-analysis');
        return realTelemetry.startMatchAnalysisTrace(attributes);
    } catch (error) {
        console.warn('Failed to start telemetry trace:', error);
        return noOpSpan;
    }
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
    if (!telemetryAvailable || !span || span === noOpSpan) {
        return;
    }

    try {
        const realTelemetry = require('./match-analysis');
        realTelemetry.recordMatchAnalysisSuccess(span, data);
    } catch (error) {
        console.warn('Failed to record telemetry success:', error);
    }
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
    if (!telemetryAvailable || !span || span === noOpSpan) {
        return;
    }

    try {
        const realTelemetry = require('./match-analysis');
        realTelemetry.recordMatchAnalysisError(span, error, phase, attributes);
    } catch (error) {
        console.warn('Failed to record telemetry error:', error);
    }
}

export function recordValidationFailure(
    modelUsed: string,
    missingFields: string[]
): void {
    if (!telemetryAvailable) {
        return;
    }

    try {
        const realTelemetry = require('./match-analysis');
        realTelemetry.recordValidationFailure(modelUsed, missingFields);
    } catch (error) {
        console.warn('Failed to record validation failure:', error);
    }
}

export function traceAIModelCall<T>(
    modelName: string,
    operation: 'extraction' | 'analysis',
    fn: () => Promise<T>
): Promise<T> {
    if (!telemetryAvailable) {
        // Just execute the function without tracing
        return fn();
    }

    try {
        const realTelemetry = require('./match-analysis');
        return realTelemetry.traceAIModelCall(modelName, operation, fn);
    } catch (error) {
        console.warn('Failed to trace AI model call:', error);
        return fn();
    }
}

export function calculateAnalysisCost(
    inputTokens: number,
    outputTokens: number,
    model: string
): number {
    if (!telemetryAvailable) {
        // Fallback: basic cost calculation
        const GEMINI_FLASH_INPUT = 0.075 / 1_000_000;
        const GEMINI_FLASH_OUTPUT = 0.30 / 1_000_000;
        return (inputTokens * GEMINI_FLASH_INPUT) + (outputTokens * GEMINI_FLASH_OUTPUT);
    }

    try {
        const realTelemetry = require('./match-analysis');
        return realTelemetry.calculateAnalysisCost(inputTokens, outputTokens, model);
    } catch (error) {
        console.warn('Failed to calculate cost:', error);
        // Fallback calculation
        const GEMINI_FLASH_INPUT = 0.075 / 1_000_000;
        const GEMINI_FLASH_OUTPUT = 0.30 / 1_000_000;
        return (inputTokens * GEMINI_FLASH_INPUT) + (outputTokens * GEMINI_FLASH_OUTPUT);
    }
}

// Export availability flag
export const isTelemetryAvailable = telemetryAvailable;
