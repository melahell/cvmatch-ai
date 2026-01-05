/**
 * Quality Metrics - CDC CV Parfait
 * 
 * Calcule les scores de qualité d'un CV:
 * - Score ATS (présence keywords, format)
 * - Score Densité (quantifications, contenu substantiel)
 * - Score Cohérence (structure, hiérarchie)
 */

import { CVOptimized, SectorProfile, SECTOR_PROFILES } from '@/types/cv-optimized';

// =============================================================================
// TYPES
// =============================================================================

export interface QualityScore {
    overall: number;        // 0-100
    ats: ATSScore;
    density: DensityScore;
    coherence: CoherenceScore;
    warnings: string[];
    suggestions: string[];
}

export interface ATSScore {
    score: number;          // 0-100
    keywords_found: number;
    keywords_total: number;
    format_issues: string[];
    missing_keywords: string[];
}

export interface DensityScore {
    score: number;          // 0-100
    quantified_bullets_percent: number;
    average_bullet_length: number;
    experiences_with_impact: number;
}

export interface CoherenceScore {
    score: number;          // 0-100
    has_elevator_pitch: boolean;
    chronological_order: boolean;
    skills_match_experience: boolean;
    complete_contact: boolean;
}

// =============================================================================
// KEYWORDS ATS PAR SECTEUR
// =============================================================================

const ATS_KEYWORDS: Record<SectorProfile, string[]> = {
    finance: [
        'audit', 'conformité', 'compliance', 'risque', 'budget', 'roi', 'kpi',
        'reporting', 'bilan', 'analyse financière', 'contrôle de gestion',
        'réglementaire', 'amf', 'bâle', 'solvabilité'
    ],
    tech: [
        'agile', 'scrum', 'devops', 'ci/cd', 'cloud', 'aws', 'azure', 'api',
        'microservices', 'docker', 'kubernetes', 'git', 'rest', 'sql',
        'javascript', 'python', 'react', 'node.js', 'typescript'
    ],
    pharma: [
        'gxp', 'glp', 'gmp', 'gcp', 'fda', 'ema', 'validation', 'qualification',
        'csv', 'audit', 'qualité', 'réglementaire', 'ich', 'pharmacovigilance',
        'essais cliniques', 'conformité'
    ],
    conseil: [
        'stratégie', 'transformation', 'change management', 'conduite du changement',
        'business case', 'roadmap', 'stakeholder', 'c-level', 'comex',
        'due diligence', 'pmo', 'programme'
    ],
    luxe: [
        'excellence', 'qualité', 'client', 'expérience', 'premium', 'retail',
        'merchandising', 'crm', 'fidélisation', 'omnicanal'
    ],
    industrie: [
        'lean', 'six sigma', 'production', 'supply chain', 'logistique',
        'qualité', 'sécurité', 'maintenance', 'amélioration continue',
        'kaizen', 'smed', '5s'
    ],
    other: [
        'gestion de projet', 'management', 'équipe', 'coordination', 'pilotage',
        'budget', 'délai', 'qualité', 'reporting', 'kpi'
    ]
};

// =============================================================================
// CALCUL SCORE ATS
// =============================================================================

/**
 * Calcule le score ATS d'un CV
 */
export function calculateATSScore(
    cv: CVOptimized,
    jobDescription?: string
): ATSScore {
    const sector = cv.cv_metadata.sector_detected || 'other';
    const sectorKeywords = ATS_KEYWORDS[sector] || ATS_KEYWORDS.other;

    // Collecter tout le texte du CV
    const cvText = collectCVText(cv).toLowerCase();

    // Ajouter les keywords de l'offre si fournie
    const jobKeywords = jobDescription
        ? extractKeywordsFromJob(jobDescription, sectorKeywords)
        : [];

    const allKeywords = Array.from(new Set([...sectorKeywords, ...jobKeywords]));

    // Compter les keywords trouvés
    const foundKeywords = allKeywords.filter(kw =>
        cvText.includes(kw.toLowerCase())
    );

    const missingKeywords = allKeywords
        .filter(kw => !cvText.includes(kw.toLowerCase()))
        .slice(0, 5); // Top 5 manquants

    // Vérifier les problèmes de format
    const formatIssues: string[] = [];

    if (!cv.identity.contact.email) {
        formatIssues.push('Email manquant');
    }
    if (!cv.identity.contact.telephone) {
        formatIssues.push('Téléphone manquant');
    }
    if (cv.experiences.filter(e => e.display).length === 0) {
        formatIssues.push('Aucune expérience visible');
    }

    // Calculer score
    const keywordScore = (foundKeywords.length / allKeywords.length) * 60;
    const formatScore = Math.max(0, 40 - (formatIssues.length * 10));

    return {
        score: Math.round(Math.min(100, keywordScore + formatScore)),
        keywords_found: foundKeywords.length,
        keywords_total: allKeywords.length,
        format_issues: formatIssues,
        missing_keywords: missingKeywords
    };
}

