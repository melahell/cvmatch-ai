/**
 * CV Generation Pipeline - CDC CV Parfait
 * 
 * Pipeline unifié qui intègre tous les composants:
 * - Schema Transformer (RAG → CVOptimized)
 * - Layout Engine (calcul espace)
 * - Compressor (compression adaptative)
 */

import { CVOptimized, SeniorityLevel, SENIORITY_RULES } from '@/types/cv-optimized';
import { transformRAGToOptimized, extractJobKeywords } from './schema-transformer';
import { estimateLayout, determineCompressionLevel } from './layout-engine';
import { compressCV, autoCompressCV, CompressionResult } from './compressor';

// =============================================================================
// TYPES
// =============================================================================

export interface CVGenerationInput {
    ragData: any;           // Données RAG brutes
    jobDescription: string; // Offre d'emploi
    matchReport?: any;      // Rapport de match (optionnel)
    customNotes?: string;   // Notes personnelles
    templateId?: string;    // Template choisi
    includePhoto?: boolean; // Inclure photo
}

export interface CVGenerationOutput {
    cv: CVOptimized;
    compression: {
        level: number;
        actions: string[];
        reason: string;
    };
    layout: {
        pages: number;
        overflow_warning: boolean;
    };
    metadata: {
        seniority: SeniorityLevel;
        sector: string;
        experience_years: number;
    };
}

// =============================================================================
// PIPELINE PRINCIPAL
// =============================================================================

/**
 * Génère un CV optimisé avec le pipeline complet
 */
export function generateOptimizedCV(input: CVGenerationInput): CVGenerationOutput {
    const {
        ragData,
        jobDescription,
        matchReport,
        templateId = 'modern',
        includePhoto = true
    } = input;

    // Étape 1: Transformer RAG → CVOptimized
    const initialCV = transformRAGToOptimized(ragData, matchReport, templateId);

    // Étape 2: Détecter le niveau de compression nécessaire
    const { level: compressionLevel, reason: compressionReason } = determineCompressionLevel(
        initialCV,
        includePhoto,
        initialCV.cv_metadata.seniority_level
    );

    // Étape 3: Appliquer la compression si nécessaire
    let finalCV = initialCV;
    let compressionActions: string[] = [];

    if (compressionLevel > 0) {
        const compressionResult = compressCV(initialCV, {
            target_pages: SENIORITY_RULES[initialCV.cv_metadata.seniority_level].maxPages,
            seniority_level: initialCV.cv_metadata.seniority_level,
            include_photo: includePhoto,
            force_level: compressionLevel
        });

        finalCV = compressionResult.cv;
        compressionActions = compressionResult.actions_taken;
    }

    // Étape 4: Calculer le layout final
    const finalLayout = estimateLayout(finalCV, {
        include_photo: includePhoto,
        dense_mode: compressionLevel >= 1,
        compression_level: compressionLevel
    });

    // Calculer les années d'expérience
    const experienceYears = calculateExperienceYears(ragData.experiences || []);

    return {
        cv: finalCV,
        compression: {
            level: compressionLevel,
            actions: compressionActions,
            reason: compressionReason
        },
        layout: {
            pages: finalLayout.page_count,
            overflow_warning: finalLayout.overflow_mm > 0 && finalLayout.page_count === 1
        },
        metadata: {
            seniority: finalCV.cv_metadata.seniority_level,
            sector: finalCV.cv_metadata.sector_detected || 'other',
            experience_years: experienceYears
        }
    };
}

/**
 * Calcule le total des années d'expérience
 */
function calculateExperienceYears(experiences: any[]): number {
    let totalMonths = 0;

    for (const exp of experiences) {
        if (exp.debut) {
            const start = new Date(exp.debut);
            const end = exp.actuel || !exp.fin ? new Date() : new Date(exp.fin);
            totalMonths += Math.max(0,
                (end.getFullYear() - start.getFullYear()) * 12 +
                (end.getMonth() - start.getMonth())
            );
        }
    }

    return Math.round(totalMonths / 12 * 10) / 10;
}

/**
 * Convertit CVOptimized vers le format legacy pour compatibilité templates actuels
 */
