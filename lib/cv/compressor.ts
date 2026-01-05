/**
 * CV Compressor - CDC CV Parfait
 * 
 * Applique les niveaux de compression sur un CVOptimized
 * pour qu'il tienne sur le nombre de pages souhaité.
 */

import {
    CVOptimized,
    ExperienceOptimized,
    RealisationOptimized,
    SeniorityLevel,
    SENIORITY_RULES,
    CompressionLevel,
    COMPRESSION_LEVELS
} from '@/types/cv-optimized';

import { estimateLayout, determineCompressionLevel, LayoutOptions } from './layout-engine';

// =============================================================================
// TYPES
// =============================================================================

export interface CompressionResult {
    cv: CVOptimized;
    compression_applied: number;
    actions_taken: string[];
    final_page_count: number;
    warnings: string[];
}

export interface CompressionOptions {
    target_pages: number;
    seniority_level: SeniorityLevel;
    include_photo: boolean;
    force_level?: number;
}

// =============================================================================
// FONCTIONS DE COMPRESSION PAR NIVEAU
// =============================================================================

/**
 * Niveau 1: Compression douce
 * - Utilise les descriptions courtes
 * - Réduit les espacements (géré par le template)
 */
function applyLevel1(cv: CVOptimized): string[] {
    const actions: string[] = [];

    // Utiliser descriptions courtes pour les réalisations
    cv.experiences.forEach(exp => {
        exp.realisations.forEach(real => {
            if (real.description_short && real.char_count > 100) {
                real.description = real.description_short;
                real.char_count = real.description.length;
            }
        });
    });

    actions.push('Descriptions réduites à la version courte');
    actions.push('Espacement inter-sections réduit');

    return actions;
}

/**
 * Niveau 2: Compression modérée
 * - Limite à 3 bullets par expérience
 * - Fusionne les catégories de compétences
 * - Utilise les titres courts pour formations
 */
function applyLevel2(cv: CVOptimized): string[] {
    const actions: string[] = [];

    // Limiter les bullets par expérience
    cv.experiences.forEach(exp => {
        if (exp.realisations.length > 3) {
            // Garder les 3 avec les meilleures quantifications
            const sorted = [...exp.realisations].sort((a, b) => {
                const scoreA = a.quantification ? 2 : (a.keywords_ats.length > 0 ? 1 : 0);
                const scoreB = b.quantification ? 2 : (b.keywords_ats.length > 0 ? 1 : 0);
                return scoreB - scoreA;
            });

            sorted.slice(3).forEach(real => {
                real.display = false;
            });

            exp.realisations_display_count = 3;
            actions.push(`${exp.entreprise}: limité à 3 réalisations`);
        }
    });

    // Passer compétences en mode compact
    cv.competences.display_mode = 'compact';
    actions.push('Compétences en mode liste compacte');

    // Utiliser titres courts pour formations
    cv.formations.forEach(f => {
        if (f.titre_court) {
            f.titre = f.titre_court;
        }
    });
    actions.push('Titres formations raccourcis');

    return actions;
}

/**
 * Niveau 3: Compression agressive
 * - Masque les expériences pertinence_score < 50
 * - Masque les sections optionnelles
 * - Maximum 2 bullets par expérience
 */
function applyLevel3(cv: CVOptimized): string[] {
    const actions: string[] = [];

    // Masquer les expériences moins pertinentes
    cv.experiences.forEach(exp => {
        if (exp.pertinence_score < 50) {
            exp.display = false;
            actions.push(`Masqué: ${exp.entreprise} (score: ${exp.pertinence_score})`);
        }
    });

    // Limiter à 2 bullets max
    cv.experiences.filter(e => e.display).forEach(exp => {
        if (exp.realisations.filter(r => r.display).length > 2) {
            let shown = 0;
            exp.realisations.forEach(real => {
                if (real.display) {
                    if (shown >= 2) {
                        real.display = false;
                    } else {
                        shown++;
                    }
                }
            });
            exp.realisations_display_count = 2;
        }
    });
    actions.push('Maximum 2 réalisations par expérience');

    // Limiter formations à 1
    if (cv.formations.length > 1) {
        cv.formations.slice(1).forEach(f => {
            f.display = false;
        });
        actions.push('Limité à 1 formation');
    }

    // Masquer sections optionnelles
    if (cv.informations_additionnelles) {
        cv.informations_additionnelles.included = false;
        actions.push('Informations additionnelles masquées');
    }

    if (cv.clients_references) {
        cv.clients_references.included = false;
        actions.push('Références clients masquées');
    }

    return actions;
}

/**
 * Niveau 4: Passage 2 pages
 * - Réactive du contenu si possible
 * - Optimise la répartition sur 2 pages
 */
