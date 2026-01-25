/**
 * Intelligent Rate Limiter - Gestion intelligente des limites de requêtes
 *
 * [AMÉLIORATION P3-12] : Rate limiting sophistiqué avec :
 * - Queue prioritaire (premium > free)
 * - Retry intelligent avec circuit breaker
 * - Fallback vers modèle plus rapide si surcharge
 * - Adaptive throttling
 */

import { logger } from "@/lib/utils/logger";

// ============================================================================
// TYPES
// ============================================================================

export type UserTier = "free" | "starter" | "pro" | "enterprise";
export type ResourceType = "cv_generation" | "rag_extraction" | "match_analysis" | "pdf_export";

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
    burstLimit?: number;
    priority: number;
}

export interface QueuedRequest {
    id: string;
    userId: string;
    tier: UserTier;
    resourceType: ResourceType;
    priority: number;
    createdAt: number;
    execute: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
}

export interface CircuitBreakerState {
    failures: number;
    lastFailure: number;
    state: "closed" | "open" | "half-open";
    nextRetry: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
    queuePosition?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const TIER_CONFIGS: Record<UserTier, Record<ResourceType, RateLimitConfig>> = {
    free: {
        cv_generation: { maxRequests: 3, windowMs: 3600000, priority: 1 }, // 3/heure
        rag_extraction: { maxRequests: 5, windowMs: 86400000, priority: 1 }, // 5/jour
        match_analysis: { maxRequests: 10, windowMs: 3600000, priority: 1 }, // 10/heure
        pdf_export: { maxRequests: 5, windowMs: 3600000, priority: 1 }, // 5/heure
    },
    starter: {
        cv_generation: { maxRequests: 20, windowMs: 3600000, priority: 2 },
        rag_extraction: { maxRequests: 20, windowMs: 86400000, priority: 2 },
        match_analysis: { maxRequests: 50, windowMs: 3600000, priority: 2 },
        pdf_export: { maxRequests: 20, windowMs: 3600000, priority: 2 },
    },
    pro: {
        cv_generation: { maxRequests: 100, windowMs: 3600000, burstLimit: 10, priority: 3 },
        rag_extraction: { maxRequests: 100, windowMs: 86400000, priority: 3 },
        match_analysis: { maxRequests: 200, windowMs: 3600000, priority: 3 },
        pdf_export: { maxRequests: 100, windowMs: 3600000, priority: 3 },
    },
    enterprise: {
        cv_generation: { maxRequests: 1000, windowMs: 3600000, burstLimit: 50, priority: 4 },
        rag_extraction: { maxRequests: 1000, windowMs: 86400000, priority: 4 },
        match_analysis: { maxRequests: 5000, windowMs: 3600000, priority: 4 },
        pdf_export: { maxRequests: 1000, windowMs: 3600000, priority: 4 },
    },
};

const CIRCUIT_BREAKER_CONFIG = {
    failureThreshold: 5,
    resetTimeout: 30000, // 30 secondes
    halfOpenMaxRequests: 3,
};

const RETRY_CONFIG = {
    maxRetries: 4,
    baseDelayMs: 2000,
    maxDelayMs: 16000,
    backoffMultiplier: 2,
};

// ============================================================================
// IN-MEMORY STORES
// ============================================================================

class TokenBucket {
    private tokens: Map<string, { count: number; resetAt: number }> = new Map();

    consume(key: string, config: RateLimitConfig): RateLimitResult {
        const now = Date.now();
        let bucket = this.tokens.get(key);

        // Créer ou réinitialiser le bucket si expiré
        if (!bucket || bucket.resetAt <= now) {
            bucket = { count: 0, resetAt: now + config.windowMs };
            this.tokens.set(key, bucket);
        }

        // Vérifier la limite
        if (bucket.count >= config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetAt: bucket.resetAt,
                retryAfter: bucket.resetAt - now,
            };
        }

        // Consommer un token
        bucket.count++;
        this.tokens.set(key, bucket);

        return {
            allowed: true,
            remaining: config.maxRequests - bucket.count,
            resetAt: bucket.resetAt,
        };
    }

    getRemaining(key: string, config: RateLimitConfig): number {
        const bucket = this.tokens.get(key);
        if (!bucket || bucket.resetAt <= Date.now()) {
            return config.maxRequests;
        }
        return Math.max(0, config.maxRequests - bucket.count);
    }

