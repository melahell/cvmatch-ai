/**
 * FONCTIONS DE SCORING & PRIORISATION
 *
 * Calcule les scores de pertinence pour les éléments du CV
 */

import { RAGExperience, JobOffer, UserPreferences, ScoredExperience } from "../types";

/**
 * Calculer le score de pertinence d'une expérience par rapport à un job offer
 */
export function calculateRelevanceScore(
  experience: RAGExperience,
  jobOffer: JobOffer | null
): number {
  if (!jobOffer) {
    return calculateDefaultScore(experience);
  }

  let score = 0;

  // 1. Match titre poste (40 points max)
  const titleMatch = calculateTextSimilarity(
    experience.poste.toLowerCase(),
    jobOffer.title.toLowerCase()
  );
  score += titleMatch * 40;

  // 2. Match compétences techniques (30 points max)
  if (jobOffer.required_skills && experience.technologies_utilisees) {
    const techMatch = calculateArrayOverlap(
      experience.technologies_utilisees.map(t => t.toLowerCase()),
      jobOffer.required_skills.map(s => s.toLowerCase())
    );
    score += techMatch * 30;
  }

  // 3. Bonus expérience récente (20 points max)
  const yearsAgo = calculateYearsAgo(experience.date_fin);
  if (yearsAgo < 2) {
    score += 20;
  } else if (yearsAgo < 5) {
    score += 10;
  } else if (yearsAgo < 8) {
    score += 5;
  }

  // 4. Match secteur (10 points max)
  if (experience.secteur && jobOffer.secteur) {
    if (experience.secteur.toLowerCase() === jobOffer.secteur.toLowerCase()) {
      score += 10;
    }
  }

  // 5. Bonus si présence dans match_analysis strengths
  if (jobOffer.match_analysis?.strengths) {
    const mentionedInStrengths = jobOffer.match_analysis.strengths.some(
      strength =>
        strength.toLowerCase().includes(experience.poste.toLowerCase()) ||
        strength.toLowerCase().includes(experience.entreprise.toLowerCase())
    );
    if (mentionedInStrengths) {
      score += 15;
    }
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculer un score par défaut (sans job offer)
 * Basé sur : ancienneté + quantifications + technologies
 */
export function calculateDefaultScore(experience: RAGExperience): number {
  let score = 50; // Score de base

  // 1. Bonus pour expérience récente
  const yearsAgo = calculateYearsAgo(experience.date_fin);
  if (yearsAgo < 2) {
    score += 30;
  } else if (yearsAgo < 5) {
    score += 20;
  } else if (yearsAgo < 8) {
    score += 10;
  } else if (yearsAgo < 12) {
    score += 5;
  }
  // Pas de points si > 12 ans

  // 2. Bonus pour nombre de réalisations
  const achievementsCount = experience.realisations?.length || 0;
  score += Math.min(achievementsCount * 3, 15);

  // 3. Bonus pour réalisations quantifiées
  const quantifiedCount = experience.realisations?.filter(r =>
    hasQuantification(r.description)
  ).length || 0;
  score += Math.min(quantifiedCount * 2, 10);

  // 4. Bonus pour technologies
  const techCount = experience.technologies_utilisees?.length || 0;
  score += Math.min(techCount * 1, 5);

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculer la priorité d'affichage (utilisée pour tri final)
 */
export function calculatePriority(
  experience: RAGExperience,
  userPrefs: UserPreferences
): number {
  // Pour l'instant, priorité = relevance_score
  // Peut être étendu avec préférences utilisateur
  return 0; // Calculé après via relevance_score
}

/**
 * Calculer similarité entre deux textes (0-1)
 * Algorithme simple basé sur mots communs
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  if (words1.length === 0 || words2.length === 0) {
    return 0;
  }

  const commonWords = words1.filter(w => words2.includes(w)).length;
  const totalWords = Math.max(words1.length, words2.length);

  return commonWords / totalWords;
}

/**
 * Calculer overlap entre deux arrays (0-1)
 */
export function calculateArrayOverlap(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 || arr2.length === 0) {
    return 0;
  }

  const set1 = new Set(arr1.map(s => s.toLowerCase()));
  const set2 = new Set(arr2.map(s => s.toLowerCase()));

  const intersection = [...set1].filter(x => set2.has(x)).length;
  const union = new Set([...set1, ...set2]).size;

  return intersection / union;
}

/**
 * Calculer nombre d'années depuis la fin d'une expérience
 */
export function calculateYearsAgo(dateFin: string | "present"): number {
  if (dateFin === "present") {
    return 0;
  }

  const endDate = parseDate(dateFin);
  const now = new Date();
  const diffMs = now.getTime() - endDate.getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);

  return Math.max(0, years);
}

/**
 * Parser une date au format flexible (YYYY, YYYY-MM, YYYY-MM-DD)
 */
export function parseDate(dateStr: string): Date {
  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }

  // Format YYYY-MM
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}-01`);
  }

  // Format YYYY
  if (/^\d{4}$/.test(dateStr)) {
    return new Date(`${dateStr}-01-01`);
  }

  // Fallback
  return new Date(dateStr);
}

/**
 * Détecter si une description contient une quantification
 */
export function hasQuantification(text: string): boolean {
  // Patterns de quantification
  const patterns = [
    /\d+%/,                    // 50%
    /\d+\s*(k|K|M|millions?)/,  // 50K, 2M, 3 millions
    /\d+\s*€/,                 // 1000€
    /\d+\s*\$/,                // $1000
    /\d+x/,                    // 2x, 10x
    /\d+\s*(fois|times)/,      // 3 fois
    /\d+\s*(mois|ans|jours|heures)/,  // 6 mois, 2 ans
    /\d+\s*(users?|utilisateurs?)/,   // 1000 users
    /\d+\s*(clients?)/,        // 50 clients
    /\d+\+/                    // 100+
  ];

  return patterns.some(pattern => pattern.test(text));
}

/**
 * Scorer toutes les expériences et les trier
 */
export function scoreAndSortExperiences(
  experiences: RAGExperience[],
  jobOffer: JobOffer | null,
  userPrefs: UserPreferences
): ScoredExperience[] {
  const scored: ScoredExperience[] = experiences.map(exp => {
    const relevance_score = calculateRelevanceScore(exp, jobOffer);
    const priority = relevance_score; // Pour l'instant, priorité = relevance
    const years_ago = calculateYearsAgo(exp.date_fin);

    return {
      ...exp,
      relevance_score,
      priority,
      years_ago
    };
  });

  // Trier par pertinence décroissante, puis par date décroissante
  scored.sort((a, b) => {
    if (a.relevance_score !== b.relevance_score) {
      return b.relevance_score - a.relevance_score;
    }
    return a.years_ago - b.years_ago; // Plus récent d'abord
  });

  return scored;
}

/**
 * Scorer une réalisation selon son impact
 */
export function scoreAchievement(achievement: string): number {
  let score = 50; // Score de base

  // +30 si quantifié
  if (hasQuantification(achievement)) {
    score += 30;
  }

  // +10 si mots-clés d'impact
  const impactKeywords = [
    "augmenté", "réduit", "optimisé", "amélioré", "développé",
    "créé", "lancé", "piloté", "dirigé", "géré",
    "increased", "reduced", "optimized", "improved", "developed",
    "created", "launched", "led", "managed"
  ];

  const hasImpactKeyword = impactKeywords.some(keyword =>
    achievement.toLowerCase().includes(keyword)
  );

  if (hasImpactKeyword) {
    score += 10;
  }

  // +10 si long (>80 chars = description détaillée)
  if (achievement.length > 80) {
    score += 10;
  }

  return Math.min(100, score);
}
