/**
 * [CDC-24] Utilitaire centralisé pour la sanitisation du texte
 * Évite la duplication dans chaque template
 */

/**
 * Sanitize text by fixing spacing issues (applied at render time)
 * Corrige les problèmes de concaténation de mots courants en français
 */
export function sanitizeText(text: unknown): string {
    if (text === null || text === undefined) return "";
    if (typeof text !== "string") return "";
    const input = text;
    if (!input) return "";

    return input
        .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
        .replace(/\betde\b/gi, 'et de')
        .replace(/\betla\b/gi, 'et la')
        .replace(/\betles\b/gi, 'et les')
        .replace(/\bdela\b/gi, 'de la')
        .replace(/\bdeles\b/gi, 'de les')
        .replace(/\bàla\b/gi, 'à la')
        .replace(/\benplace\b/gi, 'en place')
        .replace(/\bpourla\b/gi, 'pour la')
        .replace(/\bsurle\b/gi, 'sur le')
        .replace(/\bavecle\b/gi, 'avec le')
        .replace(/\bdansle\b/gi, 'dans le')
        // Fix lowercase + uppercase (camelCase)
        .replace(/([a-zàâäéèêëïîôùûüçœæ])([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇŒÆ])/g, '$1 $2')
        // Fix punctuation + letter
        .replace(/([.,;:!?])([a-zA-ZÀ-ÿ])/g, '$1 $2')
        // Fix closing parenthesis + letter
        .replace(/\)([a-zA-ZÀ-ÿ])/g, ') $1')
        // Fix letter + opening parenthesis
        .replace(/([a-zA-ZÀ-ÿ])\(/g, '$1 (')
        // Fix number + letter (12clients → 12 clients)
        .replace(/(\d)([a-zA-ZÀ-ÿ])/g, '$1 $2')
        // Fix letter + number (pour12 → pour 12)
        .replace(/([a-zA-ZÀ-ÿ])(\d)/g, '$1 $2')
        // Fix + and numbers
        .replace(/\+(\d)/g, '+ $1')
        .replace(/(\d)\+/g, '$1 +')
        // Fix % and numbers
        .replace(/(\d)%/g, '$1 %')
        .replace(/%(\d)/g, '% $1')
        // Normalize multiple spaces to single space
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Helper to safely render a string from potentially object value
 */
export function safeString(val: any): string {
    if (typeof val === 'string') return sanitizeText(val);
    if (typeof val === 'object' && val !== null) {
        if (val.name) return sanitizeText(val.name);
        if (val.skill) return sanitizeText(val.skill);
        if (val.description) return sanitizeText(val.description);
        if (val.impact) return sanitizeText(val.impact);
        return sanitizeText(JSON.stringify(val));
    }
    return sanitizeText(String(val || ''));
}
