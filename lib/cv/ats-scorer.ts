/**
 * ATS Scorer - Score de passage ATS (Applicant Tracking System)
 * 
 * Calcule un score de compatibilité ATS basé sur :
 * - Matching keywords (mots-clés de l'offre)
 * - Missing keywords (mots-clés manquants à prioriser)
 * - Format standardisé (dates, titres, etc.)
 * - Quantification (présence chiffres)
 */

import type { AIWidget } from "./ai-widgets";
import type { JobOfferContext } from "./relevance-scoring";

export interface ATSScoreBreakdown {
    keywordMatches: number;
    missingKeywordMatches: number;
    hasNumbers: boolean;
    hasStandardFormat: boolean;
    totalScore: number;
}

/**
 * Normalise un texte pour matching (lowercase, accents, ponctuation)
 */
function normalizeForMatch(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Supprimer accents
        .replace(/[^\w\s]/g, " ") // Remplacer ponctuation par espace
        .replace(/\s+/g, " ") // Normaliser espaces
        .trim();
}

/**
 * Vérifie si un keyword est présent dans le texte (fuzzy matching)
 */
function keywordMatches(text: string, keyword: string): boolean {
    const normalizedText = normalizeForMatch(text);
    const normalizedKeyword = normalizeForMatch(keyword);
    
    // Match exact
    if (normalizedText.includes(normalizedKeyword)) return true;
    
    // Match par mots (si keyword multi-mots)
    const keywordWords = normalizedKeyword.split(" ");
    if (keywordWords.length > 1) {
        // Tous les mots doivent être présents
        return keywordWords.every((word) => normalizedText.includes(word));
    }
    
    return false;
}

/**
 * Calcule le score ATS pour un widget
 */
export function calculateATSScoreForWidget(
    widget: AIWidget,
    jobOffer: JobOfferContext
): ATSScoreBreakdown {
    const widgetText = widget.text;
    const keywords = jobOffer.keywords || [];
    const jobOfferWithMissing = jobOffer as JobOfferContext & { missing_keywords?: string[] };
    const missingKeywords = jobOfferWithMissing.missing_keywords || [];
    
    // Compter matches keywords normaux
    let keywordMatchCount = 0;
    for (const keyword of keywords) {
        if (keywordMatches(widgetText, keyword)) {
            keywordMatchCount++;
        }
    }
    
    // Compter matches missing keywords (priorité haute)
    let missingKeywordMatchCount = 0;
    for (const keyword of missingKeywords) {
        if (keywordMatches(widgetText, keyword)) {
            missingKeywordMatchCount++;
        }
    }
    
    // Vérifier présence chiffres
    const hasNumbers = /\d/.test(widgetText);
    
    // Vérifier format standardisé (dates, titres structurés)
    const hasStandardFormat =
        /\d{4}/.test(widgetText) || // Années
        /^\w+\s+[-–]\s+\w+/.test(widgetText) || // Format "Poste - Entreprise"
        /^\d+/.test(widgetText); // Commence par chiffre
    
    // Calcul score total
    // - Missing keywords : 20 points chacun (priorité)
    // - Keywords normaux : 5 points chacun
    // - Chiffres : 10 points
    // - Format standardisé : 5 points
    const totalScore = Math.min(
        100,
        missingKeywordMatchCount * 20 +
            keywordMatchCount * 5 +
            (hasNumbers ? 10 : 0) +
            (hasStandardFormat ? 5 : 0)
    );
    
    return {
        keywordMatches: keywordMatchCount,
        missingKeywordMatches: missingKeywordMatchCount,
        hasNumbers,
        hasStandardFormat,
        totalScore,
    };
}

/**
 * Calcule le score ATS global pour un CV (tous widgets)
 */
export function calculateATSScoreForCV(
    widgets: AIWidget[],
    jobOffer: JobOfferContext & { missing_keywords?: string[] }
): {
    overallScore: number;
    breakdown: ATSScoreBreakdown;
    widgetScores: Map<string, ATSScoreBreakdown>;
} {
    const widgetScores = new Map<string, ATSScoreBreakdown>();
    let totalScore = 0;
    let totalKeywords = 0;
    let totalMissingKeywords = 0;
    let widgetsWithNumbers = 0;
    let widgetsWithStandardFormat = 0;
    
    for (const widget of widgets) {
        const score = calculateATSScoreForWidget(widget, jobOffer);
        widgetScores.set(widget.id, score);
        
        totalScore += score.totalScore;
        totalKeywords += score.keywordMatches;
        totalMissingKeywords += score.missingKeywordMatches;
        if (score.hasNumbers) widgetsWithNumbers++;
        if (score.hasStandardFormat) widgetsWithStandardFormat++;
    }
    
    const avgScore = widgets.length > 0 ? totalScore / widgets.length : 0;
    
    return {
        overallScore: Math.round(avgScore),
        breakdown: {
            keywordMatches: totalKeywords,
            missingKeywordMatches: totalMissingKeywords,
            hasNumbers: widgetsWithNumbers > widgets.length * 0.5, // >50% avec chiffres
            hasStandardFormat: widgetsWithStandardFormat > widgets.length * 0.3, // >30% format standard
            totalScore: Math.round(avgScore),
        },
        widgetScores,
    };
}
