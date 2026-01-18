/**
 * Constantes globales de l'application CV Crush
 * Évite les magic numbers et centralise les valeurs de configuration
 */

// ==================== DASHBOARD ====================

export const DASHBOARD_CONSTANTS = {
  /** Nombre maximum de jobs recommandés affichés */
  MAX_TOP_JOBS: 10,

  /** Nombre maximum de documents affichés avant "voir plus" */
  MAX_DOCUMENTS_PREVIEW: 6,

  /** Nombre maximum de badges de compétences affichés */
  MAX_SKILLS_BADGES: 10,

  /** Seuils de score pour l'affichage des jobs */
  JOB_SCORE_THRESHOLDS: {
    EXCELLENT: 90,
    GOOD: 80,
    AVERAGE: 70,
    LOW: 60,
  },

  /** Rangs des médailles pour les top jobs */
  MEDAL_RANKS: {
    GOLD: 0,
    SILVER: 1,
    BRONZE: 2,
  },

  /** Limites pour la pagination */
  ITEMS_PER_PAGE: 20,
} as const;

// ==================== PROFIL ====================

export const PROFILE_SCORE_THRESHOLDS = {
  /** Score minimum pour considérer le profil comme faible */
  LOW: 50,

  /** Score minimum pour considérer le profil comme moyen */
  MEDIUM: 80,

  /** Score minimum pour considérer le profil comme excellent */
  HIGH: 90,
} as const;

export const PROFILE_COMPLETENESS = {
  /** Pourcentage minimum de complétion pour débloquer certaines features */
  MIN_FOR_CV_GENERATION: 60,

  /** Pourcentage cible de complétion du profil */
  TARGET: 100,
} as const;

// ==================== CV ====================

export const CV_CONSTANTS = {
  /** Templates disponibles */
  TEMPLATES: ['classic', 'modern', 'creative', 'tech'] as const,

  /** Nombre maximum d'expériences selon le template */
  MAX_EXPERIENCES: {
    MODERN_WITH_PHOTO: 4,
    MODERN_NO_PHOTO: 5,
    CLASSIC_WITH_PHOTO: 6,
    CLASSIC_NO_PHOTO: 7,
  },

  /** Niveau de compression du CV */
  COMPRESSION_LEVELS: {
    NONE: 0,
    LIGHT: 1,
    MEDIUM: 2,
    AGGRESSIVE: 3,
  },
} as const;

// ==================== ANALYSE ====================

export const ANALYSIS_CONSTANTS = {
  /** Durée de validité d'une analyse (en jours) */
  VALIDITY_DAYS: 30,

  /** Score minimum pour recommander une candidature */
  MIN_MATCH_SCORE: 70,

  /** Nombre de mots-clés minimum à extraire */
  MIN_KEYWORDS: 5,

  /** Nombre de mots-clés maximum à extraire */
  MAX_KEYWORDS: 20,
} as const;

// ==================== TRACKING ====================

export const TRACKING_STATUSES = {
  /** Statuts possibles pour une candidature */
  DRAFT: 'draft',
  APPLIED: 'applied',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
} as const;

export const TRACKING_PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
} as const;

// ==================== UI / UX ====================

export const UI_CONSTANTS = {
  /** Délais d'animation (ms) */
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 200,
    SLOW: 300,
  },

  /** Durées de toast notifications (ms) */
  TOAST_DURATION: {
    SHORT: 2000,
    NORMAL: 4000,
    LONG: 6000,
  },

  /** Tailles minimales pour l'accessibilité */
  TOUCH_TARGET_MIN_SIZE: 44, // pixels (WCAG AA)

  /** Temps avant auto-save (ms) */
  AUTO_SAVE_DELAY: 2000,

  /** Nombre d'éléments par batch lors du scroll infini */
  INFINITE_SCROLL_BATCH_SIZE: 20,
} as const;

// ==================== ACCESSIBILITÉ ====================

export const A11Y_CONSTANTS = {
  /** Ratios de contraste WCAG */
  CONTRAST_RATIO: {
    AA_NORMAL_TEXT: 4.5,
    AA_LARGE_TEXT: 3,
    AAA_NORMAL_TEXT: 7,
    AAA_LARGE_TEXT: 4.5,
  },

  /** Taille de texte considérée comme "large" (WCAG) */
  LARGE_TEXT_SIZE: 18, // pt ou 24px

  /** Taille de texte considérée comme "large" et bold */
  LARGE_BOLD_TEXT_SIZE: 14, // pt ou 18.5px
} as const;

// ==================== VALIDATION ====================

export const VALIDATION_CONSTANTS = {
  /** Longueur minimum des champs de texte */
  MIN_TEXT_LENGTH: {
    NAME: 2,
    DESCRIPTION: 10,
    EXPERIENCE_DESCRIPTION: 20,
    JOB_TITLE: 3,
  },

  /** Longueur maximum des champs de texte */
  MAX_TEXT_LENGTH: {
    NAME: 100,
    JOB_TITLE: 100,
    DESCRIPTION: 500,
    EXPERIENCE_DESCRIPTION: 2000,
    SHORT_BIO: 200,
  },

  /** Formats de fichiers acceptés */
  ACCEPTED_FILE_FORMATS: {
    DOCUMENTS: ['.pdf', '.doc', '.docx'],
    IMAGES: ['.jpg', '.jpeg', '.png', '.webp'],
  },

  /** Tailles maximales de fichiers (en MB) */
  MAX_FILE_SIZE: {
    DOCUMENT: 5,
    IMAGE: 2,
  },
} as const;

// ==================== API ====================

export const API_CONSTANTS = {
  /** Timeout pour les requêtes API (ms) */
  TIMEOUT: 30000,

  /** Nombre de retries en cas d'échec */
  MAX_RETRIES: 3,

  /** Délai entre les retries (ms) */
  RETRY_DELAY: 1000,

  /** Codes de statut HTTP */
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },
} as const;

// ==================== TYPES ====================

/** Type helper pour extraire les valeurs d'un objet const */
export type ValueOf<T> = T[keyof T];

/** Type pour les templates de CV */
export type CVTemplate = typeof CV_CONSTANTS.TEMPLATES[number];

/** Type pour les statuts de tracking */
export type TrackingStatus = ValueOf<typeof TRACKING_STATUSES>;

/** Type pour les niveaux de priorité */
export type TrackingPriority = ValueOf<typeof TRACKING_PRIORITY>;

// ==================== EXPORTS ====================

/**
 * Export d'un objet combiné pour faciliter l'import
 * Usage: import { CONSTANTS } from '@/lib/constants';
 */
export const CONSTANTS = {
  DASHBOARD: DASHBOARD_CONSTANTS,
  PROFILE: PROFILE_SCORE_THRESHOLDS,
  CV: CV_CONSTANTS,
  ANALYSIS: ANALYSIS_CONSTANTS,
  TRACKING: {
    STATUSES: TRACKING_STATUSES,
    PRIORITY: TRACKING_PRIORITY,
  },
  UI: UI_CONSTANTS,
  A11Y: A11Y_CONSTANTS,
  VALIDATION: VALIDATION_CONSTANTS,
  API: API_CONSTANTS,
} as const;
