/**
 * ALGORITHME PRINCIPAL D'ADAPTATION CV
 *
 * Prend en entrée :
 * - Données RAG brutes
 * - Offre d'emploi (optionnel, pour scoring)
 * - Thème choisi
 * - Préférences utilisateur
 *
 * Retourne :
 * - Contenu adapté au thème avec formats optimisés
 * - Garantie de non-débordement
 * - Warnings si contenu exclu
 */

import {
  RAGData,
  JobOffer,
  UserPreferences,
  AdaptedContent,
  ThemeId,
  AdaptedCertification,
  AdaptedLanguage
} from "./types";
import { getTheme } from "./theme-configs";
import { CONTENT_UNITS_REFERENCE } from "./content-units-reference";
import { scoreAndSortExperiences } from "./utils/scoring";
import {
  allocateHeader,
  allocateSummary,
  allocateExperiences,
  allocateSkills,
  allocateFormation
} from "./utils/allocation";
import { validateAdaptedContent, validateNoOverflow } from "./utils/validation";

/**
 * Générer un CV adapté selon un thème
 */
export function generateAdaptiveCV(
  ragData: RAGData,
  jobOffer: JobOffer | null,
  themeId: ThemeId,
  userPrefs: UserPreferences = {}
): AdaptedContent {
  const theme = getTheme(themeId);
  const warnings: string[] = [];

  // ────────────────────────────────────────────────────────
  // ÉTAPE 1 : SCORING & TRI DES EXPÉRIENCES
  // ────────────────────────────────────────────────────────
  const scoredExperiences = scoreAndSortExperiences(
    ragData.experiences || [],
    jobOffer,
    userPrefs
  );

  // ────────────────────────────────────────────────────────
  // ÉTAPE 2 : ALLOCATION HEADER
  // ────────────────────────────────────────────────────────
  const header = allocateHeader(
    ragData.profil,
    theme.zones.header.capacity_units,
    userPrefs
  );

  // ────────────────────────────────────────────────────────
  // ÉTAPE 3 : ALLOCATION SUMMARY
  // ────────────────────────────────────────────────────────
  const summary = allocateSummary(
    ragData.profil,
    theme.zones.summary.capacity_units,
    theme.adaptive_rules
  );

  // ────────────────────────────────────────────────────────
  // ÉTAPE 4 : ALLOCATION EXPÉRIENCES (CŒUR DE L'ALGO)
  // ────────────────────────────────────────────────────────
  const experiencesResult = allocateExperiences(
    scoredExperiences,
    theme.zones.experiences.capacity_units,
    theme.adaptive_rules,
    userPrefs
  );

  warnings.push(...experiencesResult.warnings);

  // ────────────────────────────────────────────────────────
  // ÉTAPE 5 : ALLOCATION COMPÉTENCES
  // ────────────────────────────────────────────────────────
  const skillsResult = allocateSkills(
    ragData.competences,
    theme.zones.skills.capacity_units,
    theme.adaptive_rules
  );

  // ────────────────────────────────────────────────────────
  // ÉTAPE 6 : ALLOCATION FORMATION
  // ────────────────────────────────────────────────────────
  const formationResult = allocateFormation(
    ragData.formations_certifications?.formations || [],
    theme.zones.formation.capacity_units,
    theme.adaptive_rules
  );

  // ────────────────────────────────────────────────────────
  // ÉTAPE 7 : CALCUL TOTAL & DÉTERMINATION PAGES
  // ────────────────────────────────────────────────────────
  const totalUnitsUsed =
    header.units_used +
    summary.units_used +
    experiencesResult.units_used +
    skillsResult.units_used +
    formationResult.units_used +
    theme.zones.margins.capacity_units;

  let pages = 1;

  if (totalUnitsUsed > theme.page_config.total_height_units) {
    if (theme.page_config.supports_two_pages) {
      pages = 2;
    } else {
      warnings.push(
        `⚠️ Content overflow: ${totalUnitsUsed} units > ${theme.page_config.total_height_units} units (theme does not support 2 pages)`
      );
    }
  }

  // ────────────────────────────────────────────────────────
  // ÉTAPE 8 : ALLOCATION SECTIONS OPTIONNELLES
  // ────────────────────────────────────────────────────────
  const remainingUnits = theme.page_config.total_height_units * pages - totalUnitsUsed;

  let certifications: AdaptedCertification[] | undefined;
  let languages: AdaptedLanguage[] | undefined;

  if (remainingUnits > 0) {
    // Allouer certifications si espace disponible
    if (
      ragData.formations_certifications?.certifications &&
      theme.zones.certifications.capacity_units > 0
    ) {
      const certUnits = Math.min(
        remainingUnits,
        theme.zones.certifications.capacity_units
      );

      certifications = ragData.formations_certifications.certifications
        .slice(0, Math.floor(certUnits / CONTENT_UNITS_REFERENCE.certification.height_units))
        .map((cert, i) => ({
          id: `cert_${i}`,
          units_used: CONTENT_UNITS_REFERENCE.certification.height_units,
          content: {
            nom: cert.nom,
            organisme: cert.organisme,
            date: cert.date
          }
        }));
    }

    // Allouer langues si espace disponible
    if (ragData.profil.langues && theme.zones.languages.capacity_units > 0) {
      const langUnits = Math.min(remainingUnits, theme.zones.languages.capacity_units);

      languages = ragData.profil.langues
        .slice(0, Math.floor(langUnits / CONTENT_UNITS_REFERENCE.language.height_units))
        .map((lang, i) => ({
          id: `lang_${i}`,
          units_used: CONTENT_UNITS_REFERENCE.language.height_units,
          content: {
            langue: lang.langue,
            niveau: lang.niveau
          }
        }));
    }
  }

  // ────────────────────────────────────────────────────────
  // ÉTAPE 9 : CONSTRUCTION RÉSULTAT
  // ────────────────────────────────────────────────────────
  const adaptedContent: AdaptedContent = {
    theme_id: themeId,
    total_units_used: totalUnitsUsed,
    pages,
    sections: {
      header,
      summary,
      experiences: experiencesResult.items,
      skills: skillsResult.items,
      formation: formationResult.items,
      certifications,
      languages,
      interests: userPrefs.interests,
      footer: undefined
    },
    warnings
  };

  // ────────────────────────────────────────────────────────
  // ÉTAPE 10 : VALIDATION FINALE
  // ────────────────────────────────────────────────────────
  const validation = validateAdaptedContent(adaptedContent, theme);

  if (validation.warnings.length > 0) {
    warnings.push(...validation.warnings);
  }

  if (validation.errors.length > 0) {
    warnings.push(...validation.errors.map(err => `❌ ERROR: ${err}`));
  }

  const overflowValidation = validateNoOverflow(totalUnitsUsed, theme, pages);

  if (overflowValidation.errors.length > 0) {
    warnings.push(...overflowValidation.errors.map(err => `❌ OVERFLOW: ${err}`));
  }

  // Mettre à jour les warnings finaux
  adaptedContent.warnings = warnings;

  return adaptedContent;
}