    // Nettoyage périodique
    cleanup(): void {
        const now = Date.now();
        for (const [key, bucket] of this.tokens.entries()) {
            if (bucket.resetAt <= now) {
                this.tokens.delete(key);
            }
        }
    }
}

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

class CircuitBreaker {
    private states: Map<string, CircuitBreakerState> = new Map();

    getState(service: string): CircuitBreakerState {
        let state = this.states.get(service);
        if (!state) {
            state = {
                failures: 0,
                lastFailure: 0,
                state: "closed",
                nextRetry: 0,
            };
            this.states.set(service, state);
        }
        return state;
    }

    recordSuccess(service: string): void {
        const state = this.getState(service);
        state.failures = 0;
        state.state = "closed";
        this.states.set(service, state);
    }

    recordFailure(service: string): void {
        const state = this.getState(service);
        state.failures++;
        state.lastFailure = Date.now();

        if (state.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
            state.state = "open";
            state.nextRetry = Date.now() + CIRCUIT_BREAKER_CONFIG.resetTimeout;
            logger.warn("[circuit-breaker] Circuit ouvert", { service, failures: state.failures });
        }

        this.states.set(service, state);
    }

    canRequest(service: string): boolean {
        const state = this.getState(service);

        if (state.state === "closed") {
            return true;
        }

        if (state.state === "open") {
            if (Date.now() >= state.nextRetry) {
                state.state = "half-open";
                this.states.set(service, state);
                logger.info("[circuit-breaker] Circuit half-open", { service });
                return true;
            }
            return false;
        }

        // half-open
        return true;
    }

    isOpen(service: string): boolean {
        const state = this.getState(service);
        return state.state === "open" && Date.now() < state.nextRetry;
    }
}

// ============================================================================
// PRIORITY QUEUE
// ============================================================================

class PriorityQueue {
    private queue: QueuedRequest[] = [];
    private processing = false;
    private concurrency = 5;
    private activeRequests = 0;

    async enqueue(request: Omit<QueuedRequest, "id" | "createdAt" | "resolve" | "reject">): Promise<any> {
        return new Promise((resolve, reject) => {
            const queuedRequest: QueuedRequest = {
                ...request,
                id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                createdAt: Date.now(),
                resolve,
                reject,
            };

            // Insérer en respectant la priorité
            let inserted = false;
            for (let i = 0; i < this.queue.length; i++) {
                if (request.priority > this.queue[i].priority) {
                    this.queue.splice(i, 0, queuedRequest);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                this.queue.push(queuedRequest);
            }

            logger.debug("[queue] Requête ajoutée", {
                id: queuedRequest.id,
                priority: request.priority,
                position: this.queue.indexOf(queuedRequest),
                queueLength: this.queue.length,
            });

            this.process();
        });
    }

    getPosition(requestId: string): number {
        return this.queue.findIndex(r => r.id === requestId);
    }

    getQueueLength(): number {
        return this.queue.length;
    }

    private async process(): Promise<void> {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.length > 0 && this.activeRequests < this.concurrency) {
            const request = this.queue.shift();
            if (!request) continue;

            this.activeRequests++;

            // Exécuter la requête
            request.execute()
                .then(result => {
                    request.resolve(result);
                })
                .catch(error => {
                    request.reject(error);
                })
                .finally(() => {
                    this.activeRequests--;
                    this.process();
                });
        }

        this.processing = false;
    }
}

// ============================================================================
// INTELLIGENT RATE LIMITER
// ============================================================================

