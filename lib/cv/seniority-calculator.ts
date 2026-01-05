/**
 * Seniority Calculator - CDC CV Parfait
 * 
 * Calcule le niveau de séniorité basé sur les expériences
 * et retourne les règles applicables.
 */

import {
    SeniorityLevel,
    SeniorityRules,
    SENIORITY_RULES
} from '@/types/cv-optimized';

interface Experience {
    debut: string;
    fin?: string | null;
    actuel?: boolean;
}

/**
 * Calcule le nombre total de mois d'expérience
 */
export function calculateTotalMonths(experiences: Experience[]): number {
    let totalMonths = 0;

    for (const exp of experiences) {
        const startDate = parseDate(exp.debut);
        if (!startDate) continue;

        let endDate: Date;
        if (exp.actuel || !exp.fin) {
            endDate = new Date();
        } else {
            endDate = parseDate(exp.fin) || new Date();
        }

        const months = Math.max(0,
            (endDate.getFullYear() - startDate.getFullYear()) * 12 +
            (endDate.getMonth() - startDate.getMonth())
        );

        totalMonths += months;
    }

    return totalMonths;
}

/**
 * Parse une date au format YYYY-MM ou YYYY
 */
function parseDate(dateStr: string | undefined | null): Date | null {
    if (!dateStr) return null;

    const cleanDate = dateStr.trim();

    // Format YYYY-MM
    if (/^\d{4}-\d{2}$/.test(cleanDate)) {
        const [year, month] = cleanDate.split('-').map(Number);
        return new Date(year, month - 1, 1);
    }

    // Format YYYY
    if (/^\d{4}$/.test(cleanDate)) {
        return new Date(parseInt(cleanDate), 0, 1);
    }

    // Essayer ISO date
    const parsed = new Date(cleanDate);
    return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Calcule le niveau de séniorité basé sur les années d'expérience
 */
export function calculateSeniority(experiences: Experience[]): SeniorityLevel {
    const totalMonths = calculateTotalMonths(experiences);
    const totalYears = totalMonths / 12;

    if (totalYears < 3) return 'junior';
    if (totalYears < 8) return 'confirmed';
    if (totalYears < 15) return 'senior';
    return 'expert';
}

/**
 * Retourne les règles applicables pour un niveau de séniorité
 */
export function getSeniorityRules(level: SeniorityLevel): SeniorityRules {
    return SENIORITY_RULES[level];
}

/**
 * Détecte automatiquement la séniorité et retourne les règles
 */
export function detectSeniorityWithRules(experiences: Experience[]): {
    level: SeniorityLevel;
    rules: SeniorityRules;
    totalYears: number;
    totalMonths: number;
} {
    const totalMonths = calculateTotalMonths(experiences);
    const totalYears = totalMonths / 12;
    const level = calculateSeniority(experiences);
    const rules = getSeniorityRules(level);

    return {
        level,
        rules,
        totalYears: Math.round(totalYears * 10) / 10,
        totalMonths
    };
}

/**
 * Formate la durée pour affichage
 */
export function formatDuration(startDate: string, endDate: string | null, actuel: boolean): string {
    const start = parseDate(startDate);
    const end = actuel || !endDate ? new Date() : parseDate(endDate);

    if (!start || !end) return '';

    const months = Math.max(0,
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth())
    );

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
        return `${remainingMonths} mois`;
    } else if (remainingMonths === 0) {
        return years === 1 ? '1 an' : `${years} ans`;
    } else {
        return `${years} an${years > 1 ? 's' : ''} ${remainingMonths} mois`;
    }
}

/**
 * Génère la durée affichée pour une expérience
 */
export function generateDureeAffichee(
    debut: string,
    fin: string | null,
    actuel: boolean
): string {
    if (actuel) {
        const startDate = parseDate(debut);
        if (startDate) {
            const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            return `Depuis ${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;
        }
        return 'Présent';
    }

    return formatDuration(debut, fin, actuel);
}
