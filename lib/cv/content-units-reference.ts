/**
 * RÉFÉRENTIEL DES HAUTEURS NORMALISÉES
 *
 * Ces valeurs sont calibrées empiriquement :
 * - 1 UNIT ≈ 4mm sur A4 (avec police standard 10-11pt)
 * - Page A4 (297mm) ≈ 200 UNITS utilisables (après marges)
 * - Ajuster ces valeurs après tests PDF réels
 *
 * NOTE: Ces valeurs sont des ESTIMATIONS initiales.
 * Utiliser le script scripts/calibrate-units.ts pour les affiner.
 */

import { ContentUnit, ContentUnitType } from "./types";

export const CONTENT_UNITS_REFERENCE: Record<ContentUnitType, ContentUnit> = {
  // ────────────────────────────────────────────────────────
  // HEADER
  // ────────────────────────────────────────────────────────
  header_minimal: {
    type: "header_minimal",
    height_units: 8,
    description: "Nom (grande police) + titre professionnel",
    typical_content: "2 lignes"
  },

  header_with_contacts: {
    type: "header_with_contacts",
    height_units: 12,
    description: "header_minimal + email + téléphone + localisation",
    typical_content: "3-4 lignes"
  },

  header_with_photo: {
    type: "header_with_photo",
    height_units: 20,
    description: "header_with_contacts + photo professionnelle carrée",
    typical_content: "Photo 4x4cm + infos"
  },

  // ────────────────────────────────────────────────────────
  // SUMMARY / PITCH
  // ────────────────────────────────────────────────────────
  summary_short: {
    type: "summary_short",
    height_units: 5,
    description: "Pitch 2 lignes maximum",
    typical_content: "30-40 mots"
  },

  summary_standard: {
    type: "summary_standard",
    height_units: 8,
    description: "Pitch 3-4 lignes",
    typical_content: "50-70 mots"
  },

  summary_elevator: {
    type: "summary_elevator",
    height_units: 12,
    description: "Pitch complet 5-6 lignes",
    typical_content: "80-100 mots"
  },

  // ────────────────────────────────────────────────────────
  // EXPÉRIENCES PROFESSIONNELLES
  // ────────────────────────────────────────────────────────
  experience_detailed: {
    type: "experience_detailed",
    height_units: 22,
    description: "Format complet : contexte entreprise + 4-5 réalisations chiffrées",
    typical_content: [
      "Titre poste (gras)",
      "Entreprise + dates (1 ligne)",
      "Contexte mission (2-3 lignes)",
      "4-5 bullet points réalisations",
      "Technologies/outils (1 ligne)"
    ].join("\n")
  },

  experience_standard: {
    type: "experience_standard",
    height_units: 15,
    description: "Format équilibré : 2-3 réalisations principales",
    typical_content: [
      "Titre poste (gras)",
      "Entreprise + dates (1 ligne)",
      "2-3 bullet points réalisations",
      "Technologies/outils (1 ligne)"
    ].join("\n")
  },

  experience_compact: {
    type: "experience_compact",
    height_units: 8,
    description: "Format condensé : description synthétique",
    typical_content: [
      "Titre poste (gras)",
      "Entreprise + dates (1 ligne)",
      "1 ligne descriptive des responsabilités",
      "Technologies principales"
    ].join("\n")
  },

  experience_minimal: {
    type: "experience_minimal",
    height_units: 4,
    description: "Format titre uniquement (pour expériences anciennes)",
    typical_content: "Titre poste | Entreprise | Dates (1 ligne)"
  },

  // ────────────────────────────────────────────────────────
  // COMPÉTENCES TECHNIQUES
  // ────────────────────────────────────────────────────────
  skill_category_full: {
    type: "skill_category_full",
    height_units: 7,
    description: "Catégorie complète avec niveaux",
    typical_content: [
      "Titre catégorie (gras)",
      "8-10 compétences avec barres de niveau",
      "ou notation étoiles"
    ].join("\n")
  },

  skill_category_standard: {
    type: "skill_category_standard",
    height_units: 5,
    description: "Catégorie standard sans niveaux détaillés",
    typical_content: [
      "Titre catégorie (gras)",
      "5-7 compétences, niveaux texte (Expert, Avancé, etc)"
    ].join("\n")
  },

  skill_category_compact: {
    type: "skill_category_compact",
    height_units: 3,
    description: "Tags visuels uniquement",
    typical_content: "Badges/tags colorés en ligne"
  },

  // ────────────────────────────────────────────────────────
  // FORMATION & CERTIFICATIONS
  // ────────────────────────────────────────────────────────
  formation_detailed: {
    type: "formation_detailed",
    height_units: 10,
    description: "Formation avec détails",
    typical_content: [
      "Diplôme (gras)",
      "École/Université",
      "Dates + localisation",
      "Cours principaux ou projets (2-3 lignes)",
      "Mention/distinctions"
    ].join("\n")
  },

  formation_standard: {
    type: "formation_standard",
    height_units: 6,
    description: "Formation standard",
    typical_content: [
      "Diplôme (gras)",
      "École/Université",
      "Dates"
    ].join("\n")
  },

  formation_minimal: {
    type: "formation_minimal",
    height_units: 3,
    description: "Formation condensée",
    typical_content: "Diplôme | École | Année (1 ligne)"
  },

  certification: {
    type: "certification",
    height_units: 3,
    description: "Certification unique",
    typical_content: "Nom certification | Organisme | Date (1 ligne)"
  },

  // ────────────────────────────────────────────────────────
  // PROJETS
  // ────────────────────────────────────────────────────────
  project_full: {
    type: "project_full",
    height_units: 10,
    description: "Projet détaillé",
    typical_content: [
      "Nom projet (gras) + lien",
      "Description (2-3 lignes)",
      "Technologies",
      "Résultats/impact"
    ].join("\n")
  },

  project_compact: {
    type: "project_compact",
    height_units: 4,
    description: "Projet condensé",
    typical_content: [
      "Nom projet (gras)",
      "1 ligne description + techno"
    ].join("\n")
  },

  // ────────────────────────────────────────────────────────
  // AUTRES SECTIONS
  // ────────────────────────────────────────────────────────
  language: {
    type: "language",
    height_units: 2,
    description: "Langue unique",
    typical_content: "Langue : Niveau (ex: Anglais : Courant - B2)"
  },

  achievement_bullet: {
    type: "achievement_bullet",
    height_units: 2,
    description: "Bullet point unique",
    typical_content: "• Réalisation chiffrée (1 ligne)"
  },

  interest_item: {
    type: "interest_item",
    height_units: 2,
    description: "Centre d'intérêt",
    typical_content: "Hobby/intérêt avec bref descriptif"
  },

  footer: {
    type: "footer",
    height_units: 5,
    description: "Pied de page",
    typical_content: "Liens réseaux sociaux ou note légale"
  }
};

