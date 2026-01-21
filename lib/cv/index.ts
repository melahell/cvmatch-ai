/**
 * MODULE CV ADAPTATIF - EXPORTS PRINCIPAUX
 */

// Types
export * from "./types";

// Configuration
export {
  CONTENT_UNITS_REFERENCE,
  getUnitHeight,
  bestExperienceFormat,
  experienceFormatHeight,
  fitsInRemaining,
  maxItemsInCapacity
} from "./content-units-reference";
export { CV_THEMES, getThemeConfig } from "./theme-configs";

// Algorithme principal
export {
  generateAdaptiveCV,
  adaptCVToThemeUnits,
  type CVAdaptationResult
} from "./adaptive-algorithm";

// Utilitaires
export * from "./utils/scoring";
export * from "./utils/allocation";
export * from "./utils/validation";
