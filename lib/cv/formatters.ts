export const MONTHS_SHORT = [
    "Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin",
    "Juill.", "Août", "Sept.", "Oct.", "Nov.", "Déc."
];

export function formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return "";

    // Handle "Présent" or "Present" or "Now" case insensitive
    const lower = dateStr.toLowerCase().trim();
    if (lower === "présent" || lower === "present" || lower === "now" || lower === "aujourd'hui") {
        return "Présent";
    }

    // Explicitly handle YYYY-MM format (from AI Adapter)
    if (/^\d{4}-\d{2}$/.test(dateStr.trim())) {
        const [y, m] = dateStr.trim().split("-").map(Number);
        if (m >= 1 && m <= 12) {
            return `${MONTHS_SHORT[m - 1]} ${y}`;
        }
    }

    // If it's just a year (4 digits), return as is
    if (/^\d{4}$/.test(dateStr.trim())) {
        return dateStr.trim();
    }

    // Try parsing YYYY-MM or YYYY-MM-DD
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        // If not a valid date, return as is (fallback)
        return dateStr;
    }

    const month = date.getMonth();
    const year = date.getFullYear();

    return `${MONTHS_SHORT[month]} ${year}`;
}

export function formatLocation(loc: string | undefined | null): string {
    if (!loc) return "";
    return loc.trim();
}

export function normalizeLanguage(lang: string | undefined | null): string {
    if (!lang) return "";
    const lower = lang.toLowerCase().trim();
    if (lower === "french" || lower === "francais") return "Français";
    if (lower === "english" || lower === "anglais") return "Anglais";
    if (lower === "spanish" || lower === "espagnol") return "Espagnol";
    if (lower === "german" || lower === "allemand") return "Allemand";
    if (lower === "italian" || lower === "italien") return "Italien";
    // Add more common mappings if needed

    // Capitalize first letter otherwise
    return lang.charAt(0).toUpperCase() + lang.slice(1);
}
