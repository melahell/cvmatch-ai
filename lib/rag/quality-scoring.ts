/**
 * Quality Scoring Module
 * Multi-dimensional scoring system for RAG data quality
 */

import type { QualityMetrics } from "@/types/rag";
import { getAllClientNames } from "./consolidate-clients";

interface ScoringBreakdown {
    category: string;
    score: number;
    max: number;
    details?: string;
}

interface QualityScore {
    completeness_score: number;  // 0-100 (data presence)
    quality_score: number;        // 0-100 (data richness)
    impact_score: number;         // 0-100 (clients, certifications)
    overall_score: number;        // 0-100 (weighted average)
    breakdown: ScoringBreakdown[];
    quality_metrics: QualityMetrics;
}

/**
 * Checks if a string contains quantified data
 */
function hasQuantification(text: string | undefined | null): boolean {
    if (!text) return false;

    const patterns = [
        /\d+\s*%/,
        /\d+\s*[€$£¥]/,
        /\d+\s*(K|M|B|k|m|b)€/,
        /\d+\+/,
        /\d+\s*(projets|clients|utilisateurs|personnes|sites|pays|mois|ans|années)/i,
        /équipe\s+de\s+\d+/i,
        /budget\s+.*\d+/i,
        /(\d+)\s*→\s*(\d+)/,
    ];

    return patterns.some(pattern => pattern.test(text));
}

/**
 * Counts numbers in a string
 */
function countNumbers(text: string | undefined | null): number {
    if (!text) return 0;
    const matches = text.match(/\d+/g);
    return matches ? matches.length : 0;
}

/**
 * Calculates elevator pitch quality score (0-100)
 */
function calculateElevatorPitchQuality(elevatorPitch: string | undefined): number {
    if (!elevatorPitch) return 0;

    let score = 0;
    const length = elevatorPitch.length;
    const numbersCount = countNumbers(elevatorPitch);

    // Length (max 40 points)
    if (length >= 200 && length <= 400) {
        score += 40;
    } else if (length >= 150 && length < 200) {
        score += 30;
    } else if (length >= 100 && length < 150) {
        score += 20;
    } else if (length >= 50 && length < 100) {
        score += 10;
    }

    // Quantification (max 40 points)
    if (numbersCount >= 5) {
        score += 40;
    } else if (numbersCount >= 3) {
        score += 30;
    } else if (numbersCount >= 2) {
        score += 20;
    } else if (numbersCount >= 1) {
        score += 10;
    }

    // Structure check - 3 sentences (max 20 points)
    const sentenceCount = (elevatorPitch.match(/[.!?]+/g) || []).length;
    if (sentenceCount >= 3) {
        score += 20;
    } else if (sentenceCount === 2) {
        score += 10;
    }

    return Math.min(100, score);
}

/**
 * Calculates multi-dimensional quality score
 */