function applyLevel4(cv: CVOptimized): string[] {
    const actions: string[] = [];

    // Réactiver les expériences masquées avec score >= 40
    cv.experiences.forEach(exp => {
        if (!exp.display && exp.pertinence_score >= 40) {
            exp.display = true;
            actions.push(`Réactivé: ${exp.entreprise}`);
        }
    });

    // Remettre à 3 bullets max
    cv.experiences.filter(e => e.display).forEach(exp => {
        exp.realisations.slice(0, 3).forEach(real => {
            real.display = true;
        });
        exp.realisations_display_count = Math.min(3, exp.realisations.length);
    });

    // Réactiver la 2ème formation si présente
    if (cv.formations.length > 1) {
        cv.formations[1].display = true;
    }

    // Passer en mode catégorisé pour les compétences
    cv.competences.display_mode = 'categorized';

    actions.push('CV étendu sur 2 pages');
    actions.push('Contenu enrichi restauré');

    return actions;
}

// =============================================================================
// FONCTION PRINCIPALE
// =============================================================================

/**
 * Compresse un CV pour qu'il tienne sur le nombre de pages cible
 */
export function compressCV(
    cv: CVOptimized,
    options: CompressionOptions
): CompressionResult {
    // Cloner le CV pour ne pas modifier l'original
    const compressedCV = JSON.parse(JSON.stringify(cv)) as CVOptimized;

    const rules = SENIORITY_RULES[options.seniority_level];
    const allActions: string[] = [];
    const warnings: string[] = [];

    // Déterminer le niveau de compression nécessaire
    let compressionLevel = options.force_level ?? determineCompressionLevel(
        compressedCV,
        options.include_photo,
        options.seniority_level
    ).level;

    // Vérifier si 2 pages est autorisé
    if (compressionLevel === 4 && rules.maxPages < 2) {
        warnings.push('2 pages non autorisé pour ce niveau de séniorité, compression maximale appliquée');
        compressionLevel = 3;
    }

    // Appliquer les niveaux de compression progressivement
    if (compressionLevel >= 1) {
        allActions.push(...applyLevel1(compressedCV));
    }
    if (compressionLevel >= 2) {
        allActions.push(...applyLevel2(compressedCV));
    }
    if (compressionLevel >= 3 && compressionLevel !== 4) {
        allActions.push(...applyLevel3(compressedCV));
    }
    if (compressionLevel === 4) {
        allActions.push(...applyLevel4(compressedCV));
    }

    // Mettre à jour les métadonnées
    compressedCV.cv_metadata.compression_level_applied = compressionLevel;
    compressedCV.cv_metadata.optimizations_applied = [
        ...compressedCV.cv_metadata.optimizations_applied,
        ...allActions
    ];

    // Calculer le nombre de pages final
    const finalEstimate = estimateLayout(compressedCV, {
        include_photo: options.include_photo,
        dense_mode: compressionLevel >= 1,
        compression_level: compressionLevel
    });

    compressedCV.cv_metadata.page_count = finalEstimate.page_count;

    // Avertissement si toujours > 1 page et pas autorisé
    if (finalEstimate.page_count > rules.maxPages) {
        warnings.push(`CV fait ${finalEstimate.page_count} pages (max autorisé: ${rules.maxPages})`);
    }

    return {
        cv: compressedCV,
        compression_applied: compressionLevel,
        actions_taken: allActions,
        final_page_count: finalEstimate.page_count,
        warnings
    };
}

/**
 * Applique la compression optimale automatiquement
 */
export function autoCompressCV(
    cv: CVOptimized,
    includePhoto: boolean = true
): CompressionResult {
    return compressCV(cv, {
        target_pages: SENIORITY_RULES[cv.cv_metadata.seniority_level].maxPages,
        seniority_level: cv.cv_metadata.seniority_level,
        include_photo: includePhoto
    });
}

/**
 * Prévisualise l'effet d'un niveau de compression
 */
export function previewCompression(
    cv: CVOptimized,
    level: number,
    includePhoto: boolean
): {
    actions: string[];
    estimated_pages: number;
    experiences_visible: number;
    realisations_total: number;
} {
    const result = compressCV(cv, {
        target_pages: 1,
        seniority_level: cv.cv_metadata.seniority_level,
        include_photo: includePhoto,
        force_level: level
    });

    const visibleExps = result.cv.experiences.filter(e => e.display).length;
    const totalRealisations = result.cv.experiences
        .filter(e => e.display)
        .reduce((sum, exp) => sum + exp.realisations.filter(r => r.display).length, 0);

    return {
        actions: result.actions_taken,
        estimated_pages: result.final_page_count,
        experiences_visible: visibleExps,
        realisations_total: totalRealisations
    };
}

/**
 * Génère un rapport de compression
 */
export function generateCompressionReport(result: CompressionResult): string {
    const lines: string[] = [
        '=== Rapport de Compression CV ===',
        '',
        `Niveau appliqué: ${result.compression_applied} (${COMPRESSION_LEVELS[result.compression_applied]?.name || 'unknown'})`,
        `Pages finales: ${result.final_page_count}`,
        '',
        'Actions effectuées:'
    ];

    result.actions_taken.forEach(action => {
        lines.push(`  • ${action}`);
    });

    if (result.warnings.length > 0) {
        lines.push('');
        lines.push('⚠️ Avertissements:');
        result.warnings.forEach(warning => {
            lines.push(`  • ${warning}`);
        });
    }

    return lines.join('\n');
}
