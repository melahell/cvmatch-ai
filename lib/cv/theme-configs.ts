/**
 * CONFIGURATIONS DES THÈMES CV
 *
 * Chaque thème définit :
 * - La capacité de chaque zone (en units)
 * - Les règles d'adaptation automatique
 * - Les paramètres visuels (conversion units → CSS)
 */

import { CVThemeConfig, ThemeId } from "./types";

export const CV_THEMES: Record<ThemeId, CVThemeConfig> = {
  // ═══════════════════════════════════════════════════════
  // THÈME "CLASSIC"
  // Design sobre et professionnel, marges standards
  // ═══════════════════════════════════════════════════════
  classic: {
    id: "classic",
    name: "Classic Professional",
    description: "Template sobre et professionnel, marges standards",

    page_config: {
      total_height_units: 200,
      supports_two_pages: true,
      two_pages_threshold: 210  // Passe à 2 pages si >210 units nécessaires
    },

    zones: {
      header: {
        name: "header",
        capacity_units: 12,
        min_units: 8,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },

      summary: {
        name: "summary",
        capacity_units: 10,
        min_units: 5,
        flex: true,
        flex_priority: 5,
        overflow_strategy: "compact"
      },

      experiences: {
        name: "experiences",
        capacity_units: 100,
        min_units: 50,
        flex: true,
        flex_priority: 10,  // Priorité MAX
        overflow_strategy: "compact"
      },

      skills: {
        name: "skills",
        capacity_units: 28,
        min_units: 15,
        flex: true,
        flex_priority: 7,
        overflow_strategy: "compact"
      },

      formation: {
        name: "formation",
        capacity_units: 24,
        min_units: 12,
        flex: true,
        flex_priority: 6,
        overflow_strategy: "compact"
      },

      projects: {
        name: "projects",
        capacity_units: 0,  // Optionnel
        min_units: 0,
        flex: true,
        flex_priority: 4,
        overflow_strategy: "hide"
      },

      certifications: {
        name: "certifications",
        capacity_units: 12,
        min_units: 0,
        flex: true,
        flex_priority: 3,
        overflow_strategy: "compact"
      },

      languages: {
        name: "languages",
        capacity_units: 6,
        min_units: 0,
        flex: true,
        flex_priority: 2,
        overflow_strategy: "compact"
      },

      interests: {
        name: "interests",
        capacity_units: 0,  // Optionnel, seulement si espace restant
        min_units: 0,
        flex: true,
        flex_priority: 1,
        overflow_strategy: "hide"
      },

      footer: {
        name: "footer",
        capacity_units: 5,
        min_units: 0,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },

      margins: {
        name: "margins",
        capacity_units: 15,
        min_units: 15,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      }
    },

    adaptive_rules: {
      min_detailed_experiences: 2,
      prefer_detailed_for_recent: true,
      compact_after_years: 10,
      skills_display_mode: "auto",
      max_bullet_points_per_exp: 5
    },

    visual_config: {
      unit_to_mm: 4.0,  // 1 unit = 4mm
      font_sizes: {
        name: 24,
        title: 14,
        section_header: 13,
        body: 10,
        small: 9
      },
      colors: {
        primary: "#2C3E50",
        secondary: "#7F8C8D",
        accent: "#3498DB"
      },
      spacing_multiplier: 1.0
    }
  },

  // ═══════════════════════════════════════════════════════
  // THÈME "MODERN SPACIOUS"
  // Design moderne avec grandes marges et respirations
  // ═══════════════════════════════════════════════════════
  modern_spacious: {
    id: "modern_spacious",
    name: "Modern & Spacious",
    description: "Design moderne avec grandes marges et respirations",

    page_config: {
      total_height_units: 200,
      supports_two_pages: true,
      two_pages_threshold: 200  // Plus facilement 2 pages
    },

    zones: {
      header: {
        name: "header",
        capacity_units: 20,  // Header plus grand avec photo
        min_units: 12,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },

      summary: {
        name: "summary",
        capacity_units: 15,  // Pitch long encouragé
        min_units: 8,
        flex: true,
        flex_priority: 5,
        overflow_strategy: "compact"
      },

      experiences: {
        name: "experiences",
        capacity_units: 75,  // MOINS d'espace qu'en classic !
        min_units: 45,
        flex: true,
        flex_priority: 10,
        overflow_strategy: "compact"
      },

      skills: {
        name: "skills",
        capacity_units: 25,
        min_units: 15,
        flex: true,
        flex_priority: 7,
        overflow_strategy: "compact"
      },

      formation: {
        name: "formation",
        capacity_units: 20,
        min_units: 10,
        flex: true,
        flex_priority: 6,
        overflow_strategy: "compact"
      },

      projects: {
        name: "projects",
        capacity_units: 15,  // Projets mis en avant
        min_units: 0,
        flex: true,
        flex_priority: 8,
        overflow_strategy: "compact"
      },

      certifications: {
        name: "certifications",
        capacity_units: 10,
        min_units: 0,
        flex: true,
        flex_priority: 3,
        overflow_strategy: "compact"
      },

      languages: {
        name: "languages",
        capacity_units: 8,
        min_units: 0,
        flex: true,
        flex_priority: 2,
        overflow_strategy: "compact"
      },

      interests: {
        name: "interests",
        capacity_units: 8,  // Centres d'intérêt valorisés
        min_units: 0,
        flex: true,
        flex_priority: 4,
        overflow_strategy: "hide"
      },

      footer: {
        name: "footer",
        capacity_units: 8,
        min_units: 0,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },

      margins: {
        name: "margins",
        capacity_units: 30,  // Grandes marges !
        min_units: 30,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      }
    },

    adaptive_rules: {
      min_detailed_experiences: 2,
      prefer_detailed_for_recent: true,
      compact_after_years: 8,  // Compacte plus tôt
      skills_display_mode: "auto",
      max_bullet_points_per_exp: 4
    },

    visual_config: {
      unit_to_mm: 4.2,  // Légèrement plus grand
      font_sizes: {
        name: 28,
        title: 16,
        section_header: 14,
        body: 11,
        small: 10
      },
      colors: {
        primary: "#1A1A2E",
        secondary: "#16213E",
        accent: "#0F3460"
      },
      spacing_multiplier: 1.3  // Plus d'espace entre éléments
    }
  },

  // ═══════════════════════════════════════════════════════
  // THÈME "COMPACT ATS"
  // Maximum d'information, optimisé pour parsing ATS
  // ═══════════════════════════════════════════════════════
  compact_ats: {
    id: "compact_ats",
    name: "Compact ATS-Optimized",
    description: "Maximum d'information, optimisé pour parsing ATS",

    page_config: {
      total_height_units: 200,
      supports_two_pages: false,  // TOUJOURS 1 page
      two_pages_threshold: 999
    },

    zones: {
      header: {
        name: "header",
        capacity_units: 8,  // Header minimal
        min_units: 8,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },

      summary: {
        name: "summary",
        capacity_units: 7,  // Pitch court
        min_units: 5,
        flex: true,
        flex_priority: 4,
        overflow_strategy: "compact"
      },

      experiences: {
        name: "experiences",
        capacity_units: 110,  // MAX d'espace pour expériences !
        min_units: 70,
        flex: true,
        flex_priority: 10,
        overflow_strategy: "compact"
      },

      skills: {
        name: "skills",
        capacity_units: 30,  // Compétences importantes pour ATS
        min_units: 20,
        flex: true,
        flex_priority: 9,
        overflow_strategy: "compact"
      },

      formation: {
        name: "formation",
        capacity_units: 18,
        min_units: 9,
        flex: true,
        flex_priority: 5,
        overflow_strategy: "compact"
      },

      projects: {
        name: "projects",
        capacity_units: 0,  // Pas de projets, focus XP
        min_units: 0,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },

      certifications: {
        name: "certifications",
        capacity_units: 12,
        min_units: 0,
        flex: true,
        flex_priority: 6,
        overflow_strategy: "compact"
      },

      languages: {
        name: "languages",
        capacity_units: 4,
        min_units: 0,
        flex: true,
        flex_priority: 3,
        overflow_strategy: "compact"
      },

      interests: {
        name: "interests",
        capacity_units: 0,  // Jamais d'intérêts en ATS
        min_units: 0,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },

      footer: {
        name: "footer",
        capacity_units: 0,
        min_units: 0,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },

      margins: {
        name: "margins",
        capacity_units: 12,  // Marges minimales
        min_units: 12,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      }
    },

    adaptive_rules: {
      min_detailed_experiences: 3,  // Plus d'expériences détaillées
      prefer_detailed_for_recent: true,
      compact_after_years: 12,
      skills_display_mode: "full",  // Toujours liste complète
      max_bullet_points_per_exp: 4
    },

    visual_config: {
      unit_to_mm: 3.8,  // Légèrement plus compact
      font_sizes: {
        name: 20,
        title: 12,
        section_header: 11,
        body: 9,
        small: 8
      },
      colors: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#666666"
      },
      spacing_multiplier: 0.8  // Moins d'espace
    }
  }
};

