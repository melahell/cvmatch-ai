export function generateRecentURLsKey(userId: string): string {
    return `recent_urls_${userId}`;
}

export function saveRecentURL(userId: string, url: string, maxRecent: number = 10): void {
    const key = generateRecentURLsKey(userId);
    const recent = getRecentURLs(userId);

    // Remove if exists, add to front
    const filtered = recent.filter(u => u !== url);
    filtered.unshift(url);

    // Keep only max
    filtered.splice(maxRecent);

    localStorage.setItem(key, JSON.stringify(filtered));
}

export function getRecentURLs(userId: string): string[] {
    const key = generateRecentURLsKey(userId);
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function clearRecentURLs(userId: string): void {
    const key = generateRecentURLsKey(userId);
    localStorage.removeItem(key);
}
