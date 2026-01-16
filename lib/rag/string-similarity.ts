/**
 * String Similarity Functions
 * Simple Levenshtein-based similarity without external dependencies
 */

/**
 * Calculate Levenshtein distance between two strings
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Number of edits needed to transform str1 into str2
 */
function levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    // Create matrix
    const dp: number[][] = Array(m + 1)
        .fill(null)
        .map(() => Array(n + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill matrix
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // deletion
                    dp[i][j - 1],     // insertion
                    dp[i - 1][j - 1]  // substitution
                );
            }
        }
    }

    return dp[m][n];
}

/**
 * Calculate similarity ratio between two strings (0-1)
 * Higher = more similar
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity ratio between 0 (completely different) and 1 (identical)
 * 
 * @example
 * stringSimilarity("PMO", "PMO & Quality Manager") → ~0.3
 * stringSimilarity("Project Manager", "Project management") → ~0.75
 * stringSimilarity("Chef de Projet", "Chef de Projet") → 1.0
 */
export function stringSimilarity(str1: string | undefined, str2: string | undefined): number {
    if (!str1 || !str2) return 0;

    // Normalize strings
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) return 1;

    // Empty strings
    if (s1.length === 0 || s2.length === 0) return 0;

    // Calculate Levenshtein distance
    const distance = levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);

    // Convert distance to similarity ratio
    return 1 - (distance / maxLength);
}

/**
 * Check if two strings are similar enough (above threshold)
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @param threshold - Minimum similarity (default 0.75 = 75%)
 * @returns True if similarity >= threshold
 */
export function areStringsSimilar(
    str1: string | undefined,
    str2: string | undefined,
    threshold: number = 0.75
): boolean {
    return stringSimilarity(str1, str2) >= threshold;
}

/**
 * Calculate word-based similarity (Jaccard index)
 * Better for comparing job titles with different word order
 * 
 * @example
 * wordSimilarity("Quality Manager & PMO", "PMO & Quality Manager") → 1.0
 * wordSimilarity("Senior Developer", "Lead Developer") → 0.5
 */
export function wordSimilarity(str1: string | undefined, str2: string | undefined): number {
    if (!str1 || !str2) return 0;

    // Tokenize into words, remove common stop words
    const stopWords = new Set(["&", "et", "and", "de", "du", "des"]);

    const tokenize = (s: string): Set<string> => {
        const words = s
            .toLowerCase()
            .replace(/[^\w\sàâäéèêëïîôùûüç-]/g, " ")
            .split(/\s+/)
            .filter(w => w.length > 1 && !stopWords.has(w));
        return new Set(words);
    };

    const set1 = tokenize(str1);
    const set2 = tokenize(str2);

    if (set1.size === 0 || set2.size === 0) return 0;

    // Calculate Jaccard index: intersection / union
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
}

/**
 * Combined similarity score using both Levenshtein and word-based methods
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Combined similarity score (0-1)
 */
export function combinedSimilarity(str1: string | undefined, str2: string | undefined): number {
    const levenshtein = stringSimilarity(str1, str2);
    const jaccard = wordSimilarity(str1, str2);

    // Weighted average: 40% Levenshtein, 60% Jaccard (word order matters less for job titles)
    return 0.4 * levenshtein + 0.6 * jaccard;
}

export default stringSimilarity;
