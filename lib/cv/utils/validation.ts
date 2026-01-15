/**
 * FONCTIONS DE VALIDATION
 *
 * Valide la cohérence et les contraintes du CV adapté
 */

import { AdaptedContent, CVThemeConfig } from "../types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valider un CV adapté complet
 */
export function validateAdaptedContent(
  content: AdaptedContent,
  theme: CVThemeConfig
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validation : Total units ne dépasse pas capacité page
  const maxUnits = theme.page_config.total_height_units * content.pages;
  if (content.total_units_used > maxUnits) {
    errors.push(
      `Total units (${content.total_units_used}) exceeds page capacity (${maxUnits} for ${content.pages} page(s))`
    );
  }

  // 2. Validation : Chaque zone respecte min_units
  const zoneValidations = [
    {
      name: "header",
      used: content.sections.header.units_used,
      min: theme.zones.header.min_units
    },
    {
      name: "summary",
      used: content.sections.summary.units_used,
      min: theme.zones.summary.min_units
    },
    {
      name: "experiences",
      used: content.sections.experiences.reduce((sum, exp) => sum + exp.units_used, 0),
      min: theme.zones.experiences.min_units
    },
    {
      name: "skills",
      used: content.sections.skills.reduce((sum, skill) => sum + skill.units_used, 0),
      min: theme.zones.skills.min_units
    },
    {
      name: "formation",
      used: content.sections.formation.reduce((sum, form) => sum + form.units_used, 0),
      min: theme.zones.formation.min_units
    }
  ];

  for (const validation of zoneValidations) {
    if (validation.used < validation.min) {
      warnings.push(
        `Zone "${validation.name}": ${validation.used} units < minimum ${validation.min} units`
      );
    }
  }

  // 3. Validation : min_detailed_experiences respecté
  const detailedCount = content.sections.experiences.filter(
    exp => exp.format === "detailed"
  ).length;

  if (detailedCount < theme.adaptive_rules.min_detailed_experiences) {
    warnings.push(
      `Only ${detailedCount} detailed experiences (minimum: ${theme.adaptive_rules.min_detailed_experiences})`
    );
  }

  // 4. Validation : Expériences triées par pertinence
  const scores = content.sections.experiences.map(exp => exp.relevance_score);
  for (let i = 0; i < scores.length - 1; i++) {
    if (scores[i] < scores[i + 1]) {
      warnings.push(
        `Experiences not properly sorted by relevance (${scores[i]} < ${scores[i + 1]} at position ${i})`
      );
      break;
    }
  }

  // 5. Validation : Pas de contenu vide
  if (content.sections.experiences.length === 0) {
    errors.push("No experiences included in CV");
  }

  if (content.sections.skills.length === 0) {
    warnings.push("No skills included in CV");
  }

  if (content.sections.formation.length === 0) {
    warnings.push("No formation included in CV");
  }

  // 6. Validation : Formats cohérents
  for (const exp of content.sections.experiences) {
    if (exp.format === "detailed" && !exp.content.context) {
      warnings.push(
        `Experience "${exp.content.position}" is detailed but has no context`
      );
    }

    if (exp.format === "detailed" && exp.content.achievements.length < 2) {
      warnings.push(
        `Experience "${exp.content.position}" is detailed but has only ${exp.content.achievements.length} achievement(s)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valider que le contenu ne déborde pas
 */
export function validateNoOverflow(
  totalUnits: number,
  theme: CVThemeConfig,
  pages: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const maxUnits = theme.page_config.total_height_units * pages;

  if (totalUnits > maxUnits) {
    errors.push(
      `Content overflow: ${totalUnits} units > ${maxUnits} units (${pages} page(s))`
    );
  }

  // Warning si utilisation > 95%
  const utilizationRate = (totalUnits / maxUnits) * 100;
  if (utilizationRate > 95) {
    warnings.push(
      `High space utilization: ${utilizationRate.toFixed(1)}% (risk of overflow with slight variations)`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculer statistiques du CV adapté
 */
export interface CVStats {
  total_units: number;
  pages: number;
  utilization_rate: number;
  zone_breakdown: Record<string, { units: number; percentage: number }>;
  experience_formats: Record<string, number>;
  quality_indicators: {
    detailed_experiences_count: number;
    total_experiences_count: number;
    total_achievements_count: number;
    avg_relevance_score: number;
  };
}

export function calculateCVStats(
  content: AdaptedContent,
  theme: CVThemeConfig
): CVStats {
  const maxUnits = theme.page_config.total_height_units * content.pages;

  // Zone breakdown
  const zoneBreakdown: Record<string, { units: number; percentage: number }> = {
    header: {
      units: content.sections.header.units_used,
      percentage: (content.sections.header.units_used / content.total_units_used) * 100
    },
    summary: {
      units: content.sections.summary.units_used,
      percentage: (content.sections.summary.units_used / content.total_units_used) * 100
    },
    experiences: {
      units: content.sections.experiences.reduce((sum, exp) => sum + exp.units_used, 0),
      percentage:
        (content.sections.experiences.reduce((sum, exp) => sum + exp.units_used, 0) /
          content.total_units_used) *
        100
    },
    skills: {
      units: content.sections.skills.reduce((sum, skill) => sum + skill.units_used, 0),
      percentage:
        (content.sections.skills.reduce((sum, skill) => sum + skill.units_used, 0) /
          content.total_units_used) *
        100
    },
    formation: {
      units: content.sections.formation.reduce((sum, form) => sum + form.units_used, 0),
      percentage:
        (content.sections.formation.reduce((sum, form) => sum + form.units_used, 0) /
          content.total_units_used) *
        100
    }
  };

  // Experience formats
  const experienceFormats: Record<string, number> = {};
  for (const exp of content.sections.experiences) {
    experienceFormats[exp.format] = (experienceFormats[exp.format] || 0) + 1;
  }

  // Quality indicators
  const detailedCount = content.sections.experiences.filter(
    exp => exp.format === "detailed"
  ).length;

  const totalAchievements = content.sections.experiences.reduce(
    (sum, exp) => sum + exp.content.achievements.length,
    0
  );

  const avgRelevanceScore =
    content.sections.experiences.length > 0
      ? content.sections.experiences.reduce((sum, exp) => sum + exp.relevance_score, 0) /
        content.sections.experiences.length
      : 0;

  return {
    total_units: content.total_units_used,
    pages: content.pages,
    utilization_rate: (content.total_units_used / maxUnits) * 100,
    zone_breakdown: zoneBreakdown,
    experience_formats: experienceFormats,
    quality_indicators: {
      detailed_experiences_count: detailedCount,
      total_experiences_count: content.sections.experiences.length,
      total_achievements_count: totalAchievements,
      avg_relevance_score: avgRelevanceScore
    }
  };
}

/**
 * Comparer deux CVs adaptés (pour A/B testing)
 */
export interface CVComparison {
  content_a: CVStats;
  content_b: CVStats;
  differences: {
    utilization_rate_diff: number;
    experiences_count_diff: number;
    detailed_count_diff: number;
    avg_relevance_diff: number;
  };
  recommendation: "A" | "B" | "Equal";
}

export function compareCVs(
  contentA: AdaptedContent,
  contentB: AdaptedContent,
  themeA: CVThemeConfig,
  themeB: CVThemeConfig
): CVComparison {
  const statsA = calculateCVStats(contentA, themeA);
  const statsB = calculateCVStats(contentB, themeB);

  const differences = {
    utilization_rate_diff: statsA.utilization_rate - statsB.utilization_rate,
    experiences_count_diff:
      statsA.quality_indicators.total_experiences_count -
      statsB.quality_indicators.total_experiences_count,
    detailed_count_diff:
      statsA.quality_indicators.detailed_experiences_count -
      statsB.quality_indicators.detailed_experiences_count,
    avg_relevance_diff:
      statsA.quality_indicators.avg_relevance_score -
      statsB.quality_indicators.avg_relevance_score
  };

  // Recommandation simple basée sur métriques
  let scoreA = 0;
  let scoreB = 0;

  // Préférer meilleur taux utilisation (mais pas > 95%)
  if (statsA.utilization_rate < 95 && statsA.utilization_rate > statsB.utilization_rate) {
    scoreA++;
  } else if (statsB.utilization_rate < 95 && statsB.utilization_rate > statsA.utilization_rate) {
    scoreB++;
  }

  // Préférer plus d'expériences détaillées
  if (statsA.quality_indicators.detailed_experiences_count > statsB.quality_indicators.detailed_experiences_count) {
    scoreA++;
  } else if (statsB.quality_indicators.detailed_experiences_count > statsA.quality_indicators.detailed_experiences_count) {
    scoreB++;
  }

  // Préférer meilleur score relevance moyen
  if (statsA.quality_indicators.avg_relevance_score > statsB.quality_indicators.avg_relevance_score) {
    scoreA++;
  } else if (statsB.quality_indicators.avg_relevance_score > statsA.quality_indicators.avg_relevance_score) {
    scoreB++;
  }

  let recommendation: "A" | "B" | "Equal";
  if (scoreA > scoreB) {
    recommendation = "A";
  } else if (scoreB > scoreA) {
    recommendation = "B";
  } else {
    recommendation = "Equal";
  }

  return {
    content_a: statsA,
    content_b: statsB,
    differences,
    recommendation
  };
}