/**
 * Collecte tout le texte d'un CV
 */
function collectCVText(cv: CVOptimized): string {
    const parts: string[] = [];

    // Identity
    parts.push(cv.identity.titre_vise || '');

    // Elevator pitch
    if (cv.elevator_pitch.included) {
        parts.push(cv.elevator_pitch.text);
    }

    // Experiences
    cv.experiences.filter(e => e.display).forEach(exp => {
        parts.push(exp.poste);
        parts.push(exp.entreprise);
        exp.realisations.filter(r => r.display).forEach(r => {
            parts.push(r.description);
        });
        parts.push(...exp.technologies);
    });

    // Competences
    cv.competences.categories.forEach(cat => {
        cat.items.forEach(item => {
            parts.push(item.nom);
        });
    });

    return parts.join(' ');
}

/**
 * Extrait les keywords d'une offre d'emploi
 */
function extractKeywordsFromJob(jobDescription: string, baseKeywords: string[]): string[] {
    const jobLower = jobDescription.toLowerCase();
    return baseKeywords.filter(kw => jobLower.includes(kw.toLowerCase()));
}

// =============================================================================
// CALCUL SCORE DENSITÉ
// =============================================================================

/**
 * Calcule le score de densité d'information
 */
export function calculateDensityScore(cv: CVOptimized): DensityScore {
    const displayedExperiences = cv.experiences.filter(e => e.display);
    const displayedRealisations = displayedExperiences.flatMap(e =>
        e.realisations.filter(r => r.display)
    );

    // Calculer % de bullets quantifiés
    const quantifiedBullets = displayedRealisations.filter(r => r.quantification);
    const quantifiedPercent = displayedRealisations.length > 0
        ? (quantifiedBullets.length / displayedRealisations.length) * 100
        : 0;

    // Calculer longueur moyenne des bullets
    const totalLength = displayedRealisations.reduce((sum, r) => sum + r.char_count, 0);
    const avgLength = displayedRealisations.length > 0
        ? totalLength / displayedRealisations.length
        : 0;

    // Expériences avec impact
    const experiencesWithImpact = displayedExperiences.filter(exp =>
        exp.realisations.some(r => r.display && r.quantification)
    ).length;

    // Calculer score
    let score = 0;

    // Score quantification (40 pts)
    score += Math.min(40, quantifiedPercent * 0.67);

    // Score longueur moyenne (30 pts) - idéal entre 80-150 chars
    if (avgLength >= 80 && avgLength <= 150) {
        score += 30;
    } else if (avgLength >= 50 && avgLength <= 200) {
        score += 20;
    } else if (avgLength >= 30) {
        score += 10;
    }

    // Score expériences avec impact (30 pts)
    score += Math.min(30, (experiencesWithImpact / Math.max(1, displayedExperiences.length)) * 30);

    return {
        score: Math.round(score),
        quantified_bullets_percent: Math.round(quantifiedPercent),
        average_bullet_length: Math.round(avgLength),
        experiences_with_impact: experiencesWithImpact
    };
}

// =============================================================================
// CALCUL SCORE COHÉRENCE
// =============================================================================

/**
 * Calcule le score de cohérence du CV
 */
export function calculateCoherenceScore(cv: CVOptimized): CoherenceScore {
    let score = 0;

    // Elevator pitch présent (25 pts)
    const hasElevatorPitch = cv.elevator_pitch.included && cv.elevator_pitch.text.length > 50;
    if (hasElevatorPitch) score += 25;

    // Ordre chronologique (25 pts)
    const experiences = cv.experiences.filter(e => e.display);
    let chronologicalOrder = true;
    for (let i = 1; i < experiences.length; i++) {
        if (experiences[i].debut > experiences[i - 1].debut) {
            chronologicalOrder = false;
            break;
        }
    }
    if (chronologicalOrder) score += 25;

    // Skills match experiences (25 pts)
    const expTechnologies = new Set(
        experiences.flatMap(e => e.technologies.map(t => t.toLowerCase()))
    );
    const skills = cv.competences.categories.flatMap(c =>
        c.items.map(i => i.nom.toLowerCase())
    );
    const matchingSkills = skills.filter((s: string) =>
        Array.from(expTechnologies).some((t: string) => t.includes(s) || s.includes(t))
    );
    const skillsMatchExperience = skills.length > 0
        ? (matchingSkills.length / skills.length) > 0.3
        : true;
    if (skillsMatchExperience) score += 25;

    // Contact complet (25 pts)
    const completeContact = !!(
        cv.identity.contact.email &&
        cv.identity.contact.ville
    );
    if (completeContact) score += 25;

    return {
        score,
        has_elevator_pitch: hasElevatorPitch,
        chronological_order: chronologicalOrder,
        skills_match_experience: skillsMatchExperience,
        complete_contact: completeContact
    };
}