/**
 * Obtenir un thème par son ID
 */
export function getTheme(themeId: ThemeId): CVThemeConfig {
  const theme = CV_THEMES[themeId];
  if (!theme) {
    throw new Error(`Theme not found: ${themeId}`);
  }
  return theme;
}

/**
 * Liste tous les thèmes disponibles
 */
export function getAllThemes(): CVThemeConfig[] {
  return Object.values(CV_THEMES);
}

/**
 * Obtenir les IDs de tous les thèmes
 */
export function getAllThemeIds(): ThemeId[] {
  return Object.keys(CV_THEMES) as ThemeId[];
}

/**
 * Valider qu'un thème existe
 */
export function isValidThemeId(id: string): id is ThemeId {
  return id in CV_THEMES;
}

/**
 * Calculer la capacité totale allouée (hors marges)
 */
export function calculateTotalAllocatedUnits(theme: CVThemeConfig): number {
  return Object.entries(theme.zones)
    .filter(([name]) => name !== "margins")
    .reduce((sum, [, zone]) => sum + zone.capacity_units, 0);
}

/**
 * Valider la cohérence d'un thème
 */
export function validateThemeConfig(theme: CVThemeConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validation 1: Total capacity ne dépasse pas total_height_units
  const totalAllocated = calculateTotalAllocatedUnits(theme);
  const marginUnits = theme.zones.margins.capacity_units;
  const totalWithMargins = totalAllocated + marginUnits;

  if (totalWithMargins > theme.page_config.total_height_units) {
    errors.push(
      `Total allocated (${totalWithMargins}) exceeds page capacity (${theme.page_config.total_height_units})`
    );
  }

  // Validation 2: Chaque zone a min_units <= capacity_units
  for (const [name, zone] of Object.entries(theme.zones)) {
    if (zone.min_units > zone.capacity_units) {
      errors.push(
        `Zone "${name}": min_units (${zone.min_units}) > capacity_units (${zone.capacity_units})`
      );
    }
  }

  // Validation 3: Expériences doivent avoir assez d'espace pour min_detailed
  const expZone = theme.zones.experiences;
  const minExpUnits = theme.adaptive_rules.min_detailed_experiences * 22; // experience_detailed
  if (expZone.capacity_units < minExpUnits) {
    warnings.push(
      `Experiences zone (${expZone.capacity_units} units) may be too small for ${theme.adaptive_rules.min_detailed_experiences} detailed experiences (needs ${minExpUnits} units)`
    );
  }

  // Validation 4: flex_priority doit être entre 1-10
  for (const [name, zone] of Object.entries(theme.zones)) {
    if (zone.flex_priority < 1 || zone.flex_priority > 10) {
      errors.push(
        `Zone "${name}": flex_priority (${zone.flex_priority}) must be between 1-10`
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
 * Statistiques d'un thème
 */
export interface ThemeStats {
  total_capacity: number;
  margin_capacity: number;
  usable_capacity: number;
  allocation_percentage: number;
  zone_breakdown: Record<string, { units: number; percentage: number }>;
}

export function getThemeStats(theme: CVThemeConfig): ThemeStats {
  const totalCapacity = theme.page_config.total_height_units;
  const marginCapacity = theme.zones.margins.capacity_units;
  const usableCapacity = totalCapacity - marginCapacity;
  const totalAllocated = calculateTotalAllocatedUnits(theme);

  const zoneBreakdown: Record<string, { units: number; percentage: number }> = {};

  for (const [name, zone] of Object.entries(theme.zones)) {
    if (name !== "margins") {
      zoneBreakdown[name] = {
        units: zone.capacity_units,
        percentage: (zone.capacity_units / usableCapacity) * 100
      };
    }
  }

  return {
    total_capacity: totalCapacity,
    margin_capacity: marginCapacity,
    usable_capacity: usableCapacity,
    allocation_percentage: (totalAllocated / usableCapacity) * 100,
    zone_breakdown: zoneBreakdown
  };
}
