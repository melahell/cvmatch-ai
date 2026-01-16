/**
 * Structured Logger for CV Crush
 * Production-ready with JSON structured logging
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, any>;

/**
 * Structured logger with JSON output for production monitoring
 */
class Logger {
    private formatLog(level: LogLevel, message: string, context?: LogContext) {
        const timestamp = new Date().toISOString();

        if (isDev) {
            // Human-readable format for development
            const contextStr = context ? ` ${JSON.stringify(context, null, 2)}` : '';
            return `[${level.toUpperCase()}] ${timestamp} ${message}${contextStr}`;
        } else {
            // Structured JSON for production (easier to parse by log aggregators)
            return JSON.stringify({
                timestamp,
                level: level.toUpperCase(),
                message,
                ...context
            });
        }
    }

    debug(message: string, context?: any) {
        if (isDev) {
            console.log(this.formatLog('debug', message, context));
        }
    }

    info(message: string, context?: any) {
        console.log(this.formatLog('info', message, context));
    }

    warn(message: string, context?: any) {
        console.warn(this.formatLog('warn', message, context));
    }

    error(message: string, context?: any) {
        console.error(this.formatLog('error', message, context));
    }

    /**
     * Track API request/response metrics
     */
    apiMetric(endpoint: string, method: string, statusCode: number, durationMs: number, context?: LogContext) {
        this.info('API Metric', {
            endpoint,
            method,
            statusCode,
            durationMs,
            ...context
        });
    }

    /**
     * Track business metrics (RAG generated, CV generated, etc.)
     */
    businessMetric(metric: string, value: number, context?: LogContext) {
        this.info('Business Metric', {
            metric,
            value,
            ...context
        });
    }

    /**
     * Success logging (backwards compatibility for frontend)
     */
    success(message: string, context?: any) {
        if (isDev) {
            console.log(`[✓ SUCCESS] ${message}`, context || '');
        }
    }
}

export const logger = new Logger();

/**
 * Higher-order function to wrap API handlers with automatic logging
 */
export function withMetrics<T extends (...args: any[]) => Promise<Response>>(
    handler: T,
    routeName: string
): T {
    return (async (...args: any[]) => {
        const startTime = Date.now();
        const request = args[0] as Request;

        try {
            const response = await handler(...args);
            const duration = Date.now() - startTime;

            logger.apiMetric(routeName, request.method, response.status, duration);

            return response;
        } catch (error: any) {
            const duration = Date.now() - startTime;

            logger.error('API Handler Error', {
                endpoint: routeName,
                method: request.method,
                durationMs: duration,
                error: error.message
            });

            throw error;
        }
    }) as T;
}