/**
 * Générer plusieurs variantes d'un CV (multi-thèmes)
 */
export function generateMultiThemeVariants(
  ragData: RAGData,
  jobOffer: JobOffer | null,
  themeIds: ThemeId[],
  userPrefs: UserPreferences = {}
): Record<ThemeId, AdaptedContent> {
  const variants: Record<string, AdaptedContent> = {};

  for (const themeId of themeIds) {
    variants[themeId] = generateAdaptiveCV(ragData, jobOffer, themeId, userPrefs);
  }

  return variants;
}

/**
 * Obtenir un résumé rapide des capacités d'un thème
 */
export interface ThemeCapacitySummary {
  theme_id: ThemeId;
  theme_name: string;
  supports_two_pages: boolean;
  estimated_experiences_detailed: number;
  estimated_experiences_total: number;
  has_space_for_projects: boolean;
  has_space_for_interests: boolean;
}

export function getThemeCapacitySummary(themeId: ThemeId): ThemeCapacitySummary {
  const theme = getTheme(themeId);

  // Estimer nombre d'expériences détaillées
  const expCapacity = theme.zones.experiences.capacity_units;
  const detailedHeight = CONTENT_UNITS_REFERENCE.experience_detailed.height_units;
  const standardHeight = CONTENT_UNITS_REFERENCE.experience_standard.height_units;

  const estimatedDetailed = Math.floor(expCapacity / detailedHeight);
  const estimatedTotal = Math.floor(expCapacity / standardHeight);

  return {
    theme_id: themeId,
    theme_name: theme.name,
    supports_two_pages: theme.page_config.supports_two_pages,
    estimated_experiences_detailed: estimatedDetailed,
    estimated_experiences_total: estimatedTotal,
    has_space_for_projects: theme.zones.projects.capacity_units > 0,
    has_space_for_interests: theme.zones.interests.capacity_units > 0
  };
}

/**
 * Recommander un thème selon le profil utilisateur
 */
export function recommendTheme(ragData: RAGData): ThemeId {
  const experiencesCount = ragData.experiences?.length || 0;
  const hasProjects = (ragData.projets?.length || 0) > 0;

  // Junior (< 3 expériences) : compact_ats
  if (experiencesCount <= 3) {
    return "compact_ats";
  }

  // Mid (3-7 expériences) : classic
  if (experiencesCount <= 7) {
    return "classic";
  }

  // Senior (8+ expériences) : modern_spacious si projets, sinon classic
  if (hasProjects) {
    return "modern_spacious";
  }

  return "classic";
}
