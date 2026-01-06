/**
 * Validation pré-génération CV
 *
 * Valide la qualité des données RAG avant de générer le CV
 * Non-bloquant : retourne des warnings mais permet la génération
 */

export interface PreGenerationWarning {
    severity: 'warning' | 'info';
    category: 'elevator_pitch' | 'quantification' | 'experiences' | 'competences' | 'quality_score';
    message: string;
    recommendation: string;
}

export interface PreGenerationValidationResult {
    canGenerate: boolean; // Toujours true (non-bloquant)
    warnings: PreGenerationWarning[];
    qualityIndicators: {
        hasElevatorPitch: boolean;
        hasQuantifiedImpacts: boolean;
        experienceCount: number;
        competenceCount: number;
        overallQualityScore: number;
    };
}

/**
 * Valide les données RAG avant génération du CV
 */
export function validatePreGeneration(ragData: any): PreGenerationValidationResult {
    const warnings: PreGenerationWarning[] = [];

    // Extract data
    const profile = ragData.completeness_details || ragData;
    const experiences = profile.experiences || [];
    const competences = profile.competences || {};
    const elevatorPitch = profile.profil?.elevator_pitch;
    const qualityMetrics = profile.quality_metrics;

    // Indicators
    const indicators = {
        hasElevatorPitch: false,
        hasQuantifiedImpacts: false,
        experienceCount: experiences.length,
        competenceCount: (competences.explicit?.techniques?.length || 0) + (competences.inferred?.techniques?.length || 0),
        overallQualityScore: 0
    };

    // 1. Check elevator pitch
    if (!elevatorPitch || elevatorPitch.length < 100) {
        warnings.push({
            severity: 'warning',
            category: 'elevator_pitch',
            message: 'Elevator pitch absent ou trop court',
            recommendation: 'Ajouter un elevator pitch de 200-400 caractères pour améliorer l\'impact du CV'
        });
    } else {
        indicators.hasElevatorPitch = true;
    }

    // 2. Check quantification
    if (qualityMetrics?.quantification_percentage && qualityMetrics.quantification_percentage < 60) {
        warnings.push({
            severity: 'warning',
            category: 'quantification',
            message: `Quantification des impacts insuffisante (${qualityMetrics.quantification_percentage}% < 60%)`,
            recommendation: 'Ajouter des chiffres et résultats mesurables aux réalisations professionnelles'
        });
    } else if (qualityMetrics?.has_quantified_impacts) {
        indicators.hasQuantifiedImpacts = true;
    }

    // 3. Check experiences
    if (experiences.length === 0) {
        warnings.push({
            severity: 'warning',
            category: 'experiences',
            message: 'Aucune expérience professionnelle détectée',
            recommendation: 'Ajouter au moins une expérience pour générer un CV complet'
        });
    } else if (experiences.length < 2) {
        warnings.push({
            severity: 'info',
            category: 'experiences',
            message: 'Une seule expérience détectée',
            recommendation: 'Ajouter d\'autres expériences si disponibles pour renforcer le profil'
        });
    }

    // 4. Check competences
    if (indicators.competenceCount < 5) {
        warnings.push({
            severity: 'warning',
            category: 'competences',
            message: `Peu de compétences détectées (${indicators.competenceCount})`,
            recommendation: 'Enrichir le profil avec davantage de compétences techniques et soft skills'
        });
    }

    // 5. Calculate overall quality score
    const qualityScore = qualityMetrics?.quality_score?.overall_score || 0;
    indicators.overallQualityScore = qualityScore;

    if (qualityScore > 0 && qualityScore < 50) {
        warnings.push({
            severity: 'warning',
            category: 'quality_score',
            message: `Score de qualité RAG faible (${qualityScore}/100)`,
            recommendation: 'Réimporter les documents avec plus de détails sur les réalisations et chiffres clés'
        });
    }

    // Always allow generation (non-blocking)
    return {
        canGenerate: true,
        warnings,
        qualityIndicators: indicators
    };
}

/**
 * Format warnings for display/logging
 */
export function formatWarnings(result: PreGenerationValidationResult): string[] {
    return result.warnings.map(w =>
        `[${w.severity.toUpperCase()}] ${w.message} → ${w.recommendation}`
    );
}