export function calculateQualityScore(ragData: any): QualityScore {
    const breakdown: ScoringBreakdown[] = [];

    // ═══════════════════════════════════════════════════════════════
    // DIMENSION 1: COMPLETENESS SCORE (Data Presence)
    // ═══════════════════════════════════════════════════════════════
    let completenessTotal = 0;

    // Identity (15 points)
    const hasCompleteIdentity = ragData?.profil?.nom && ragData?.profil?.prenom && ragData?.profil?.titre_principal;
    const identityScore = hasCompleteIdentity ? 15 : (ragData?.profil?.nom || ragData?.profil?.prenom ? 8 : 0);
    breakdown.push({
        category: "Identité",
        score: identityScore,
        max: 15,
        details: hasCompleteIdentity ? "Complet" : "Incomplet"
    });
    completenessTotal += identityScore;

    // Experiences (25 points)
    const expCount = ragData?.experiences?.length || 0;
    const expScore = Math.min(25, expCount * 8);
    breakdown.push({
        category: "Expériences (présence)",
        score: expScore,
        max: 25,
        details: `${expCount} expérience(s)`
    });
    completenessTotal += expScore;

    // Skills (20 points)
    const explicitSkills = ragData?.competences?.explicit?.techniques?.length || 0;
    const skillsScore = Math.min(20, explicitSkills * 2);
    breakdown.push({
        category: "Compétences (présence)",
        score: skillsScore,
        max: 20,
        details: `${explicitSkills} compétence(s)`
    });
    completenessTotal += skillsScore;

    // Formations (15 points)
    const formCount = ragData?.formations?.length || 0;
    const formScore = Math.min(15, formCount * 7);
    breakdown.push({
        category: "Formations",
        score: formScore,
        max: 15,
        details: `${formCount} formation(s)`
    });
    completenessTotal += formScore;

    // Languages (10 points)
    const langCount = Object.keys(ragData?.langues || {}).length;
    const langScore = langCount > 0 ? 10 : 0;
    breakdown.push({
        category: "Langues",
        score: langScore,
        max: 10,
        details: `${langCount} langue(s)`
    });
    completenessTotal += langScore;

    // Contact info (15 points)
    const hasEmail = !!ragData?.profil?.contact?.email;
    const hasPhone = !!ragData?.profil?.contact?.telephone;
    const hasLinkedin = !!ragData?.profil?.contact?.linkedin;
    const contactScore = (hasEmail ? 5 : 0) + (hasPhone ? 5 : 0) + (hasLinkedin ? 5 : 0);
    breakdown.push({
        category: "Contact",
        score: contactScore,
        max: 15,
        details: [hasEmail && "Email", hasPhone && "Tél", hasLinkedin && "LinkedIn"].filter(Boolean).join(", ") || "Aucun"
    });
    completenessTotal += contactScore;

    const completeness_score = Math.min(100, completenessTotal);

    // ═══════════════════════════════════════════════════════════════
    // DIMENSION 2: QUALITY SCORE (Data Richness)
    // ═══════════════════════════════════════════════════════════════
    let qualityTotal = 0;

    // Elevator Pitch Quality (30 points)
    const elevatorPitch = ragData?.profil?.elevator_pitch || "";
    const pitchQuality = calculateElevatorPitchQuality(elevatorPitch);
    const pitchScore = Math.round((pitchQuality / 100) * 30);
    breakdown.push({
        category: "Elevator Pitch (qualité)",
        score: pitchScore,
        max: 30,
        details: `${elevatorPitch.length} chars, ${countNumbers(elevatorPitch)} chiffres`
    });
    qualityTotal += pitchScore;

    // Quantified Impacts (40 points)
    const experiences = ragData?.experiences || [];
    let totalRealisations = 0;
    let quantifiedRealisations = 0;

    experiences.forEach((exp: any) => {
        const realisations = exp?.realisations || [];
        realisations.forEach((realisation: any) => {
            totalRealisations++;
            if (hasQuantification(realisation.impact)) {
                quantifiedRealisations++;
            }
        });
    });

    const quantificationPercentage = totalRealisations > 0
        ? (quantifiedRealisations / totalRealisations) * 100
        : 0;
    const impactsScore = Math.round((quantificationPercentage / 100) * 40);
    breakdown.push({
        category: "Impacts quantifiés",
        score: impactsScore,
        max: 40,
        details: `${quantifiedRealisations}/${totalRealisations} (${Math.round(quantificationPercentage)}%)`
    });
    qualityTotal += impactsScore;

    // Inferred Skills Quality (15 points)
    const inferredSkills = [
        ...(ragData?.competences?.inferred?.techniques || []),
        ...(ragData?.competences?.inferred?.tools || []),
        ...(ragData?.competences?.inferred?.soft_skills || [])
    ];

    const validInferredSkills = inferredSkills.filter(s =>
        s.confidence >= 60 && s.reasoning?.length >= 50 && s.sources?.length > 0
    );

    const inferredQualityPercentage = inferredSkills.length > 0
        ? (validInferredSkills.length / inferredSkills.length) * 100
        : 0;
    const inferredScore = Math.round((inferredQualityPercentage / 100) * 15);
    breakdown.push({
        category: "Compétences inférées (qualité)",
        score: inferredScore,
        max: 15,
        details: `${validInferredSkills.length}/${inferredSkills.length} valides`
    });
    qualityTotal += inferredScore;

    // Technologies/Tools diversity (15 points)
    const allTechnologies = new Set<string>();
    experiences.forEach((exp: any) => {
        exp?.technologies?.forEach((tech: string) => allTechnologies.add(tech));
    });
    const techDiversityScore = Math.min(15, allTechnologies.size);
    breakdown.push({
        category: "Technologies (diversité)",
        score: techDiversityScore,
        max: 15,
        details: `${allTechnologies.size} technologie(s) unique(s)`
    });
    qualityTotal += techDiversityScore;

    const quality_score = Math.min(100, qualityTotal);

    // ═══════════════════════════════════════════════════════════════
    // DIMENSION 3: IMPACT SCORE (Prestigious References)
    // ═══════════════════════════════════════════════════════════════
    let impactTotal = 0;

    // Clients count and diversity (60 points)
    const allClients = getAllClientNames(ragData);
    const clientsScore = Math.min(60, allClients.length * 10);
    breakdown.push({
        category: "Clients prestigieux",
        score: clientsScore,
        max: 60,
        details: `${allClients.length} client(s)`
    });
    impactTotal += clientsScore;

    // Certifications (40 points)
    const certCount = ragData?.certifications?.length || 0;
    const certScore = Math.min(40, certCount * 20);
    breakdown.push({
        category: "Certifications",
        score: certScore,
        max: 40,
        details: `${certCount} certification(s)`
    });
    impactTotal += certScore;

    const impact_score = Math.min(100, impactTotal);

    // ═══════════════════════════════════════════════════════════════
    // OVERALL SCORE (Weighted Average)
    // ═══════════════════════════════════════════════════════════════
    // Weights: Completeness 30%, Quality 50%, Impact 20%
    const overall_score = Math.round(
        completeness_score * 0.3 +
        quality_score * 0.5 +
        impact_score * 0.2
    );

    // ═══════════════════════════════════════════════════════════════
    // QUALITY METRICS
    // ═══════════════════════════════════════════════════════════════
    const avgConfidence = inferredSkills.length > 0
        ? inferredSkills.reduce((sum, s) => sum + (s.confidence || 0), 0) / inferredSkills.length
        : 0;

    const quality_metrics: QualityMetrics = {
        has_quantified_impacts: quantifiedRealisations > 0,
        quantification_percentage: Math.round(quantificationPercentage),
        clients_count: allClients.length,
        certifications_count: certCount,
        elevator_pitch_quality_score: Math.round(pitchQuality),
        inferred_skills_avg_confidence: Math.round(avgConfidence)
    };

    return {
        completeness_score,
        quality_score,
        impact_score,
        overall_score,
        breakdown,
        quality_metrics
    };
}

