/**
 * Structured Logging for Match Analysis
 *
 * Provides consistent, parseable logs for monitoring and debugging
 * Can be upgraded to pino/winston for production
 */

interface LogContext {
    userId: string;
    timestamp?: string;
    [key: string]: any;
}

export class MatchAnalysisLogger {
    private context: Partial<LogContext>;

    constructor(context: Partial<LogContext> = {}) {
        this.context = {
            ...context,
            timestamp: new Date().toISOString()
        };
    }

    private log(level: 'info' | 'warn' | 'error', event: string, data: Record<string, any> = {}) {
        const logEntry = {
            level,
            event,
            ...this.context,
            ...data,
            timestamp: new Date().toISOString()
        };

        // Format pour console (peut être remplacé par pino.info/error/warn)
        const message = `[${level.toUpperCase()}] ${event}`;
        const details = JSON.stringify(logEntry, null, 2);

        switch (level) {
            case 'error':
                console.error(message, details);
                break;
            case 'warn':
                console.warn(message, details);
                break;
            default:
                console.log(message, details);
        }
    }

    info(event: string, data?: Record<string, any>) {
        this.log('info', event, data);
    }

    warn(event: string, data?: Record<string, any>) {
        this.log('warn', event, data);
    }

    error(event: string, error: Error | string, data?: Record<string, any>) {
        const errorData = {
            ...data,
            error_message: error instanceof Error ? error.message : error,
            error_stack: error instanceof Error ? error.stack : undefined
        };
        this.log('error', event, errorData);
    }
}

// Helper functions for common logging scenarios

export function logMatchAnalysisStart(userId: string, jobTitle: string, source: 'url' | 'text' | 'file') {
    const logger = new MatchAnalysisLogger({ userId });
    logger.info('match_analysis_start', {
        job_title: jobTitle,
        source
    });
}

export function logMatchAnalysisSuccess(
    userId: string,
    analysisId: string,
    data: {
        score: number;
        jobTitle: string;
        hasEnrichment: boolean;
        validationPassed: boolean;
        durationMs: number;
        modelUsed: string;
    }
) {
    const logger = new MatchAnalysisLogger({ userId });
    logger.info('match_analysis_success', {
        analysis_id: analysisId,
        match_score: data.score,
        job_title: data.jobTitle,
        has_enrichment: data.hasEnrichment,
        validation_passed: data.validationPassed,
        duration_ms: data.durationMs,
        model_used: data.modelUsed
    });
}

export function logMatchAnalysisValidationFailed(
    userId: string,
    error: string,
    rawDataSample: string,
    modelUsed: string
) {
    const logger = new MatchAnalysisLogger({ userId });
    logger.warn('match_analysis_validation_failed', {
        validation_error: error,
        raw_data_sample: rawDataSample,
        model_used: modelUsed
    });
}

export function logMatchAnalysisError(
    userId: string,
    error: Error,
    phase: 'extraction' | 'analysis' | 'validation' | 'save',
    context?: Record<string, any>
) {
    const logger = new MatchAnalysisLogger({ userId });
    logger.error(`match_analysis_error_${phase}`, error, context);
}

export function logMatchAnalysisRetry(
    userId: string,
    attempt: number,
    reason: string
) {
    const logger = new MatchAnalysisLogger({ userId });
    logger.warn('match_analysis_retry', {
        attempt,
        reason
    });
}

export function logEnrichmentMissing(
    userId: string,
    analysisId: string,
    missingFields: string[]
) {
    const logger = new MatchAnalysisLogger({ userId });
    logger.warn('match_analysis_enrichment_missing', {
        analysis_id: analysisId,
        missing_fields: missingFields
    });
}
