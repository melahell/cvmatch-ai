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
    achievement_bullet: { height_units: 2 },
    interest_item: { height_units: 2 },
    footer: { height_units: 5 },
} as const;

export type ContentUnitType = keyof typeof CONTENT_UNITS_REFERENCE;

export function getUnitHeight(type: ContentUnitType): number {
    return CONTENT_UNITS_REFERENCE[type].height_units;
}
