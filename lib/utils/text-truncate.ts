/**
 * Text Truncation Utility
 *
 * Prevents sending excessive text to Gemini API
 * Gemini limits: 1M tokens for Pro, but we want to stay conservative
 */

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 chars in English/French)
 * For accurate token counting, use tiktoken library
 */
export function estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
}

/**
 * Truncate text to maximum token count
 * Tries to truncate at sentence boundaries for better results
 */
export function truncateToTokens(text: string, maxTokens: number): {
    truncated: string;
    originalTokens: number;
    finalTokens: number;
    wasTruncated: boolean;
} {
    const originalTokens = estimateTokenCount(text);

    if (originalTokens <= maxTokens) {
        return {
            truncated: text,
            originalTokens,
            finalTokens: originalTokens,
            wasTruncated: false
        };
    }

    // Calculate target character count
    const targetChars = maxTokens * 4;

    // Try to truncate at sentence boundary
    const truncatedAtSentence = text.substring(0, targetChars);
    const lastPeriod = truncatedAtSentence.lastIndexOf('.');
    const lastNewline = truncatedAtSentence.lastIndexOf('\n');

    const breakPoint = Math.max(lastPeriod, lastNewline);

    let truncated: string;
    if (breakPoint > targetChars * 0.8) {
        // If we found a good break point (within 80% of target)
        truncated = text.substring(0, breakPoint + 1);
    } else {
        // Otherwise, hard truncate
        truncated = text.substring(0, targetChars);
    }

    const finalTokens = estimateTokenCount(truncated);

    return {
        truncated,
        originalTokens,
        finalTokens,
        wasTruncated: true
    };
}

/**
 * Truncate text for RAG extraction (50k tokens max)
 * This leaves plenty of room for the prompt itself
 */
export function truncateForRAGExtraction(text: string): {
    text: string;
    stats: {
        originalTokens: number;
        finalTokens: number;
        wasTruncated: boolean;
        truncatedPercentage?: number;
    };
} {
    const MAX_TOKENS = 50000; // Conservative limit

    const base = truncateToTokens(text, MAX_TOKENS);
    const truncatedText = base.wasTruncated ? smartTruncate(text, MAX_TOKENS, { beginning: 65, end: 35 }) : base.truncated;
    const finalTokens = estimateTokenCount(truncatedText);

    return {
        text: truncatedText,
        stats: {
            originalTokens: base.originalTokens,
            finalTokens,
            wasTruncated: base.wasTruncated,
            truncatedPercentage: base.wasTruncated
                ? Math.round(((base.originalTokens - finalTokens) / base.originalTokens) * 100)
                : undefined
        }
    };
}

/**
 * Smart truncation that prioritizes important sections
 * Keeps beginning and end, removes middle if needed
 */
export function smartTruncate(text: string, maxTokens: number, keepSections: {
    beginning: number; // percentage to keep from beginning
    end: number;       // percentage to keep from end
} = { beginning: 60, end: 40 }): string {
    const result = truncateToTokens(text, maxTokens);

    if (!result.wasTruncated) {
        return text;
    }

    // Calculate split points
    const targetChars = maxTokens * 4;
    const beginningChars = Math.floor(targetChars * (keepSections.beginning / 100));
    const endChars = Math.floor(targetChars * (keepSections.end / 100));

    const beginning = text.substring(0, beginningChars);
    const end = text.substring(text.length - endChars);

    return `${beginning}\n\n[... CONTENU TRONQUÉ ...]\n\n${end}`;
}
