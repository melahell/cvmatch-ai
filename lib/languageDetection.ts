import { franc } from 'franc-min';

// Phase 3 Item 8: Multi-language detection for job offers
export function detectLanguage(text: string): string {
    if (!text || text.length < 20) return 'und'; // undefined

    const langCode = franc(text);

    const languageNames: Record<string, string> = {
        'fra': 'Français',
        'eng': 'Anglais',
        'spa': 'Espagnol',
        'deu': 'Allemand',
        'ita': 'Italien',
        'por': 'Portugais',
        'nld': 'Néerlandais',
        'und': 'Non détecté'
    };

    return languageNames[langCode] || languageNames['und'];
}

export function getLanguageFlag(langCode: string): string {
    const flags: Record<string, string> = {
        'fra': '🇫🇷',
        'eng': '🇬🇧',
        'spa': '🇪🇸',
        'deu': '🇩🇪',
        'ita': '🇮🇹',
        'por': '🇵🇹',
        'nld': '🇳🇱',
        'und': '🌐'
    };

    return flags[langCode] || flags['und'];
}

// Usage example:
// const language = detectLanguage(jobText);
// const flag = getLanguageFlag('fra');
// Display: {flag} {language}