// =============================================================================
// FONCTION PRINCIPALE
// =============================================================================

/**
 * Calcule tous les scores de qualité d'un CV
 */
export function calculateQualityScore(
    cv: CVOptimized,
    jobDescription?: string
): QualityScore {
    const ats = calculateATSScore(cv, jobDescription);
    const density = calculateDensityScore(cv);
    const coherence = calculateCoherenceScore(cv);

    // Score global pondéré
    const overall = Math.round(
        ats.score * 0.4 +
        density.score * 0.35 +
        coherence.score * 0.25
    );

    // Générer warnings
    const warnings: string[] = [];

    if (ats.score < 50) {
        warnings.push('Score ATS faible - ajouter plus de mots-clés du secteur');
    }
    if (density.quantified_bullets_percent < 40) {
        warnings.push('Moins de 40% des réalisations sont quantifiées');
    }
    if (!coherence.has_elevator_pitch) {
        warnings.push('Elevator pitch manquant ou trop court');
    }
    if (ats.format_issues.length > 0) {
        warnings.push(...ats.format_issues);
    }

    // Générer suggestions
    const suggestions: string[] = [];

    if (ats.missing_keywords.length > 0) {
        suggestions.push(`Ajouter ces keywords: ${ats.missing_keywords.slice(0, 3).join(', ')}`);
    }
    if (density.average_bullet_length < 60) {
        suggestions.push('Développer les réalisations avec plus de détails');
    }
    if (density.average_bullet_length > 180) {
        suggestions.push('Raccourcir les réalisations pour plus de lisibilité');
    }
    if (!coherence.complete_contact) {
        suggestions.push('Compléter les informations de contact');
    }

    return {
        overall,
        ats,
        density,
        coherence,
        warnings,
        suggestions
    };
}

/**
 * Génère un rapport de qualité formaté
 */
export function generateQualityReport(score: QualityScore): string {
    const lines: string[] = [
        '=== Rapport Qualité CV ===',
        '',
        `Score Global: ${score.overall}/100`,
        '',
        `📊 Score ATS: ${score.ats.score}/100`,
        `   Keywords: ${score.ats.keywords_found}/${score.ats.keywords_total}`,
        '',
        `📝 Score Densité: ${score.density.score}/100`,
        `   Bullets quantifiés: ${score.density.quantified_bullets_percent}%`,
        `   Longueur moyenne: ${score.density.average_bullet_length} chars`,
        '',
        `🔗 Score Cohérence: ${score.coherence.score}/100`,
        `   Elevator pitch: ${score.coherence.has_elevator_pitch ? '✓' : '✗'}`,
        `   Ordre chrono: ${score.coherence.chronological_order ? '✓' : '✗'}`,
        ''
    ];

    if (score.warnings.length > 0) {
        lines.push('⚠️ Avertissements:');
        score.warnings.forEach(w => lines.push(`   • ${w}`));
        lines.push('');
    }

    if (score.suggestions.length > 0) {
        lines.push('💡 Suggestions:');
        score.suggestions.forEach(s => lines.push(`   • ${s}`));
    }

    return lines.join('\n');
}

/**
 * Vérifie si un CV passe la validation minimale
 */
export function validateCVQuality(cv: CVOptimized): {
    valid: boolean;
    blocking_issues: string[];
} {
    const issues: string[] = [];

    // Vérifications bloquantes
    if (!cv.identity.nom || !cv.identity.prenom) {
        issues.push('Nom ou prénom manquant');
    }

    if (!cv.identity.contact.email) {
        issues.push('Email manquant');
    }

    if (cv.experiences.filter(e => e.display).length === 0) {
        issues.push('Aucune expérience affichée');
    }

    const displayedRealisations = cv.experiences
        .filter(e => e.display)
        .flatMap(e => e.realisations.filter(r => r.display));

    if (displayedRealisations.length === 0) {
        issues.push('Aucune réalisation affichée');
    }

    return {
        valid: issues.length === 0,
        blocking_issues: issues
    };
}
