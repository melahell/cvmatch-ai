export function calculateCacheTTL(dataType: 'analyses' | 'cvs' | 'profile'): number {
    const TTL_MS = {
        analyses: 5 * 60 * 1000, // 5 minutes
        cvs: 10 * 60 * 1000, // 10 minutes
        profile: 15 * 60 * 1000 // 15 minutes
    };
    return TTL_MS[dataType];
}

export function shouldInvalidateCache(lastFetch: number, ttl: number): boolean {
    return Date.now() - lastFetch > ttl;
}

export function createCacheKey(prefix: string, userId: string, params?: Record<string, any>): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${prefix}_${userId}_${paramsStr}`;
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export class SimpleCache<T> {
    private cache = new Map<string, CacheEntry<T>>();

    set(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    get(key: string, ttl: number): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (shouldInvalidateCache(entry.timestamp, ttl)) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    invalidate(key: string): void {
        this.cache.delete(key);
    }

    invalidateAll(): void {
        this.cache.clear();
    }
}
