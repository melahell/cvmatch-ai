/**
 * TYPES POUR LE SYSTÈME DE ZONES ADAPTATIVES CV
 *
 * Architecture en 3 couches :
 * 1. CONFIG : Content Units + Theme Configs
 * 2. ALGORITHME : Scoring + Allocation + Adaptation
 * 3. TEMPLATES : HTML/CSS avec variables dynamiques
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT UNITS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Types de contenu avec hauteur normalisée
 * 1 UNIT ≈ 4mm sur A4 (calibré empiriquement)
 */
export type ContentUnitType =
  // HEADER
  | "header_minimal"           // Nom + titre
  | "header_with_contacts"     // + email, tel, location
  | "header_with_photo"        // + photo

  // SUMMARY
  | "summary_short"            // 2 lignes
  | "summary_standard"         // 3-4 lignes
  | "summary_elevator"         // 5-6 lignes (pitch complet)

  // EXPERIENCES
  | "experience_detailed"      // Contexte + 4-5 réalisations
  | "experience_standard"      // 2-3 réalisations
  | "experience_compact"       // 1 ligne descriptive
  | "experience_minimal"       // Titre + dates seulement

  // COMPÉTENCES
  | "skill_category_full"      // Catégorie + 8-10 items avec niveaux
  | "skill_category_standard"  // Catégorie + 5-7 items
  | "skill_category_compact"   // Tags visuels uniquement

  // FORMATION
  | "formation_detailed"       // Avec cours/projets/mentions
  | "formation_standard"       // Titre + école + date
  | "formation_minimal"        // Titre + date

  // AUTRES
  | "project_full"             // Description + techno + lien
  | "project_compact"          // Titre + 1 ligne
  | "certification"            // Titre + date
  | "language"                 // Langue + niveau
  | "achievement_bullet"       // 1 bullet point
  | "interest_item"            // 1 centre d'intérêt
  | "footer";                  // Pied de page

/**
 * Définition d'une unité de contenu
 */
export interface ContentUnit {
  type: ContentUnitType;
  height_units: number;
  description: string;
  typical_content?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ZONES & THEMES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Noms des zones d'un CV
 */
export type CVZoneName =
  | "header"
  | "summary"
  | "experiences"
  | "skills"
  | "formation"
  | "projects"
  | "certifications"
  | "languages"
  | "interests"
  | "footer"
  | "margins";

/**
 * Stratégies de débordement
 */
export type OverflowStrategy =
  | "hide"        // Masquer contenu excédentaire
  | "compact"     // Compresser format
  | "split_page"; // Passer à page 2

/**
 * Configuration d'une zone CV
 */
export interface ZoneConfig {
  name: CVZoneName;
  capacity_units: number;     // Espace total disponible
  min_units: number;          // Minimum requis (validation)
  flex: boolean;              // Peut emprunter/prêter espace ?
  flex_priority: number;      // Priorité si redistribution (1-10)
  overflow_strategy: OverflowStrategy;
}

/**
 * Règles d'adaptation automatique
 */
export interface AdaptiveRules {
  min_detailed_experiences: number;
  prefer_detailed_for_recent: boolean;
  compact_after_years: number;
  skills_display_mode: "auto" | "full" | "compact";
  max_bullet_points_per_exp: number;
}

/**
 * Configuration visuelle (pour HTML/CSS)
 */
export interface VisualConfig {
  unit_to_mm: number;              // Conversion unit → mm
  font_sizes: {
    name: number;
    title: number;
    section_header: number;
    body: number;
    small: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  spacing_multiplier: number;
}

/**
 * Configuration complète d'un thème
 */
export interface CVThemeConfig {
  id: string;
  name: string;
  description: string;

  // Métadonnées page
  page_config: {
    total_height_units: number;      // Ex: 200 pour A4
    supports_two_pages: boolean;
    two_pages_threshold: number;     // Units min pour passer à 2 pages
  };

  // Configuration des zones
  zones: Record<CVZoneName, ZoneConfig>;

  // Règles d'adaptation
  adaptive_rules: AdaptiveRules;

