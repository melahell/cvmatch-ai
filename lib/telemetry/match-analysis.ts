/**
 * OpenTelemetry Instrumentation for Match Analysis
 *
 * Provides distributed tracing, metrics, and performance monitoring
 * Compatible with Grafana, Prometheus, and Jaeger
 */

// Note: Install dependencies first:
// npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
// npm install @opentelemetry/exporter-prometheus @opentelemetry/exporter-trace-otlp-http

import { trace, metrics, Span, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('cvmatch-match-analysis', '1.0.0');
const meter = metrics.getMeter('cvmatch-match-analysis', '1.0.0');

// ===== METRICS =====

// Counters
export const matchAnalysisTotalCounter = meter.createCounter('match_analysis_total', {
    description: 'Total number of match analyses processed',
    unit: '1'
});

export const matchAnalysisErrorCounter = meter.createCounter('match_analysis_error_total', {
    description: 'Total number of failed match analyses',
    unit: '1'
});

export const salaryEstimateGeneratedCounter = meter.createCounter('salary_estimate_generated_total', {
    description: 'Total number of salary estimates generated',
    unit: '1'
});

export const coachingTipsGeneratedCounter = meter.createCounter('coaching_tips_generated_total', {
    description: 'Total number of coaching tips generated',
    unit: '1'
});

export const validationFailedCounter = meter.createCounter('match_analysis_validation_failed_total', {
    description: 'Total number of validation failures',
    unit: '1'
});

// Histograms
export const matchAnalysisDurationHistogram = meter.createHistogram('match_analysis_duration_ms', {
    description: 'Duration of match analysis in milliseconds',
    unit: 'ms'
});

export const matchScoreHistogram = meter.createHistogram('match_score', {
    description: 'Distribution of match scores',
    unit: '1'
});

export const matchAnalysisCostHistogram = meter.createHistogram('match_analysis_cost_usd', {
    description: 'Cost of match analysis in USD',
    unit: 'USD'
});

export const aiModelLatencyHistogram = meter.createHistogram('ai_model_latency_ms', {
    description: 'Latency of AI model calls',
    unit: 'ms'
});

// ===== TRACING HELPERS =====

export interface MatchAnalysisSpanAttributes {
    userId: string;
    source: 'url' | 'text' | 'file';
    jobTitle?: string;
    modelUsed?: string;
    hasEnrichment?: boolean;
    validationPassed?: boolean;
}

/**
 * Start a traced match analysis operation
 */
export function startMatchAnalysisTrace(attributes: MatchAnalysisSpanAttributes): Span {
    const span = tracer.startSpan('match_analysis', {
        attributes: {
            'user.id': attributes.userId,
            'analysis.source': attributes.source,
            'analysis.job_title': attributes.jobTitle || 'unknown',
        }
    });

    return span;
}

/**
 * Record a successful match analysis with full metrics
 */
export function recordMatchAnalysisSuccess(
    span: Span,
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
) {
    // Update span attributes
    span.setAttributes({
        'analysis.score': data.score,
        'analysis.model_used': data.modelUsed,
        'analysis.has_enrichment': data.hasEnrichment,
        'analysis.validation_passed': data.validationPassed,
        'analysis.duration_ms': data.durationMs,
        'analysis.cost_usd': data.costUsd || 0
    });

    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    // Record metrics
    matchAnalysisTotalCounter.add(1, {
        status: 'success',
        source: data.source,
        model: data.modelUsed,
        has_enrichment: data.hasEnrichment.toString(),
        validation_passed: data.validationPassed.toString()
    });

    matchAnalysisDurationHistogram.record(data.durationMs, {
        source: data.source,
        model: data.modelUsed
    });

    matchScoreHistogram.record(data.score, {
        source: data.source
    });

    if (data.costUsd) {
        matchAnalysisCostHistogram.record(data.costUsd, {
            model: data.modelUsed,
            has_enrichment: data.hasEnrichment.toString()
        });
    }

    if (data.hasEnrichment) {
        salaryEstimateGeneratedCounter.add(1, { model: data.modelUsed });
        coachingTipsGeneratedCounter.add(1, { model: data.modelUsed });
    }
}

/**
 * Record a failed match analysis
 */
export function recordMatchAnalysisError(
    span: Span,
    error: Error,
    phase: 'extraction' | 'analysis' | 'validation' | 'save',
    attributes: {
        userId: string;
        source: 'url' | 'text' | 'file';
        modelUsed?: string;
    }
) {
    span.setAttributes({
        'error.type': error.name,
        'error.message': error.message,
        'error.phase': phase
    });

    span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
    });

    span.recordException(error);
    span.end();

    // Record error metrics
    matchAnalysisTotalCounter.add(1, {
        status: 'error',
        source: attributes.source,
        phase,
        model: attributes.modelUsed || 'unknown'
    });

    matchAnalysisErrorCounter.add(1, {
        phase,
        source: attributes.source,
        error_type: error.name
    });
}

/**
 * Record a validation failure (warning level)
 */
export function recordValidationFailure(
    modelUsed: string,
    missingFields: string[]
) {
    validationFailedCounter.add(1, {
        model: modelUsed,
        missing_fields: missingFields.join(',')
    });
}

/**
 * Trace AI model call with latency
 */
export function traceAIModelCall<T>(
    modelName: string,
    operation: 'extraction' | 'analysis',
    fn: () => Promise<T>
): Promise<T> {
    const span = tracer.startSpan(`ai_model_call.${operation}`, {
        attributes: {
            'ai.model': modelName,
            'ai.operation': operation
        }
    });

    const startTime = Date.now();

    return fn()
        .then((result) => {
            const duration = Date.now() - startTime;

            span.setAttributes({
                'ai.latency_ms': duration
            });
            span.setStatus({ code: SpanStatusCode.OK });
            span.end();

            aiModelLatencyHistogram.record(duration, {
                model: modelName,
                operation
            });

            return result;
        })
        .catch((error) => {
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error.message
            });
            span.recordException(error);
            span.end();

            throw error;
        });
}

/**
 * Calculate estimated cost based on tokens
 * Gemini pricing (as of 2025): Flash = $0.075/$0.30 per 1M tokens (input/output)
 */
export function calculateAnalysisCost(
    inputTokens: number,
    outputTokens: number,
    model: string
): number {
    const pricing: Record<string, { input: number; output: number }> = {
        'gemini-1.5-flash': { input: 0.075 / 1_000_000, output: 0.30 / 1_000_000 },
        'gemini-1.5-pro': { input: 1.25 / 1_000_000, output: 5.00 / 1_000_000 },
        'gemini-2.0-flash-exp': { input: 0.075 / 1_000_000, output: 0.30 / 1_000_000 }
    };

    const modelPricing = pricing[model] || pricing['gemini-1.5-flash'];
    return (inputTokens * modelPricing.input) + (outputTokens * modelPricing.output);
}