export class IntelligentRateLimiter {
    private tokenBucket = new TokenBucket();
    private circuitBreaker = new CircuitBreaker();
    private priorityQueue = new PriorityQueue();
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Nettoyage périodique toutes les 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.tokenBucket.cleanup();
        }, 300000);
    }

    /**
     * Vérifie si une requête peut être exécutée
     */
    checkLimit(
        userId: string,
        tier: UserTier,
        resourceType: ResourceType
    ): RateLimitResult {
        const config = TIER_CONFIGS[tier][resourceType];
        const key = `${userId}:${resourceType}`;

        return this.tokenBucket.consume(key, config);
    }

    /**
     * Exécute une requête avec retry intelligent
     */
    async executeWithRetry<T>(
        fn: () => Promise<T>,
        options: {
            userId: string;
            tier: UserTier;
            resourceType: ResourceType;
            serviceName?: string;
            onFallback?: () => Promise<T>;
        }
    ): Promise<T> {
        const { userId, tier, resourceType, serviceName = "default", onFallback } = options;

        // Vérifier le circuit breaker
        if (this.circuitBreaker.isOpen(serviceName)) {
            logger.warn("[rate-limiter] Circuit ouvert, utilisation fallback", { serviceName });
            if (onFallback) {
                return onFallback();
            }
            throw new Error(`Service ${serviceName} temporairement indisponible`);
        }

        // Vérifier la limite de taux
        const limitResult = this.checkLimit(userId, tier, resourceType);
        if (!limitResult.allowed) {
            throw new RateLimitError(
                `Rate limit dépassée pour ${resourceType}`,
                limitResult.retryAfter || 0,
                limitResult.remaining,
                limitResult.resetAt
            );
        }

        // Exécuter avec retry
        let lastError: Error | null = null;
        for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
            try {
                const result = await fn();
                this.circuitBreaker.recordSuccess(serviceName);
                return result;
            } catch (error: any) {
                lastError = error;

                // Si c'est une erreur de rate limit API, attendre
                if (error.status === 429 || error.message?.includes("rate limit")) {
                    this.circuitBreaker.recordFailure(serviceName);

                    if (attempt < RETRY_CONFIG.maxRetries) {
                        const delay = Math.min(
                            RETRY_CONFIG.baseDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
                            RETRY_CONFIG.maxDelayMs
                        );
                        logger.info("[rate-limiter] Retry après rate limit", {
                            attempt: attempt + 1,
                            delay,
                            serviceName,
                        });
                        await this.sleep(delay);
                        continue;
                    }
                }

                // Autres erreurs
                this.circuitBreaker.recordFailure(serviceName);

                if (attempt < RETRY_CONFIG.maxRetries && this.isRetryableError(error)) {
                    const delay = Math.min(
                        RETRY_CONFIG.baseDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
                        RETRY_CONFIG.maxDelayMs
                    );
                    logger.info("[rate-limiter] Retry après erreur", {
                        attempt: attempt + 1,
                        delay,
                        error: error.message,
                    });
                    await this.sleep(delay);
                    continue;
                }

                throw error;
            }
        }

        // Épuisé les retries, essayer le fallback
        if (onFallback) {
            logger.warn("[rate-limiter] Retries épuisés, utilisation fallback", { serviceName });
            return onFallback();
        }

        throw lastError || new Error("Retries épuisés");
    }

    /**
     * Ajoute une requête à la queue prioritaire
     */
    async queueRequest<T>(
        fn: () => Promise<T>,
        options: {
            userId: string;
            tier: UserTier;
            resourceType: ResourceType;
        }
    ): Promise<T> {
        const config = TIER_CONFIGS[options.tier][options.resourceType];

        return this.priorityQueue.enqueue({
            userId: options.userId,
            tier: options.tier,
            resourceType: options.resourceType,
            priority: config.priority,
            execute: fn,
        });
    }

    /**
     * Obtient les statistiques de limite
     */
    getStats(userId: string, tier: UserTier): Record<ResourceType, { remaining: number; resetAt: number }> {
        const stats: any = {};

        for (const resourceType of Object.keys(TIER_CONFIGS[tier]) as ResourceType[]) {
            const config = TIER_CONFIGS[tier][resourceType];
            const key = `${userId}:${resourceType}`;
            const remaining = this.tokenBucket.getRemaining(key, config);

            stats[resourceType] = {
                remaining,
                max: config.maxRequests,
                windowMs: config.windowMs,
            };
        }

        return stats;
    }

    private isRetryableError(error: any): boolean {
        // Erreurs réseau ou serveur
        if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") return true;
        if (error.status >= 500 && error.status < 600) return true;
        if (error.status === 429) return true;
        return false;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}

// ============================================================================
// CUSTOM ERROR
// ============================================================================

export class RateLimitError extends Error {
    constructor(
        message: string,
        public retryAfter: number,
        public remaining: number,
        public resetAt: number
    ) {
        super(message);
        this.name = "RateLimitError";
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const rateLimiter = new IntelligentRateLimiter();
