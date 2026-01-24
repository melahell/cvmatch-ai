/**
 * Advanced Scoring - Scoring multi-critères pour widgets
 * 
 * Calcule un score composite basé sur plusieurs critères :
 * - Pertinence offre (existant)
 * - Score ATS (keywords matching)
 * - Impact métrique (présence chiffres)
 * - Récence expérience
 * - Séniorité alignée
 */

import type { AIWidget } from "./ai-widgets";
import type { JobOfferContext } from "./relevance-scoring";
import { logger } from "@/lib/utils/logger";

export interface AdvancedScoreWeights {
    relevance: number; // Poids pertinence offre (0-1)
    ats: number; // Poids score ATS (0-1)
    metrics: number; // Poids impact métrique (0-1)
    recency: number; // Poids récence (0-1)
    seniority: number; // Poids séniorité (0-1)
}

const DEFAULT_WEIGHTS: AdvancedScoreWeights = {
    relevance: 0.4, // 40% - Critère principal
    ats: 0.3, // 30% - Important pour passage ATS
    metrics: 0.15, // 15% - Impact quantifié
    recency: 0.1, // 10% - Expériences récentes
    seniority: 0.05, // 5% - Alignement séniorité
};

/**
 * Extrait les chiffres d'un texte
 */
function extractNumbers(text: string): string[] {
    return text.match(/\d[\d\s.,]*\d|\d/g) || [];
}

/**
 * Calcule le score ATS (matching keywords)
 */
function calculateATSScore(
    widget: AIWidget,
    jobKeywords: string[],
    missingKeywords: string[]
): number {
    const widgetText = widget.text.toLowerCase();
    let score = 0;
    let matches = 0;

    // Bonus pour missing keywords (priorité haute)
    for (const keyword of missingKeywords) {
        if (widgetText.includes(keyword.toLowerCase())) {
            score += 20; // Bonus important
            matches++;
        }
    }

    // Score pour keywords normaux
    for (const keyword of jobKeywords) {
        if (widgetText.includes(keyword.toLowerCase())) {
            score += 5;
            matches++;
        }
    }

    // Normaliser (max 100)
    return Math.min(100, score + (matches > 0 ? 30 : 0));
}

/**
 * Calcule le score impact métrique (présence chiffres)
 */
function calculateMetricsScore(widget: AIWidget): number {
    const numbers = extractNumbers(widget.text);
    
    if (numbers.length === 0) return 0;
    
    // Plus il y a de chiffres, meilleur le score
    // Bonus pour pourcentages, montants, volumes
    let score = numbers.length * 10;
    
    // Bonus pour pourcentages
    if (widget.text.includes("%")) score += 15;
    
    // Bonus pour montants (€, $, k€, etc.)
    if (/\d+[kK]?\s*[€$£]/.test(widget.text)) score += 15;
    
    // Bonus pour volumes (+, millions, etc.)
    if (/\+|\d+\s*(million|milliard|k|M)/i.test(widget.text)) score += 10;
    
    return Math.min(100, score);
}

/**
 * Calcule le score récence (basé sur sources.rag_experience_id)
 */
function calculateRecencyScore(
    widget: AIWidget,
    experiences: any[]
): number {
    if (!widget.sources?.rag_experience_id) return 50; // Score neutre si pas d'expérience
    
    // Extraire index depuis exp_0, exp_1, etc.
    const match = widget.sources.rag_experience_id.match(/^exp_(\d+)$/);
    if (!match) return 50;
    
    const expIndex = parseInt(match[1], 10);
    if (isNaN(expIndex) || !experiences[expIndex]) return 50;
    
    const exp = experiences[expIndex];
    
    // Calculer ancienneté
    let yearsAgo = 10; // Par défaut ancien
    if (exp.debut) {
        const start = new Date(exp.debut);
        const end = exp.actuel || !exp.fin ? new Date() : new Date(exp.fin);
        const months = Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
        yearsAgo = months / 12;
    }
    
    // Score décroissant avec ancienneté
    // 0-2 ans : 100, 2-5 ans : 80, 5-10 ans : 50, >10 ans : 20
    if (yearsAgo <= 2) return 100;
    if (yearsAgo <= 5) return 80;
    if (yearsAgo <= 10) return 50;
    return 20;
}

/**
 * Calcule le score séniorité (alignement avec niveau du poste)
 */
