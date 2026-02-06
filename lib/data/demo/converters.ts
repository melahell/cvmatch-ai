/**
 * Helpers du module démo (formatage dates, durées).
 * Pour RAGComplete → CVData, utiliser lib/utils/rag-to-cv-data.ts (ragToCVData).
 */

/**
 * Formate une date pour l'affichage (YYYY-MM → Mois YYYY)
 */
export function formatDateDisplay(date: string): string {
    const [year, month] = date.split('-');
    if (!month) return year;

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const monthIndex = parseInt(month, 10) - 1;
    return `${months[monthIndex]} ${year}`;
}

/**
 * Calcule la durée entre deux dates en mois
 */
export function calculateDurationMonths(start: string, end: string | null): number {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();

    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12
        + (endDate.getMonth() - startDate.getMonth());

    return Math.max(1, months);
}

/**
 * Formate une durée en texte lisible
 */
export function formatDuration(months: number): string {
    if (months < 12) {
        return `${months} mois`;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
        return `${years} an${years > 1 ? 's' : ''}`;
    }

    return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
}
