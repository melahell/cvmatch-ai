/**
 * CV CSS Variables Generator
 * 
 * Génère les variables CSS dynamiques basées sur les units du thème
 * pour permettre aux templates de calculer les hauteurs via calc()
 */

import { getThemeConfig, CVThemeConfig } from './theme-configs';
import { CONTENT_UNITS_REFERENCE } from './content-units-reference';

/**
 * Statistiques d'utilisation des zones en units
 */
export interface ZoneUnitStats {
    header: number;
    summary: number;
    experiences: number;
    skills: number;
    formation: number;
    certifications: number;
    languages: number;
    margins: number;
    total: number;
    remaining: number;
    percentage: number;
}

/**
 * Variables CSS générées pour le template
 */
export interface CVCSSVariables {
    '--cv-unit-to-mm': string;
    '--cv-page-height': string;
    '--cv-page-width': string;
    '--cv-spacing-multiplier': string;

    // Capacités des zones
    '--cv-header-capacity': string;
    '--cv-summary-capacity': string;
    '--cv-experiences-capacity': string;
    '--cv-skills-capacity': string;
    '--cv-formation-capacity': string;
    '--cv-certifications-capacity': string;
    '--cv-languages-capacity': string;
    '--cv-margins-capacity': string;

    // Hauteurs de référence des contenus
    '--cv-exp-detailed-height': string;
    '--cv-exp-standard-height': string;
    '--cv-exp-compact-height': string;
    '--cv-exp-minimal-height': string;
    '--cv-skill-line-height': string;
    '--cv-formation-height': string;
    '--cv-certification-height': string;
    '--cv-language-height': string;

    // Statistiques actuelles (si fournies)
    '--cv-units-used'?: string;
    '--cv-units-remaining'?: string;
    '--cv-usage-percentage'?: string;
}

/**
 * Génère les variables CSS pour un thème donné
 */
export function generateCSSVariables(
    themeId: string,
    unitStats?: ZoneUnitStats
): CVCSSVariables {
    const theme = getThemeConfig(themeId);
    const unitToMm = theme.visual_config.unit_to_mm;

    const variables: CVCSSVariables = {
        // Base units
        '--cv-unit-to-mm': `${unitToMm}mm`,
        '--cv-page-height': '297mm',
        '--cv-page-width': '210mm',
        '--cv-spacing-multiplier': `${theme.visual_config.spacing_multiplier}`,

        // Capacités des zones (en units convertis en mm)
        '--cv-header-capacity': `calc(${theme.zones.header.capacity_units} * ${unitToMm}mm)`,
        '--cv-summary-capacity': `calc(${theme.zones.summary.capacity_units} * ${unitToMm}mm)`,
        '--cv-experiences-capacity': `calc(${theme.zones.experiences.capacity_units} * ${unitToMm}mm)`,
        '--cv-skills-capacity': `calc(${theme.zones.skills.capacity_units} * ${unitToMm}mm)`,
        '--cv-formation-capacity': `calc(${theme.zones.formation.capacity_units} * ${unitToMm}mm)`,
        '--cv-certifications-capacity': `calc(${theme.zones.certifications.capacity_units} * ${unitToMm}mm)`,
        '--cv-languages-capacity': `calc(${theme.zones.languages.capacity_units} * ${unitToMm}mm)`,
        '--cv-margins-capacity': `calc(${theme.zones.margins.capacity_units} * ${unitToMm}mm)`,

        // Hauteurs de référence des contenus
        '--cv-exp-detailed-height': `calc(${CONTENT_UNITS_REFERENCE.experience_detailed.height_units} * ${unitToMm}mm)`,
        '--cv-exp-standard-height': `calc(${CONTENT_UNITS_REFERENCE.experience_standard.height_units} * ${unitToMm}mm)`,
        '--cv-exp-compact-height': `calc(${CONTENT_UNITS_REFERENCE.experience_compact.height_units} * ${unitToMm}mm)`,
        '--cv-exp-minimal-height': `calc(${CONTENT_UNITS_REFERENCE.experience_minimal.height_units} * ${unitToMm}mm)`,
        '--cv-skill-line-height': `calc(${CONTENT_UNITS_REFERENCE.skill_line.height_units} * ${unitToMm}mm)`,
        '--cv-formation-height': `calc(${CONTENT_UNITS_REFERENCE.formation_standard.height_units} * ${unitToMm}mm)`,
        '--cv-certification-height': `calc(${CONTENT_UNITS_REFERENCE.certification.height_units} * ${unitToMm}mm)`,
        '--cv-language-height': `calc(${CONTENT_UNITS_REFERENCE.language.height_units} * ${unitToMm}mm)`,
    };

    // Ajouter les stats si disponibles
    if (unitStats) {
        variables['--cv-units-used'] = `${unitStats.total}`;
        variables['--cv-units-remaining'] = `${unitStats.remaining}`;
        variables['--cv-usage-percentage'] = `${unitStats.percentage}%`;
    }

    return variables;
}

/**
 * Convertit les variables CSS en object style React
 */
export function cssVariablesToStyle(variables: CVCSSVariables): React.CSSProperties {
    return variables as unknown as React.CSSProperties;
}

/**
 * Génère un string CSS avec les variables (pour injection dans <style>)
 */
export function generateCSSString(themeId: string, unitStats?: ZoneUnitStats): string {
    const variables = generateCSSVariables(themeId, unitStats);

    const lines = Object.entries(variables)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n');

    return `:root {\n${lines}\n}`;
}

/**
 * Hook helper pour obtenir les variables CSS dans un composant React
 */
export function useThemeCSSVariables(themeId: string, unitStats?: ZoneUnitStats) {
    return generateCSSVariables(themeId, unitStats);
}