export function convertToLegacyFormat(cv: CVOptimized): any {
    return {
        profil: {
            nom: cv.identity.nom,
            prenom: cv.identity.prenom,
            titre_principal: cv.identity.titre_vise,
            photo_url: cv.identity.photo_url,
            email: cv.identity.contact.email,
            telephone: cv.identity.contact.telephone,
            localisation: cv.identity.contact.ville,
            linkedin: cv.identity.contact.linkedin,
            elevator_pitch: cv.elevator_pitch.text
        },
        experiences: cv.experiences
            .filter(exp => exp.display)
            .map(exp => ({
                poste: exp.poste,
                entreprise: exp.entreprise,
                debut: exp.debut,
                fin: exp.fin,
                actuel: exp.actuel,
                lieu: exp.localisation,
                realisations: exp.realisations
                    .filter(r => r.display)
                    .map(r => r.description),
                technologies: exp.technologies
            })),
        competences: {
            techniques: cv.competences.techniques_flat ||
                cv.competences.categories
                    .filter(c => c.nom.includes('Technique'))
                    .flatMap(c => c.items.map(i => i.nom)),
            soft_skills: cv.competences.soft_skills_flat ||
                cv.competences.categories
                    .filter(c => !c.nom.includes('Technique'))
                    .flatMap(c => c.items.map(i => i.nom))
        },
        formations: cv.formations
            .filter(f => f.display)
            .map(f => ({
                diplome: f.titre,
                ecole: f.organisme,
                annee: f.date
            })),
        langues: cv.langues.reduce((acc, l) => {
            acc[l.langue] = l.niveau;
            return acc;
        }, {} as Record<string, string>),
        // Métadonnées CDC
        cv_metadata: cv.cv_metadata,
        optimizations_applied: cv.cv_metadata.optimizations_applied
    };
}

/**
 * Génère les props pour le template basées sur le niveau de compression
 * Accepte soit un CVOptimized complet, soit juste les cv_metadata
 */
export function getTemplateProps(cvOrMetadata: CVOptimized | { compression_level_applied?: number } | null | undefined): {
    dense: boolean;
    ultraCompact: boolean;
    showTechnologies: boolean;
    maxBullets: number;
    fontSize: 'normal' | 'small' | 'tiny';
} {
    // Handle null/undefined
    if (!cvOrMetadata) {
        return {
            dense: false,
            ultraCompact: false,
            showTechnologies: true,
            maxBullets: 4,
            fontSize: 'normal'
        };
    }

    // Extract compression level from either full CV or metadata object
    const compressionLevel = 'cv_metadata' in cvOrMetadata
        ? cvOrMetadata.cv_metadata?.compression_level_applied ?? 0
        : cvOrMetadata.compression_level_applied ?? 0;

    return {
        dense: compressionLevel >= 1,
        ultraCompact: compressionLevel >= 3,
        showTechnologies: compressionLevel < 3,
        maxBullets: compressionLevel >= 3 ? 2 : (compressionLevel >= 2 ? 3 : 4),
        fontSize: compressionLevel >= 3 ? 'tiny' : (compressionLevel >= 1 ? 'small' : 'normal')
    };
}

/**
 * Génère un rapport de génération pour debugging
 */
export function generateGenerationReport(output: CVGenerationOutput): string {
    const lines: string[] = [
        '=== CV Generation Report ===',
        '',
        `Séniorité détectée: ${output.metadata.seniority} (${output.metadata.experience_years} ans)`,
        `Secteur détecté: ${output.metadata.sector}`,
        '',
        `Pages: ${output.layout.pages}`,
        `Compression: Niveau ${output.compression.level} (${output.compression.reason})`,
        ''
    ];

    if (output.compression.actions.length > 0) {
        lines.push('Actions de compression:');
        output.compression.actions.forEach(action => {
            lines.push(`  • ${action}`);
        });
    }

    if (output.layout.overflow_warning) {
        lines.push('');
        lines.push('⚠️ Warning: Le CV déborde légèrement, vérifier le rendu');
    }

    lines.push('');
    lines.push('Expériences affichées:');
    output.cv.experiences.filter(e => e.display).forEach(exp => {
        lines.push(`  • ${exp.poste} @ ${exp.entreprise} (score: ${exp.pertinence_score})`);
    });

    return lines.join('\n');
}
