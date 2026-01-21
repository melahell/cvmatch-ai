/**
 * Rate Limiting for Match Analysis API
 *
 * Implements sliding window rate limiting using Upstash Redis
 * Prevents abuse and controls API costs
 */

// Install: npm install @upstash/redis @upstash/ratelimit

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configuration
const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED === 'true';
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Rate limit configurations by tier
export const RATE_LIMITS = {
    // Free tier: 10 analyses per day
    free: {
        requests: 10,
        window: '24 h',
    },
    // Pro tier: 100 analyses per day
    pro: {
        requests: 100,
        window: '24 h',
    },
    // Enterprise: 1000 analyses per day
    enterprise: {
        requests: 1000,
        window: '24 h',
    },
    // Anonymous (by IP): 3 analyses per day
    anonymous: {
        requests: 3,
        window: '24 h',
    },
};

// Initialize Redis client
let redis: Redis | null = null;
let rateLimiters: Record<string, Ratelimit> | null = null;

if (RATE_LIMIT_ENABLED && UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: UPSTASH_REDIS_REST_URL,
        token: UPSTASH_REDIS_REST_TOKEN,
    });

    // Create rate limiters for each tier
    rateLimiters = {
        free: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(
                RATE_LIMITS.free.requests,
                RATE_LIMITS.free.window
            ),
            analytics: true,
            prefix: 'cvmatch:ratelimit:match-analysis:free',
        }),
        pro: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(
                RATE_LIMITS.pro.requests,
                RATE_LIMITS.pro.window
            ),
            analytics: true,
            prefix: 'cvmatch:ratelimit:match-analysis:pro',
        }),
        enterprise: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(
                RATE_LIMITS.enterprise.requests,
                RATE_LIMITS.enterprise.window
            ),
            analytics: true,
            prefix: 'cvmatch:ratelimit:match-analysis:enterprise',
        }),
        anonymous: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(
                RATE_LIMITS.anonymous.requests,
                RATE_LIMITS.anonymous.window
            ),
            analytics: true,
            prefix: 'cvmatch:ratelimit:match-analysis:anonymous',
        }),
    };

    console.log('✅ Rate limiting initialized with Upstash Redis');
} else {
    console.log('⚠️  Rate limiting disabled (set RATE_LIMIT_ENABLED=true and provide Redis credentials)');
}

/**
 * Check if user is within rate limit
 */
export async function checkRateLimit(
    userId: string,
    userTier: 'free' | 'pro' | 'enterprise' = 'free'
): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
}> {
    // If rate limiting disabled, allow all requests
    if (!RATE_LIMIT_ENABLED || !rateLimiters) {
        return {
            success: true,
            limit: Infinity,
            remaining: Infinity,
            reset: 0,
        };
    }

    const limiter = rateLimiters[userTier];
    if (!limiter) {
        console.error(`Unknown user tier: ${userTier}`);
        return {
            success: true,
            limit: Infinity,
            remaining: Infinity,
            reset: 0,
        };
    }

    try {
        const { success, limit, remaining, reset } = await limiter.limit(userId);

        return {
            success,
            limit,
            remaining,
            reset,
            retryAfter: success ? undefined : Math.ceil((reset - Date.now()) / 1000),
        };
    } catch (error) {
        console.error('Rate limit check failed:', error);
        // On error, allow request (fail open)
        return {
            success: true,
            limit: Infinity,
            remaining: Infinity,
            reset: 0,
        };
    }
}

/**
 * Check rate limit by IP address (for anonymous users)
 */
export async function checkRateLimitByIP(
    ipAddress: string
): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
}> {
    if (!RATE_LIMIT_ENABLED || !rateLimiters) {
        return {
            success: true,
            limit: Infinity,
            remaining: Infinity,
            reset: 0,
        };
    }

    const limiter = rateLimiters.anonymous;

    try {
        const { success, limit, remaining, reset } = await limiter.limit(ipAddress);

        return {
            success,
            limit,
            remaining,
            reset,
            retryAfter: success ? undefined : Math.ceil((reset - Date.now()) / 1000),
        };
    } catch (error) {
        console.error('IP rate limit check failed:', error);
        return {
            success: true,
            limit: Infinity,
            remaining: Infinity,
            reset: 0,
        };
    }
}

/**
 * Get user's current rate limit status (without consuming a token)
 */
export async function getRateLimitStatus(
    userId: string,
    userTier: 'free' | 'pro' | 'enterprise' = 'free'
): Promise<{
    limit: number;
    remaining: number;
    reset: number;
}> {
    if (!RATE_LIMIT_ENABLED || !redis) {
        return {
            limit: Infinity,
            remaining: Infinity,
            reset: 0,
        };
    }

    try {
        const key = `cvmatch:ratelimit:match-analysis:${userTier}:${userId}`;
        const count = await redis.get<number>(key) || 0;
        const ttl = await redis.ttl(key);

        const config = RATE_LIMITS[userTier];

        return {
            limit: config.requests,
            remaining: Math.max(0, config.requests - count),
            reset: Date.now() + (ttl * 1000),
        };
    } catch (error) {
        console.error('Get rate limit status failed:', error);
        return {
            limit: Infinity,
            remaining: Infinity,
            reset: 0,
        };
    }
}

/**
 * Middleware for Next.js API routes
 */
export async function withRateLimit<T>(
    handler: (userId: string, userTier: string) => Promise<T>,
    userId: string,
    userTier: 'free' | 'pro' | 'enterprise' = 'free'
): Promise<
    | { success: true; data: T }
    | { success: false; error: string; retryAfter: number; limit: number; remaining: number }
> {
    const rateLimitResult = await checkRateLimit(userId, userTier);

    if (!rateLimitResult.success) {
        return {
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: rateLimitResult.retryAfter || 0,
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
        };
    }

    const data = await handler(userId, userTier);

    return {
        success: true,
        data,
    };
}
