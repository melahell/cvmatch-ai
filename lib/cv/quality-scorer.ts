
import { CVData } from "../../components/cv/templates";
import { JobOfferContext } from "./relevance-scoring";

export interface QualityAnalysis {
    atsScore: number; // 0-100
    densityScore: number; // 0-100 (optimal around 50-80)
    densityLabel: "sparse" | "optimal" | "dense" | "overcrowded";
    readabilityScore: number; // 0-100
    details: string[];
}

/**
 * Calculates ATS Score based on:
 * 1. Keyword matching (if Job Offer present)
 * 2. Structure completeness (Standard sections present)
 * 3. File format safety (No complex graphics - assumed true for our templates)
 */
export function calculateATSScore(cvData: CVData, jobOffer?: JobOfferContext | null): number {
    let score = 100;
    const penalties: number[] = [];

    // 1. Structure Check
    if (!cvData.experiences || cvData.experiences.length === 0) penalties.push(20);
    if (!cvData.competences?.techniques || cvData.competences.techniques.length === 0) penalties.push(15);
    if (!cvData.formations || cvData.formations.length === 0) penalties.push(10);
    if (!cvData.profil?.email) penalties.push(50); // Critical

    // 2. Keyword Match (if job offer)
    if (jobOffer && jobOffer.keywords && jobOffer.keywords.length > 0) {
        const cvText = JSON.stringify(cvData).toLowerCase();
        const keywordsInfo = jobOffer.keywords.map(k => ({
            word: k.toLowerCase(),
            found: cvText.includes(k.toLowerCase())
        }));

        const foundCount = keywordsInfo.filter(k => k.found).length;
        const matchRatio = foundCount / jobOffer.keywords.length;

        // If very few keywords found, penalty
        if (matchRatio < 0.3) penalties.push(30);
        else if (matchRatio < 0.6) penalties.push(15);
        else if (matchRatio < 0.8) penalties.push(5);
    }

    // Apply penalties
    const totalPenalty = penalties.reduce((a, b) => a + b, 0);
    score = Math.max(0, score - totalPenalty);

    return Math.round(score);
}

/**
 * Calculates Density Score.
 * Ideal CV has good balance of white space.
 * 
 * Approx metric: Characters per Page.
 * Optimal A4 range: 1800 - 3200 chars.
 * Sparse < 1500
 * Dense > 3500
 */
export function calculateDensityScore(cvData: CVData, pages: number = 1): { score: number, label: QualityAnalysis["densityLabel"] } {
    const jsonStr = JSON.stringify(cvData);
    // Rough estimation of visible characters
    const charCount = jsonStr.length * 0.6; // crude heuristic

    // Normalized by pages
    const charsPerPage = charCount / pages;

    let label: QualityAnalysis["densityLabel"] = "optimal";
    let score = 90;

    if (charsPerPage < 1200) {
        label = "sparse";
        score = 60;
    } else if (charsPerPage < 2800) {
        label = "optimal";
        score = 95;
    } else if (charsPerPage < 4000) {
        label = "dense";
        score = 80;
    } else {
        label = "overcrowded";
        score = 50;
    }

    return { score, label };
}

/**
 * Main analysis function
 */
export function analyzeQuality(cvData: CVData, jobOffer?: JobOfferContext | null, totalPages: number = 1): QualityAnalysis {
    const ats = calculateATSScore(cvData, jobOffer);
    const density = calculateDensityScore(cvData, totalPages);

    const details: string[] = [];
    if (ats < 70) details.push("Score ATS faible : Vérifiez les mots-clés et sections standards");
    if (density.label === "sparse") details.push("CV peu dense : Ajoutez plus de détails");
    if (density.label === "overcrowded") details.push("CV surchargé : Pensez à aérer ou synthétiser");

    return {
        atsScore: ats,
        densityScore: density.score,
        densityLabel: density.label,
        readabilityScore: 85, // Placeholder for now
        details
    };
}
