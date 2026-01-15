/**
 * FONCTIONS D'ALLOCATION DE CONTENU
 *
 * Gère l'allocation du contenu dans les zones du CV
 * avec adaptation automatique des formats
 */

import {
  RAGProfil,
  RAGExperience,
  RAGFormation,
  RAGCompetences,
  ScoredExperience,
  AdaptedExperience,
  AdaptedFormation,
  AdaptedSkillCategory,
  AdaptedSection,
  AllocationResult,
  AdaptiveRules,
  UserPreferences,
  ExperienceFormat,
  FormationFormat,
  SkillFormat
} from "../types";
import { CONTENT_UNITS_REFERENCE } from "../content-units-reference";
import { scoreAchievement } from "./scoring";

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION HEADER
// ═══════════════════════════════════════════════════════════════════════════

export function allocateHeader(
  profil: RAGProfil,
  capacityUnits: number,
  userPrefs: UserPreferences
): AdaptedSection {
  // Déterminer le format selon capacité et préférences
  let format: "minimal" | "with_contacts" | "with_photo";
  let unitsUsed: number;

  if (userPrefs.include_photo && capacityUnits >= CONTENT_UNITS_REFERENCE.header_with_photo.height_units) {
    format = "with_photo";
    unitsUsed = CONTENT_UNITS_REFERENCE.header_with_photo.height_units;
  } else if (capacityUnits >= CONTENT_UNITS_REFERENCE.header_with_contacts.height_units) {
    format = "with_contacts";
    unitsUsed = CONTENT_UNITS_REFERENCE.header_with_contacts.height_units;
  } else {
    format = "minimal";
    unitsUsed = CONTENT_UNITS_REFERENCE.header_minimal.height_units;
  }

  return {
    units_used: unitsUsed,
    content: {
      format,
      nom: profil.nom,
      prenom: profil.prenom,
      titre: profil.titre_principal,
      contact: format !== "minimal" ? profil.contact : undefined
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

export function allocateSummary(
  profil: RAGProfil,
  capacityUnits: number,
  rules: AdaptiveRules
): AdaptedSection {
  if (!profil.elevator_pitch) {
    return {
      units_used: 0,
      content: null
    };
  }

  // Déterminer format selon capacité
  let format: "short" | "standard" | "elevator";
  let unitsUsed: number;
  let text = profil.elevator_pitch;

  if (capacityUnits >= CONTENT_UNITS_REFERENCE.summary_elevator.height_units) {
    format = "elevator";
    unitsUsed = CONTENT_UNITS_REFERENCE.summary_elevator.height_units;
  } else if (capacityUnits >= CONTENT_UNITS_REFERENCE.summary_standard.height_units) {
    format = "standard";
    unitsUsed = CONTENT_UNITS_REFERENCE.summary_standard.height_units;
    // Tronquer à ~70 mots si nécessaire
    text = truncateText(text, 70);
  } else {
    format = "short";
    unitsUsed = CONTENT_UNITS_REFERENCE.summary_short.height_units;
    // Tronquer à ~40 mots
    text = truncateText(text, 40);
  }

  return {
    units_used: unitsUsed,
    content: {
      format,
      text
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION EXPÉRIENCES (CŒUR DE L'ALGORITHME)
// ═══════════════════════════════════════════════════════════════════════════

export function allocateExperiences(
  scoredExperiences: ScoredExperience[],
  capacityUnits: number,
  rules: AdaptiveRules,
  userPrefs: UserPreferences
): AllocationResult<AdaptedExperience> {
  const result: AdaptedExperience[] = [];
  const warnings: string[] = [];
  let remainingCapacity = capacityUnits;
  let detailedCount = 0;

  for (let i = 0; i < scoredExperiences.length; i++) {
    const exp = scoredExperiences[i];

    // Déterminer le format optimal
    const format = determineExperienceFormat(
      exp,
      remainingCapacity,
      detailedCount,
      rules
    );

    if (!format) {
      // Plus de place
      warnings.push(
        `⚠️ Experience "${exp.poste}" at ${exp.entreprise} excluded (no space)`
      );
      continue;
    }

    const unitsNeeded = CONTENT_UNITS_REFERENCE[`experience_${format}`].height_units;

    // Construire le contenu adapté
    const adapted: AdaptedExperience = {
      id: exp.id || `exp_${i}`,
      format,
      units_used: unitsNeeded,
      relevance_score: exp.relevance_score,
      content: {
        company: exp.entreprise,
        position: exp.poste,
        dates: formatDates(exp.date_debut, exp.date_fin),
        context: format === "detailed" ? exp.contexte : undefined,
        achievements: selectAchievements(exp.realisations || [], format, rules),
        technologies: exp.technologies_utilisees
      }
    };

    result.push(adapted);
    remainingCapacity -= unitsNeeded;

    if (format === "detailed") {
      detailedCount++;
    }

    // Stop si plus de place pour même minimal
    if (remainingCapacity < CONTENT_UNITS_REFERENCE.experience_minimal.height_units) {
      if (i < scoredExperiences.length - 1) {
        const remaining = scoredExperiences.length - i - 1;
        warnings.push(`⚠️ ${remaining} older experience${remaining > 1 ? 's' : ''} excluded`);
      }
      break;
    }
  }

  return {
    items: result,
    units_used: capacityUnits - remainingCapacity,
    warnings
  };
}

/**
 * Déterminer le format optimal pour une expérience
 */
function determineExperienceFormat(
  exp: ScoredExperience,
  remainingCapacity: number,
  detailedCount: number,
  rules: AdaptiveRules
): ExperienceFormat | null {
  // RÈGLE 1: Forcer "detailed" pour les X premières expériences
  if (
    detailedCount < rules.min_detailed_experiences &&
    remainingCapacity >= CONTENT_UNITS_REFERENCE.experience_detailed.height_units
  ) {
    return "detailed";
  }

  // RÈGLE 2: Compact après X années
  if (exp.years_ago > rules.compact_after_years) {
    if (remainingCapacity >= CONTENT_UNITS_REFERENCE.experience_compact.height_units) {
      return "compact";
    } else if (remainingCapacity >= CONTENT_UNITS_REFERENCE.experience_minimal.height_units) {
      return "minimal";
    } else {
      return null; // Pas de place
    }
  }

  // RÈGLE 3: Adapter selon espace disponible
  if (remainingCapacity >= CONTENT_UNITS_REFERENCE.experience_detailed.height_units) {
    return "detailed";
  } else if (remainingCapacity >= CONTENT_UNITS_REFERENCE.experience_standard.height_units) {
    return "standard";
  } else if (remainingCapacity >= CONTENT_UNITS_REFERENCE.experience_compact.height_units) {
    return "compact";
  } else if (remainingCapacity >= CONTENT_UNITS_REFERENCE.experience_minimal.height_units) {
    return "minimal";
  }

  return null; // Pas de place
}

/**
 * Sélectionner les réalisations selon le format
 */
function selectAchievements(
  allAchievements: Array<{ description: string; impact_score?: number }>,
  format: ExperienceFormat,
  rules: AdaptiveRules
): string[] {
  if (!allAchievements || allAchievements.length === 0) {
    return [];
  }

  // Scorer et trier les réalisations
  const scored = allAchievements.map(a => ({
    description: a.description,
    score: a.impact_score || scoreAchievement(a.description)
  }));

  scored.sort((a, b) => b.score - a.score);

  switch (format) {
    case "detailed":
      return scored
        .slice(0, Math.min(5, rules.max_bullet_points_per_exp))
        .map(a => a.description);

    case "standard":
      return scored.slice(0, 3).map(a => a.description);

    case "compact":
      // Synthèse en 1 phrase
      return [summarizeAchievements(scored.slice(0, 3).map(a => a.description))];

    case "minimal":
      return [];

    default:
      return [];
  }
}

/**
 * Résumer plusieurs réalisations en 1 phrase
 */
function summarizeAchievements(achievements: string[]): string {
  if (achievements.length === 0) return "";
  if (achievements.length === 1) return achievements[0];

  // Extraire les verbes d'action
  const actions = achievements.map(a => {
    const words = a.split(" ");
    return words[0]; // Premier mot (généralement verbe)
  });

  return `${actions.join(", ")} - ${achievements[0].split(" ").slice(1, 10).join(" ")}...`;
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION COMPÉTENCES
// ═══════════════════════════════════════════════════════════════════════════

export function allocateSkills(
  competences: RAGCompetences,
  capacityUnits: number,
  rules: AdaptiveRules
): AllocationResult<AdaptedSkillCategory> {
  const result: AdaptedSkillCategory[] = [];
  let remainingCapacity = capacityUnits;

  // Convertir explicit skills en catégories
  const categories = Object.entries(competences.explicit || {});

  for (const [category, items] of categories) {
    // Déterminer format selon capacité
    let format: SkillFormat;
    let unitsNeeded: number;
    let displayItems: string[];

    if (
      rules.skills_display_mode === "full" ||
      (rules.skills_display_mode === "auto" &&
        remainingCapacity >= CONTENT_UNITS_REFERENCE.skill_category_full.height_units)
    ) {
      format = "full";
      unitsNeeded = CONTENT_UNITS_REFERENCE.skill_category_full.height_units;
      displayItems = items.slice(0, 10);
    } else if (remainingCapacity >= CONTENT_UNITS_REFERENCE.skill_category_standard.height_units) {
      format = "standard";
      unitsNeeded = CONTENT_UNITS_REFERENCE.skill_category_standard.height_units;
      displayItems = items.slice(0, 7);
    } else if (remainingCapacity >= CONTENT_UNITS_REFERENCE.skill_category_compact.height_units) {
      format = "compact";
      unitsNeeded = CONTENT_UNITS_REFERENCE.skill_category_compact.height_units;
      displayItems = items.slice(0, 5);
    } else {
      // Plus de place
      break;
    }

    result.push({
      category,
      format,
      units_used: unitsNeeded,
      items: displayItems
    });

    remainingCapacity -= unitsNeeded;
  }

  return {
    items: result,
    units_used: capacityUnits - remainingCapacity,
    warnings: []
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION FORMATION
// ═══════════════════════════════════════════════════════════════════════════

export function allocateFormation(
  formations: RAGFormation[],
  capacityUnits: number,
  rules: AdaptiveRules
): AllocationResult<AdaptedFormation> {
  const result: AdaptedFormation[] = [];
  let remainingCapacity = capacityUnits;

  for (let i = 0; i < formations.length; i++) {
    const form = formations[i];

    // Déterminer format
    let format: FormationFormat;
    let unitsNeeded: number;

    if (
      i === 0 &&
      form.details &&
      remainingCapacity >= CONTENT_UNITS_REFERENCE.formation_detailed.height_units
    ) {
      format = "detailed";
      unitsNeeded = CONTENT_UNITS_REFERENCE.formation_detailed.height_units;
    } else if (remainingCapacity >= CONTENT_UNITS_REFERENCE.formation_standard.height_units) {
      format = "standard";
      unitsNeeded = CONTENT_UNITS_REFERENCE.formation_standard.height_units;
    } else if (remainingCapacity >= CONTENT_UNITS_REFERENCE.formation_minimal.height_units) {
      format = "minimal";
      unitsNeeded = CONTENT_UNITS_REFERENCE.formation_minimal.height_units;
    } else {
      // Plus de place
      break;
    }

    result.push({
      id: form.id || `form_${i}`,
      format,
      units_used: unitsNeeded,
      content: {
        diplome: form.diplome,
        ecole: form.ecole,
        annee: form.annee,
        details: format === "detailed" ? form.details : undefined,
        localisation: form.localisation,
        mention: form.mention
      }
    });

    remainingCapacity -= unitsNeeded;
  }

  return {
    items: result,
    units_used: capacityUnits - remainingCapacity,
    warnings: []
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Formater dates d'expérience
 */
function formatDates(debut: string, fin: string | "present"): string {
  const finFormatted = fin === "present" ? "Présent" : fin;
  return `${debut} - ${finFormatted}`;
}

/**
 * Tronquer texte à X mots
 */
function truncateText(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }
  return words.slice(0, maxWords).join(" ") + "...";
}
