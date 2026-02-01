/**
 * Retry Helper
 * 
 * [CDC Sprint 2.5] Pattern retry générique pour endpoints
 * 
 * Gère les retries avec backoff exponential/linear.
 */

import { logger } from "./logger";

// ============================================================================
// TYPES
// ============================================================================

export interface RetryOptions {
    /** Nombre max de tentatives (default: 3) */
    maxAttempts?: number;
    /** Délai initial en ms (default: 1000) */
    delayMs?: number;
    /** Type de backoff (default: 'exponential') */
    backoff?: "linear" | "exponential" | "none";
    /** Multiplicateur pour backoff exponential (default: 2) */
    multiplier?: number;
    /** Délai max en ms (default: 30000) */
    maxDelayMs?: number;
    /** Callback sur retry */
    onRetry?: (attempt: number, error: Error, nextDelayMs: number) => void;
    /** Erreurs à ne pas retry (ex: 401, 403) */
    noRetryErrors?: string[];
    /** Label pour les logs */
    label?: string;
}

export interface RetryResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    attempts: number;
    totalTimeMs: number;
}

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry' | 'label'>> & { onRetry?: RetryOptions['onRetry']; label?: string } = {
    maxAttempts: 3,
    delayMs: 1000,
    backoff: "exponential",
    multiplier: 2,
    maxDelayMs: 30000,
    noRetryErrors: ["RATE_LIMIT", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND"],
    onRetry: undefined,
    label: undefined,
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calcule le délai pour la prochaine tentative
 */
function calculateDelay(
    attempt: number,
    baseDelay: number,
    backoff: "linear" | "exponential" | "none",
    multiplier: number,
    maxDelay: number
): number {
    let delay: number;

    switch (backoff) {
        case "exponential":
            delay = baseDelay * Math.pow(multiplier, attempt - 1);
            break;
        case "linear":
            delay = baseDelay * attempt;
            break;
        case "none":
        default:
            delay = baseDelay;
    }

    // Ajouter un jitter aléatoire (±10%)
    const jitter = delay * 0.1 * (Math.random() * 2 - 1);
    delay = Math.round(delay + jitter);

    return Math.min(delay, maxDelay);
}

/**
 * Vérifie si une erreur doit déclencher un retry
 */
function shouldRetry(error: Error, noRetryErrors: string[]): boolean {
    const errorMessage = error.message.toUpperCase();
    const errorName = error.name.toUpperCase();

    // Vérifier si l'erreur est dans la liste des non-retry
    for (const noRetryError of noRetryErrors) {
        if (errorMessage.includes(noRetryError) || errorName.includes(noRetryError)) {
            return false;
        }
    }

    return true;
}

/**
 * Attend un délai en ms
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Exécute une fonction async avec retry automatique
 * 
 * @example
 * ```typescript
 * // Simple usage
 * const result = await withRetry(() => fetchData());
 * 
 * // With options
 * const result = await withRetry(
 *     () => callExternalAPI(),
 *     {
 *         maxAttempts: 5,
 *         delayMs: 2000,
 *         backoff: 'exponential',
 *         onRetry: (attempt, error) => console.log(`Retry ${attempt}: ${error.message}`)
 *     }
 * );
 * ```
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const {
        maxAttempts,
        delayMs,
        backoff,
        multiplier,
        maxDelayMs,
        noRetryErrors,
        onRetry,
        label,
    } = opts;

    const startTime = Date.now();
    let lastError: Error = new Error("Unknown error");

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const result = await fn();
            
            if (attempt > 1 && label) {
                logger.info(`[withRetry] ${label} succeeded on attempt ${attempt}`);
            }
            
            return result;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // Vérifier si on doit retry
            if (!shouldRetry(lastError, noRetryErrors)) {
                if (label) {
                    logger.warn(`[withRetry] ${label} - Non-retryable error`, { 
                        error: lastError.message 
                    });
                }
                throw lastError;
            }

            // Si c'est la dernière tentative, throw
            if (attempt >= maxAttempts) {
                if (label) {
                    logger.error(`[withRetry] ${label} - Max attempts reached`, {
                        attempts: attempt,
                        totalTimeMs: Date.now() - startTime,
                        error: lastError.message,
                    });
                }
                throw lastError;
            }

            // Calculer le délai
            const nextDelay = calculateDelay(attempt, delayMs, backoff, multiplier, maxDelayMs);

            // Callback onRetry
            if (onRetry) {
                onRetry(attempt, lastError, nextDelay);
            }

            // Log
            if (label) {
                logger.warn(`[withRetry] ${label} - Attempt ${attempt} failed, retrying in ${nextDelay}ms`, {
                    error: lastError.message,
                });
            }

            // Attendre avant le retry
            await sleep(nextDelay);
        }
    }

    // Ne devrait jamais arriver, mais TypeScript veut un return
    throw lastError;
}

/**
 * Version avec résultat détaillé (pas de throw)
 */
export async function withRetryResult<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
): Promise<RetryResult<T>> {
    const startTime = Date.now();

    try {
        const data = await withRetry(fn, options);
        return {
            success: true,
            data,
            attempts: 1, // approximation
            totalTimeMs: Date.now() - startTime,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
            attempts: options?.maxAttempts ?? DEFAULT_OPTIONS.maxAttempts,
            totalTimeMs: Date.now() - startTime,
        };
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { sleep, calculateDelay, shouldRetry };
