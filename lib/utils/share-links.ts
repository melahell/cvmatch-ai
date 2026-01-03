export async function generateShareLink(analysisId: string, options?: {
    expiresIn?: number; // minutes
    password?: string;
}): Promise<{ url: string; token: string }> {
    const token = Math.random().toString(36).substring(2, 15);
    const expiresAt = options?.expiresIn
        ? Date.now() + (options.expiresIn * 60 * 1000)
        : undefined;

    // Store in database (mock)
    const shareData = {
        analysisId,
        token,
        expiresAt,
        password: options?.password,
        createdAt: Date.now()
    };

    // In real implementation: await supabase.from('analysis_shares').insert(shareData)

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/shared/analysis/${token}`;

    return { url, token };
}

export async function validateShareToken(token: string, password?: string): Promise<{
    valid: boolean;
    analysis?: any;
    error?: string;
}> {
    // Mock implementation
    // In real: fetch from database, check expiry, validate password
    return {
        valid: true,
        analysis: { id: 'mock' }
    };
}

export function copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }

    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return Promise.resolve();
}
