export const CONTENT_UNITS_REFERENCE = {
    header_minimal: { height_units: 8 },
    header_with_contacts: { height_units: 12 },
    header_with_photo: { height_units: 20 },

    summary_short: { height_units: 5 },
    summary_standard: { height_units: 8 },
    summary_elevator: { height_units: 12 },

    experience_detailed: { height_units: 22 },
    experience_standard: { height_units: 15 },
    experience_compact: { height_units: 8 },
    experience_minimal: { height_units: 4 },

    skill_category_full: { height_units: 7 },
    skill_category_standard: { height_units: 5 },
    skill_category_compact: { height_units: 3 },
    skill_line: { height_units: 2 },

    formation_detailed: { height_units: 10 },
    formation_standard: { height_units: 6 },
    formation_minimal: { height_units: 3 },

    project_full: { height_units: 10 },
    project_compact: { height_units: 4 },

    certification: { height_units: 3 },
    language: { height_units: 2 },
    client_item: { height_units: 1 },
    achievement_bullet: { height_units: 2 },
    interest_item: { height_units: 2 },
    footer: { height_units: 5 },
} as const;

export type ContentUnitType = keyof typeof CONTENT_UNITS_REFERENCE;

export function getUnitHeight(type: ContentUnitType): number {
    return CONTENT_UNITS_REFERENCE[type].height_units;
}

/**
 * Détermine le meilleur format d'expérience pour l'espace restant.
 * Stratégie "gourmande" : toujours choisir le format le plus détaillé possible.
 * Retourne null si aucun format ne rentre.
 */
export function bestExperienceFormat(
    remainingUnits: number
): "detailed" | "standard" | "compact" | "minimal" | null {
    if (remainingUnits >= CONTENT_UNITS_REFERENCE.experience_detailed.height_units) return "detailed";
    if (remainingUnits >= CONTENT_UNITS_REFERENCE.experience_standard.height_units) return "standard";
    if (remainingUnits >= CONTENT_UNITS_REFERENCE.experience_compact.height_units) return "compact";
    if (remainingUnits >= CONTENT_UNITS_REFERENCE.experience_minimal.height_units) return "minimal";
    return null;
}

/**
 * Hauteur en units pour un format d'expérience donné
 */
export function experienceFormatHeight(
    format: "detailed" | "standard" | "compact" | "minimal"
): number {
    const mapping = {
        detailed: CONTENT_UNITS_REFERENCE.experience_detailed.height_units,
        standard: CONTENT_UNITS_REFERENCE.experience_standard.height_units,
        compact: CONTENT_UNITS_REFERENCE.experience_compact.height_units,
        minimal: CONTENT_UNITS_REFERENCE.experience_minimal.height_units,
    };
    return mapping[format];
}

/**
 * Vérifie si un élément rentre dans l'espace restant
 */
export function fitsInRemaining(
    itemType: ContentUnitType,
    remainingUnits: number
): boolean {
    return CONTENT_UNITS_REFERENCE[itemType].height_units <= remainingUnits;
}

/**
 * Calcule le nombre max d'éléments qui rentrent dans une capacité donnée
 */
export function maxItemsInCapacity(
    itemType: ContentUnitType,
    capacityUnits: number
): number {
    const itemHeight = CONTENT_UNITS_REFERENCE[itemType].height_units;
    return Math.floor(capacityUnits / itemHeight);
}