/**
 * Formats quality score for console logging
 */
export function formatQualityScoreReport(result: QualityScore): string {
    let report = "\n";
    report += "═══════════════════════════════════════════════════════════════\n";
    report += "RAG QUALITY SCORING REPORT\n";
    report += "═══════════════════════════════════════════════════════════════\n\n";

    report += `📊 OVERALL SCORE: ${result.overall_score}/100\n`;
    report += `   • Completeness: ${result.completeness_score}/100 (30% weight)\n`;
    report += `   • Quality: ${result.quality_score}/100 (50% weight)\n`;
    report += `   • Impact: ${result.impact_score}/100 (20% weight)\n\n`;

    report += "BREAKDOWN:\n";
    result.breakdown.forEach(item => {
        const percentage = item.max > 0 ? Math.round((item.score / item.max) * 100) : 0;
        const bar = "█".repeat(Math.floor(percentage / 5)) + "░".repeat(20 - Math.floor(percentage / 5));
        report += `  ${bar} ${item.score}/${item.max} ${item.category}\n`;
        if (item.details) {
            report += `      └─ ${item.details}\n`;
        }
    });

    report += "\nQUALITY METRICS:\n";
    report += `  • Elevator Pitch Quality: ${result.quality_metrics.elevator_pitch_quality_score}/100\n`;
    report += `  • Quantified Impacts: ${result.quality_metrics.quantification_percentage}%\n`;
    report += `  • Clients Count: ${result.quality_metrics.clients_count}\n`;
    report += `  • Certifications: ${result.quality_metrics.certifications_count}\n`;
    report += `  • Inferred Skills Avg Confidence: ${result.quality_metrics.inferred_skills_avg_confidence}%\n`;

    report += "═══════════════════════════════════════════════════════════════\n";

    return report;
}