function calculateSeniorityScore(
    widget: AIWidget,
    jobTitle: string,
    totalYearsExperience: number
): number {
    const jobTitleLower = jobTitle.toLowerCase();
    const widgetText = widget.text.toLowerCase();
    
    // Détecter niveau du poste
    const isSenior = /senior|lead|principal|expert|director|head|chief/i.test(jobTitle);
    const isJunior = /junior|entry|débutant|stagiaire/i.test(jobTitle);
    
    // Détecter niveau dans le widget
    const widgetIsSenior = /senior|lead|principal|expert|director|head|chief|management|équipe/i.test(widgetText);
    const widgetIsJunior = /junior|entry|débutant|stagiaire|apprenti/i.test(widgetText);
    
    // Score d'alignement
    if (isSenior && widgetIsSenior) return 100;
    if (isJunior && widgetIsJunior) return 100;
    if (isSenior && !widgetIsJunior) return 80; // Pas junior = OK pour senior
    if (isJunior && !widgetIsSenior) return 80; // Pas senior = OK pour junior
    if (widgetIsSenior && !isSenior) return 60; // Widget trop senior
    if (widgetIsJunior && !isJunior) return 60; // Widget trop junior
    
    // Score basé sur années d'expérience
    if (totalYearsExperience >= 8 && isSenior) return 90;
    if (totalYearsExperience < 3 && isJunior) return 90;
    
    return 70; // Score neutre
}

/**
 * Calcule le score avancé multi-critères pour un widget
 */
export function calculateAdvancedScore(
    widget: AIWidget,
    context: {
        jobOffer?: JobOfferContext | null;
        ragProfile?: any;
        weights?: Partial<AdvancedScoreWeights>;
    }
): number {
    const weights: AdvancedScoreWeights = { ...DEFAULT_WEIGHTS, ...(context.weights || {}) };
    
    // Score pertinence (existant dans widget)
    const relevanceScore = widget.relevance_score || 50;
    
    // Score ATS
    const jobOfferWithMissing = context.jobOffer as JobOfferContext & { missing_keywords?: string[] };
    const atsScore = context.jobOffer
        ? calculateATSScore(
              widget,
              jobOfferWithMissing.keywords || [],
              jobOfferWithMissing.missing_keywords || []
          )
        : 50;
    
    // Score métriques
    const metricsScore = calculateMetricsScore(widget);
    
    // Score récence
    const recencyScore = context.ragProfile?.experiences
        ? calculateRecencyScore(widget, context.ragProfile.experiences)
        : 50;
    
    // Score séniorité
    const totalYears = context.ragProfile
        ? calculateTotalYearsExperience(context.ragProfile)
        : 0;
    const seniorityScore = context.jobOffer
        ? calculateSeniorityScore(widget, context.jobOffer.title || "", totalYears)
        : 50;
    
    // Score composite pondéré
    const compositeScore =
        relevanceScore * weights.relevance +
        atsScore * weights.ats +
        metricsScore * weights.metrics +
        recencyScore * weights.recency +
        seniorityScore * weights.seniority;
    
    return Math.round(compositeScore);
}

/**
 * Calcule le total d'années d'expérience depuis le RAG
 */
function calculateTotalYearsExperience(ragProfile: any): number {
    const experiences = ragProfile?.experiences || [];
    let totalMonths = 0;
    
    for (const exp of experiences) {
        if (exp.debut) {
            const start = new Date(exp.debut);
            const end = exp.actuel || !exp.fin ? new Date() : new Date(exp.fin);
            const months = Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
            totalMonths += months;
        }
    }
    
    return totalMonths / 12;
}

/**
 * Re-score tous les widgets avec scoring avancé
 */
export function rescoreWidgetsWithAdvanced(
    widgets: AIWidget[],
    context: {
        jobOffer?: JobOfferContext | null;
        ragProfile?: any;
        weights?: Partial<AdvancedScoreWeights>;
    }
): AIWidget[] {
    const weights: AdvancedScoreWeights = { ...DEFAULT_WEIGHTS, ...(context.weights || {}) };
    
    logger.debug("[advanced-scoring] Re-scoring widgets", {
        widgetsCount: widgets.length,
        weights,
        hasJobOffer: !!context.jobOffer,
        hasRAGProfile: !!context.ragProfile,
    });
    
    const rescored = widgets.map((widget) => {
        const originalScore = widget.relevance_score || 50;
        const advancedScore = calculateAdvancedScore(widget, context);
        
        return {
            ...widget,
            relevance_score: advancedScore,
        };
    });
    
    // Logger statistiques
    const scoreChanges = rescored.map(w => {
        const original = widgets.find(ow => ow.id === w.id)?.relevance_score || 50;
        return { id: w.id, original, advanced: w.relevance_score, delta: w.relevance_score - original };
    });
    const avgDelta = scoreChanges.reduce((sum, s) => sum + s.delta, 0) / scoreChanges.length;
    
    logger.debug("[advanced-scoring] Re-scoring terminé", {
        avgDelta: Math.round(avgDelta),
        improved: scoreChanges.filter(s => s.delta > 0).length,
        degraded: scoreChanges.filter(s => s.delta < 0).length,
    });
    
    return rescored;
}