  // Métadonnées visuelles
  visual_config: VisualConfig;
}

/**
 * IDs des thèmes disponibles
 */
export type ThemeId = "classic" | "modern_spacious" | "compact_ats";

// ═══════════════════════════════════════════════════════════════════════════
// CONTENU ADAPTÉ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format d'affichage d'une expérience
 */
export type ExperienceFormat = "detailed" | "standard" | "compact" | "minimal";

/**
 * Format d'affichage d'une formation
 */
export type FormationFormat = "detailed" | "standard" | "minimal";

/**
 * Format d'affichage des compétences
 */
export type SkillFormat = "full" | "standard" | "compact";

/**
 * Expérience adaptée avec format optimal
 */
export interface AdaptedExperience {
  id: string;
  format: ExperienceFormat;
  units_used: number;
  relevance_score: number;
  content: {
    company: string;
    position: string;
    dates: string;
    context?: string;          // Seulement si detailed
    achievements: string[];    // Nombre varie selon format
    technologies?: string[];
  };
}

/**
 * Catégorie de compétences adaptée
 */
export interface AdaptedSkillCategory {
  category: string;
  format: SkillFormat;
  units_used: number;
  items: string[];
}

/**
 * Formation adaptée
 */
export interface AdaptedFormation {
  id: string;
  format: FormationFormat;
  units_used: number;
  content: {
    diplome: string;
    ecole: string;
    annee: string;
    details?: string;  // Seulement si detailed
    localisation?: string;
    mention?: string;
  };
}

/**
 * Certification adaptée
 */
export interface AdaptedCertification {
  id: string;
  units_used: number;
  content: {
    nom: string;
    organisme: string;
    date: string;
  };
}

/**
 * Langue adaptée
 */
export interface AdaptedLanguage {
  id: string;
  units_used: number;
  content: {
    langue: string;
    niveau: string;
  };
}

/**
 * Projet adapté
 */
export interface AdaptedProject {
  id: string;
  format: "full" | "compact";
  units_used: number;
  content: {
    nom: string;
    description: string;
    technologies?: string[];
    lien?: string;
  };
}

/**
 * Section générique adaptée
 */
export interface AdaptedSection {
  units_used: number;
  content: any;
}

/**
 * Contenu CV complet adapté
 */
export interface AdaptedContent {
  theme_id: ThemeId;
  total_units_used: number;
  pages: number;

  sections: {
    header: AdaptedSection;
    summary: AdaptedSection;
    experiences: AdaptedExperience[];
    skills: AdaptedSkillCategory[];
    formation: AdaptedFormation[];
    projects?: AdaptedProject[];
    certifications?: AdaptedCertification[];
    languages?: AdaptedLanguage[];
    interests?: string[];
    footer?: AdaptedSection;
  };

  warnings: string[];  // "Experience X truncated", etc.
}

// ═══════════════════════════════════════════════════════════════════════════
// INPUTS UTILISATEUR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Préférences utilisateur pour la génération
 */
export interface UserPreferences {
  include_photo?: boolean;
  preferred_summary_length?: "short" | "standard" | "elevator";
  max_pages?: 1 | 2;
  interests?: string[];
  custom_notes?: string;
}

/**
 * Mode de génération CV
 */
export type CVGenerationMode = "rapid" | "optimized";

/**
 * Requête de génération CV
 */
export interface CVGenerationRequest {
  user_id: string;
  job_analysis_id?: string;
  theme_id: ThemeId;
  mode: CVGenerationMode;
  user_prefs?: UserPreferences;
}

/**
 * Réponse de génération CV
 */
export interface CVGenerationResponse {
  success: boolean;
  cv_id?: string;
  url?: string;
  metadata: {
    mode: CVGenerationMode;
    pages: number;
    total_units: number;
    warnings: string[];
    generation_time_ms: number;
  };
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES RAG (Import depuis types existants)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Expérience RAG (structure source)
 */
export interface RAGExperience {
  id?: string;
  poste: string;
  entreprise: string;
  date_debut: string;
  date_fin: string | "present";
  contexte?: string;
  realisations: Array<{
    description: string;
    impact_score?: number;
  }>;
  technologies_utilisees?: string[];
  secteur?: string;
}

/**
 * Formation RAG
 */
export interface RAGFormation {
  id?: string;
  diplome: string;
  ecole: string;
  annee: string;
  details?: string;
  localisation?: string;
  mention?: string;
}

/**
 * Compétences RAG
 */
export interface RAGCompetences {
  explicit: Record<string, string[]>;
  inferred?: Array<{
    nom: string;
    niveau: string;
    confiance: number;
    raisonnement?: string;
  }>;
}

/**
 * Profil RAG
 */
export interface RAGProfil {
  nom: string;
  prenom: string;
  titre_principal: string;
  elevator_pitch?: string;
  contact?: {
    email: string;
    telephone?: string;
    linkedin?: string;
    localisation?: string;
  };
  langues?: Array<{
    langue: string;
    niveau: string;
  }>;
}

/**
 * Données RAG complètes
 */
export interface RAGData {
  profil: RAGProfil;
  experiences: RAGExperience[];
  competences: RAGCompetences;
  formations_certifications: {
    formations: RAGFormation[];
    certifications?: Array<{
      nom: string;
      organisme: string;
      date: string;
    }>;
  };
  projets?: Array<{
    nom: string;
    description: string;
    technologies?: string[];
    lien?: string;
  }>;
}

/**
 * Job Offer (pour scoring)
 */
export interface JobOffer {
  id: string;
  title: string;
  company?: string;
  description: string;
  required_skills?: string[];
  secteur?: string;
  match_analysis?: {
    match_score: number;
    strengths: string[];
    gaps: string[];
    missing_keywords: string[];
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCORING & PRIORISATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Expérience avec score de pertinence
 */
export interface ScoredExperience extends RAGExperience {
  relevance_score: number;
  priority: number;
  years_ago: number;
}

/**
 * Résultat d'allocation
 */
export interface AllocationResult<T> {
  items: T[];
  units_used: number;
  warnings: string[];
}
