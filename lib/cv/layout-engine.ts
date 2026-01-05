/**
 * Layout Engine - CDC CV Parfait
 * 
 * Calcule l'espace disponible, détecte les débordements,
 * et détermine le niveau de compression nécessaire.
 */

import {
    CVOptimized,
    SeniorityLevel,
    SENIORITY_RULES,
    CompressionLevel,
    COMPRESSION_LEVELS
} from '@/types/cv-optimized';

// =============================================================================
// CONSTANTES DE LAYOUT A4
// =============================================================================

export const A4_DIMENSIONS = {
    width_mm: 210,
    height_mm: 297,
    margins: {
        top: 15,
        bottom: 15,
        left: 15,
        right: 15
    },
    usable_height_mm: 267, // 297 - 15 - 15
    usable_width_mm: 180   // 210 - 15 - 15
};

// Hauteurs estimées en mm pour chaque zone
export const ZONE_HEIGHTS = {
    header: {
        with_photo: 45,
        without_photo: 35
    },
    elevator_pitch: {
        short: 15,   // < 150 chars
        medium: 20,  // 150-250 chars
        long: 25     // > 250 chars
    },
    experience: {
        header: 8,           // Poste + Entreprise + Dates
        bullet_single: 4,    // 1 ligne
        bullet_double: 7,    // 2 lignes
        technologies: 5,     // Liste technologies
        spacing: 4           // Espacement inter-expérience
    },
    competences: {
        header: 6,
        category: 8,
        compact: 15          // Mode liste compacte
    },
    formations: {
        header: 6,
        item: 6
    },
    langues: {
        header: 5,
        items: 8
    },
    certifications: {
        header: 5,
        items: 10
    }
};

// =============================================================================
// TYPES
// =============================================================================

export interface LayoutEstimate {
    total_height_mm: number;
    page_count: number;
    overflow_mm: number;
    compression_needed: number; // 0-4
    zones: ZoneBreakdown;
}

export interface ZoneBreakdown {
    header: number;
    elevator_pitch: number;
    experiences: number;
    competences: number;
    formations: number;
    langues: number;
    certifications: number;
}

export interface LayoutOptions {
    include_photo: boolean;
    dense_mode: boolean;
    compression_level: number;
}

// =============================================================================
// FONCTIONS DE CALCUL
// =============================================================================

/**
 * Estime la hauteur d'un texte basé sur le nombre de caractères
 */
function estimateTextHeight(charCount: number, charsPerLine: number = 80): number {
    const lines = Math.ceil(charCount / charsPerLine);
    return lines * 4; // 4mm par ligne approximativement
}

/**
 * Calcule la hauteur estimée pour une expérience
 */
function calculateExperienceHeight(
    exp: CVOptimized['experiences'][0],
    compressionLevel: number
): number {
    if (!exp.display) return 0;

    let height = ZONE_HEIGHTS.experience.header;

    // Réalisations
    const displayCount = compressionLevel >= 2
        ? Math.min(exp.realisations_display_count, 3)
        : exp.realisations_display_count;

    exp.realisations.slice(0, displayCount).forEach(real => {
        if (real.display) {
            const charCount = compressionLevel >= 1 && real.description_short
                ? real.description_short.length
                : real.char_count;
            height += charCount > 100
                ? ZONE_HEIGHTS.experience.bullet_double
                : ZONE_HEIGHTS.experience.bullet_single;
        }
    });

    // Technologies (si présentes)
    if (exp.technologies && exp.technologies.length > 0 && compressionLevel < 3) {
        height += ZONE_HEIGHTS.experience.technologies;
    }

    // Espacement réduit si compression
    height += compressionLevel >= 1
        ? ZONE_HEIGHTS.experience.spacing / 2
        : ZONE_HEIGHTS.experience.spacing;

    return height;
}

/**
 * Calcule la hauteur du header
 */
function calculateHeaderHeight(includePhoto: boolean): number {
    return includePhoto
        ? ZONE_HEIGHTS.header.with_photo
        : ZONE_HEIGHTS.header.without_photo;
}

/**
 * Calcule la hauteur de l'elevator pitch
 */
function calculateElevatorPitchHeight(pitch: CVOptimized['elevator_pitch']): number {
    if (!pitch.included) return 0;

    const charCount = pitch.char_count;
    if (charCount < 150) return ZONE_HEIGHTS.elevator_pitch.short;
    if (charCount < 250) return ZONE_HEIGHTS.elevator_pitch.medium;
    return ZONE_HEIGHTS.elevator_pitch.long;
}

/**
 * Calcule la hauteur des compétences
 */
function calculateCompetencesHeight(
    competences: CVOptimized['competences'],
    compressionLevel: number
): number {
    if (compressionLevel >= 3) {
        // Mode ultra-compact
        return ZONE_HEIGHTS.competences.compact;
    }

    let height = ZONE_HEIGHTS.competences.header;

    competences.categories.forEach(cat => {
        if (cat.display) {
            height += ZONE_HEIGHTS.competences.category;
        }
    });

    return height;
}

/**
 * Calcule la hauteur des formations
 */
function calculateFormationsHeight(
    formations: CVOptimized['formations'],
    compressionLevel: number
): number {
    if (compressionLevel >= 3) return 10; // Ultra-compact

    let height = ZONE_HEIGHTS.formations.header;
    const displayCount = compressionLevel >= 2 ? 1 : formations.filter(f => f.display).length;
    height += displayCount * ZONE_HEIGHTS.formations.item;

    return height;
}

