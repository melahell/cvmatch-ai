/**
 * Rate Limiting with Upstash Redis
 * 
 * Uses @upstash/ratelimit for distributed rate limiting on serverless.
 * Falls back to in-memory if Redis is not configured or unavailable.
 * 
 * [CDC-19] Migrated from in-memory Map to Upstash Redis
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ============================================================================
// TYPES
// ============================================================================

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

export type SubscriptionTier = "free" | "pro" | "team";

// ============================================================================
// REDIS CLIENT (Singleton)
// ============================================================================

let redis: Redis | null = null;
let rateLimiters: Map<string, Ratelimit> = new Map();

/**
 * Get or create Redis client
 */
function getRedisClient(): Redis | null {
    if (redis) return redis;
    
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
        console.warn("[rate-limit] Upstash Redis not configured, using in-memory fallback");
        return null;
    }
    
    try {
        redis = new Redis({ url, token });
        return redis;
    } catch (error) {
        console.error("[rate-limit] Failed to create Redis client:", error);
        return null;
    }
}

/**
 * Get or create rate limiter for specific config
 */
function getRateLimiter(config: RateLimitConfig): Ratelimit | null {
    const redisClient = getRedisClient();
    if (!redisClient) return null;
    
    // Create unique key for this config
    const configKey = `${config.maxRequests}:${config.windowMs}`;
    
    if (rateLimiters.has(configKey)) {
        return rateLimiters.get(configKey)!;
    }
    
    // Convert windowMs to seconds for Upstash
    const windowSeconds = Math.ceil(config.windowMs / 1000);
    
    // Use sliding window algorithm for more accurate limiting
    const limiter = new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(config.maxRequests, `${windowSeconds} s`),
        analytics: true, // Enable analytics in Upstash dashboard
        prefix: "cvcrush:ratelimit",
    });
    
    rateLimiters.set(configKey, limiter);
    return limiter;
}

// ============================================================================
// IN-MEMORY FALLBACK (when Redis is not available)
// ============================================================================

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of memoryStore.entries()) {
            if (entry.resetAt < now) {
                memoryStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

/**
 * In-memory rate limiting (fallback)
 */
function checkRateLimitMemory(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const key = `ratelimit:${identifier}`;

    let entry = memoryStore.get(key);

    // Create or reset entry if expired
    if (!entry || entry.resetAt < now) {
        entry = {
            count: 0,
            resetAt: now + config.windowMs
        };
        memoryStore.set(key, entry);
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

// ============================================================================
// MAIN RATE LIMIT FUNCTION
// ============================================================================

/**
 * Check if request is rate limited
 * Uses Upstash Redis if configured, falls back to in-memory
 */
export async function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const limiter = getRateLimiter(config);
    
    // Fallback to in-memory if Redis not available
    if (!limiter) {
        return checkRateLimitMemory(identifier, config);
    }
    
    try {
        const result = await limiter.limit(identifier);
        
        return {
            success: result.success,
            remaining: result.remaining,
            resetAt: result.reset,
            retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000)
        };
    } catch (error) {
        console.error("[rate-limit] Redis error, falling back to memory:", error);
        // Fail open: allow request if Redis is down
        return checkRateLimitMemory(identifier, config);
    }
}

// ============================================================================
// RATE LIMIT CONFIGURATIONS
// ============================================================================

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

export const RATE_LIMITS_BY_TIER: Record<SubscriptionTier, typeof RATE_LIMITS> = {
    free: {
        RAG_GENERATION: { maxRequests: 2, windowMs: 24 * 60 * 60 * 1000 },
        CV_GENERATION: { maxRequests: 3, windowMs: 24 * 60 * 60 * 1000 },
        JOB_SUGGESTIONS: { maxRequests: 5, windowMs: 24 * 60 * 60 * 1000 },
        MATCH_ANALYSIS: { maxRequests: 10, windowMs: 24 * 60 * 60 * 1000 }
    },
    pro: {
        RAG_GENERATION: { maxRequests: 10, windowMs: 24 * 60 * 60 * 1000 },
        CV_GENERATION: { maxRequests: 30, windowMs: 24 * 60 * 60 * 1000 },
        JOB_SUGGESTIONS: { maxRequests: 50, windowMs: 24 * 60 * 60 * 1000 },
        MATCH_ANALYSIS: { maxRequests: 100, windowMs: 24 * 60 * 60 * 1000 }
    },
    team: {
        RAG_GENERATION: { maxRequests: 50, windowMs: 24 * 60 * 60 * 1000 },
        CV_GENERATION: { maxRequests: 200, windowMs: 24 * 60 * 60 * 1000 },
        JOB_SUGGESTIONS: { maxRequests: 200, windowMs: 24 * 60 * 60 * 1000 },
        MATCH_ANALYSIS: { maxRequests: 1000, windowMs: 24 * 60 * 60 * 1000 }
    }
};

export function getRateLimitConfig(tier: SubscriptionTier, key: keyof typeof RATE_LIMITS) {
    return RATE_LIMITS_BY_TIER[tier]?.[key] ?? RATE_LIMITS_BY_TIER.free[key];
}

// ============================================================================
// ERROR RESPONSE HELPER
// ============================================================================

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
