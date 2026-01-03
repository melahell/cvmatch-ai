interface StorageInfo {
    used: number;
    total: number;
    percentage: number;
    fileCount: number;
}

export async function getStorageInfo(userId: string): Promise<StorageInfo> {
    // Mock implementation - would need actual Supabase storage API
    return {
        used: 0,
        total: 100 * 1024 * 1024, // 100MB
        percentage: 0,
        fileCount: 0
    };
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function isStorageNearLimit(used: number, total: number, threshold: number = 0.8): boolean {
    return (used / total) >= threshold;
}