/**
 * Calcule la hauteur des langues
 */
function calculateLanguesHeight(langues: CVOptimized['langues']): number {
    return ZONE_HEIGHTS.langues.header + ZONE_HEIGHTS.langues.items;
}

// =============================================================================
// FONCTION PRINCIPALE
// =============================================================================

/**
 * Estime le layout complet d'un CV et détermine si compression nécessaire
 */
export function estimateLayout(
    cv: CVOptimized,
    options: LayoutOptions
): LayoutEstimate {
    const { include_photo, compression_level } = options;

    // Calculer hauteur de chaque zone
    const headerHeight = calculateHeaderHeight(include_photo);
    const pitchHeight = calculateElevatorPitchHeight(cv.elevator_pitch);

    // Expériences (filtrer par display et pertinence si compression)
    let experiencesHeight = 0;
    const experiencesToShow = compression_level >= 3
        ? cv.experiences.filter(e => e.display && e.pertinence_score >= 50)
        : cv.experiences.filter(e => e.display);

    experiencesToShow.forEach(exp => {
        experiencesHeight += calculateExperienceHeight(exp, compression_level);
    });

    const competencesHeight = calculateCompetencesHeight(cv.competences, compression_level);
    const formationsHeight = calculateFormationsHeight(cv.formations, compression_level);
    const languesHeight = calculateLanguesHeight(cv.langues);
    const certificationsHeight = cv.cv_metadata.seniority_level !== 'junior' ? 15 : 0;

    // Total
    const totalHeight =
        headerHeight +
        pitchHeight +
        experiencesHeight +
        competencesHeight +
        formationsHeight +
        languesHeight +
        certificationsHeight;

    const usableHeight = A4_DIMENSIONS.usable_height_mm;
    const overflow = Math.max(0, totalHeight - usableHeight);
    const pageCount = Math.ceil(totalHeight / usableHeight);

    // Déterminer niveau de compression nécessaire
    let compressionNeeded = 0;
    if (overflow > 0) {
        if (overflow <= 20) compressionNeeded = 1;
        else if (overflow <= 40) compressionNeeded = 2;
        else if (overflow <= 60) compressionNeeded = 3;
        else compressionNeeded = 4;
    }

    return {
        total_height_mm: Math.round(totalHeight),
        page_count: pageCount,
        overflow_mm: Math.round(overflow),
        compression_needed: compressionNeeded,
        zones: {
            header: Math.round(headerHeight),
            elevator_pitch: Math.round(pitchHeight),
            experiences: Math.round(experiencesHeight),
            competences: Math.round(competencesHeight),
            formations: Math.round(formationsHeight),
            langues: Math.round(languesHeight),
            certifications: Math.round(certificationsHeight)
        }
    };
}

/**
 * Détermine le niveau de compression optimal pour un CV
 */
export function determineCompressionLevel(
    cv: CVOptimized,
    includePhoto: boolean,
    seniorityLevel: SeniorityLevel
): { level: number; reason: string } {
    const rules = SENIORITY_RULES[seniorityLevel];

    // Estimer avec compression 0
    let estimate = estimateLayout(cv, {
        include_photo: includePhoto,
        dense_mode: false,
        compression_level: 0
    });

    // Si ça tient sans compression, on est bon
    if (estimate.page_count === 1) {
        return { level: 0, reason: 'CV tient sur 1 page sans compression' };
    }

    // Essayer chaque niveau de compression
    for (let level = 1; level <= 3; level++) {
        estimate = estimateLayout(cv, {
            include_photo: includePhoto,
            dense_mode: true,
            compression_level: level
        });

        if (estimate.page_count === 1) {
            return {
                level,
                reason: `Compression niveau ${level} nécessaire pour 1 page`
            };
        }
    }

    // Si même compression max ne suffit pas
    if (rules.maxPages >= 2) {
        return {
            level: 4,
            reason: `CV sur 2 pages autorisé (séniorité ${seniorityLevel})`
        };
    }

    // Forcer compression agressive
    return {
        level: 3,
        reason: 'Compression maximale appliquée (1 page obligatoire)'
    };
}

/**
 * Calcule les allocations optimales par zone en pourcentage
 */
export function calculateZoneAllocations(
    cv: CVOptimized,
    compressionLevel: number
): Record<string, number> {
    // Allocations de base basées sur le CDC
    const baseAllocations = {
        header: 15,
        elevator_pitch: cv.elevator_pitch.included ? 8 : 0,
        experiences: 50,
        competences: 12,
        formations: cv.cv_metadata.seniority_level === 'junior' ? 10 : 5,
        langues: 5,
        certifications: 5
    };

    // Ajuster si compression
    if (compressionLevel >= 2) {
        baseAllocations.formations = 3;
        baseAllocations.certifications = 3;
        baseAllocations.experiences += 6;
    }

    // Normaliser à 100%
    const total = Object.values(baseAllocations).reduce((a, b) => a + b, 0);
    const normalized: Record<string, number> = {};

    for (const [key, value] of Object.entries(baseAllocations)) {
        normalized[key] = Math.round((value / total) * 100);
    }

    return normalized;
}
