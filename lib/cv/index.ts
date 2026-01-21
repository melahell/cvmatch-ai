/**
 * MODULE CV ADAPTATIF - EXPORTS PRINCIPAUX
 */

// Types
export * from "./types";

// Configuration
export * from "./content-units-reference";
export * from "./theme-configs";

// Algorithme principal
export {
  generateAdaptiveCV,
  generateMultiThemeVariants,
  getThemeCapacitySummary,
  recommendTheme,
  type ThemeCapacitySummary
} from "./adaptive-algorithm";

// Utilitaires
export * from "./utils/scoring";
export * from "./utils/allocation";
export * from "./utils/validation";
