/**
 * Simple in-memory rate limiter
 *
 * For production, use @upstash/ratelimit with Redis
 * This is a basic implementation for immediate protection
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
}

/**
 * Check if request is rate limited
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const key = `ratelimit:${identifier}`;

    let entry = rateLimitStore.get(key);

    // Create or reset entry if expired
    if (!entry || entry.resetAt < now) {
        entry = {
            count: 0,
            resetAt: now + config.windowMs
        };
        rateLimitStore.set(key, entry);
    }

    // Increment count
    entry.count++;

    // Check if over limit
    if (entry.count > config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetAt: entry.resetAt,
            retryAfter: Math.ceil((entry.resetAt - now) / 1000)
        };
    }

    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetAt: entry.resetAt
    };
}

/**
 * Rate limit configurations per endpoint
 */
export const RATE_LIMITS = {
    // RAG generation: 5 per hour per user
    RAG_GENERATION: {
        maxRequests: 5,
        windowMs: 60 * 60 * 1000 // 1 hour
    },
    // CV generation: 20 per hour per user
    CV_GENERATION: {
        maxRequests: 20,
        windowMs: 60 * 60 * 1000 // 1 hour
    },
    // Job suggestions: 10 per hour per user
    JOB_SUGGESTIONS: {
        maxRequests: 10,
        windowMs: 60 * 60 * 1000 // 1 hour
    },
    // Match analysis: 30 per hour per user
    MATCH_ANALYSIS: {
        maxRequests: 30,
        windowMs: 60 * 60 * 1000 // 1 hour
    }
};

/**
 * Create rate limit error response
 */
export function createRateLimitError(result: RateLimitResult) {
    return {
        error: 'Rate limit exceeded',
        errorCode: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
        resetAt: new Date(result.resetAt).toISOString()
    };
}