/**
 * Obtenir la hauteur en units d'un type de contenu
 */
export function getContentUnitHeight(type: ContentUnitType): number {
  return CONTENT_UNITS_REFERENCE[type].height_units;
}

/**
 * Constantes calculées
 */
export const CONTENT_UNIT_CONSTANTS = {
  // Page A4
  A4_HEIGHT_MM: 297,
  A4_WIDTH_MM: 210,

  // Unité de base
  UNIT_TO_MM_DEFAULT: 4.0,

  // Capacité approximative (à affiner par thème)
  A4_USABLE_UNITS: 200,  // ≈ 297mm / 4mm - marges
  A4_USABLE_UNITS_TWO_PAGES: 400,

  // Marges typiques
  MARGIN_STANDARD_UNITS: 15,
  MARGIN_LARGE_UNITS: 30,
  MARGIN_MINIMAL_UNITS: 10,

  // Hauteurs courantes (shortcuts)
  EXPERIENCE_DETAILED: 22,
  EXPERIENCE_STANDARD: 15,
  EXPERIENCE_COMPACT: 8,
  EXPERIENCE_MINIMAL: 4,

  FORMATION_DETAILED: 10,
  FORMATION_STANDARD: 6,
  FORMATION_MINIMAL: 3,

  SKILL_CATEGORY_FULL: 7,
  SKILL_CATEGORY_STANDARD: 5,
  SKILL_CATEGORY_COMPACT: 3
} as const;

/**
 * Helper pour valider qu'un nombre d'units est valide
 */
export function validateUnits(
  units: number,
  min: number = 0,
  max: number = CONTENT_UNIT_CONSTANTS.A4_USABLE_UNITS_TWO_PAGES
): boolean {
  return units >= min && units <= max && Number.isFinite(units);
}

/**
 * Convertir units en mm selon configuration
 */
export function unitsToMm(units: number, unitToMm: number = CONTENT_UNIT_CONSTANTS.UNIT_TO_MM_DEFAULT): number {
  return units * unitToMm;
}

/**
 * Convertir mm en units selon configuration
 */
export function mmToUnits(mm: number, unitToMm: number = CONTENT_UNIT_CONSTANTS.UNIT_TO_MM_DEFAULT): number {
  return mm / unitToMm;
}
