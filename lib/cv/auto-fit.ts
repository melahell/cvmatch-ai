/**
 * Auto-Fit CV to One Page
 * 
 * [CDC Sprint 1.6] Fitting automatique pour tenir sur 1 page
 * 
 * Algorithme progressif de réduction :
 * 1. Estimer la hauteur totale du contenu
 * 2. Si > 1 page, appliquer des réductions progressives
 * 3. Retourner CVData optimisé
 */

import { CVData } from "@/components/cv/templates";

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Hauteur d'une page A4 en pixels (approx pour une police 14px) */
const PAGE_HEIGHT_PX = 1123;

/** Marges par défaut (top + bottom) */
const DEFAULT_MARGINS = 80;

/** Hauteur utilisable par page */
const USABLE_HEIGHT = PAGE_HEIGHT_PX - DEFAULT_MARGINS;

/** Estimations de hauteur par élément (en pixels) */
const HEIGHT_ESTIMATES = {
    header: 120,
    summary: 80,
    sectionTitle: 40,
    experienceItem: 120,
    experienceRealisation: 24,
    educationItem: 60,
    skillChip: 28,
    languageItem: 24,
    certificationItem: 24,
    projectItem: 80,
    clientReference: 28,
};

// ============================================================================
// TYPES
// ============================================================================

export interface AutoFitOptions {
    /** Nombre max de pages (default: 1) */
    maxPages?: number;
    /** Mode agressif (coupe plus) */
    aggressive?: boolean;
    /** Préserver certaines sections */
    preserve?: Array<'experiences' | 'formations' | 'competences' | 'langues'>;
}

export interface FitResult {
    /** CVData optimisé */
    data: CVData;
    /** Le CV a-t-il été modifié ? */
    wasModified: boolean;
    /** Nombre estimé de pages original */
    originalPages: number;
    /** Nombre estimé de pages après fitting */
    resultPages: number;
    /** Détails des réductions appliquées */
    reductions: string[];
}

// ============================================================================
// ESTIMATION DE HAUTEUR
// ============================================================================

/**
 * Estime la hauteur totale d'un CVData
 */
export function estimateCVHeight(data: CVData): number {
    let height = 0;
    const reductions: string[] = [];

    // Header (nom, titre, contact)
    height += HEIGHT_ESTIMATES.header;

    // Summary / Pitch
    const profil = data.profil || {};
    if (profil.elevator_pitch) {
        height += HEIGHT_ESTIMATES.summary;
    }

    // Expériences
    const experiences = data.experiences || [];
    if (experiences.length > 0) {
        height += HEIGHT_ESTIMATES.sectionTitle;
        experiences.forEach((exp) => {
            height += HEIGHT_ESTIMATES.experienceItem;
            const realisations = exp.realisations || [];
            height += realisations.length * HEIGHT_ESTIMATES.experienceRealisation;
        });
    }

    // Formations
    const formations = data.formations || [];
    if (formations.length > 0) {
        height += HEIGHT_ESTIMATES.sectionTitle;
        height += formations.length * HEIGHT_ESTIMATES.educationItem;
    }

    // Compétences
    const competences = data.competences || { techniques: [], soft_skills: [] };
    const skills = [
        ...(competences.techniques || []),
        ...(competences.soft_skills || []),
    ];
    if (skills.length > 0) {
        height += HEIGHT_ESTIMATES.sectionTitle;
        // Estimation : ~4 skills par ligne
        height += Math.ceil(skills.length / 4) * HEIGHT_ESTIMATES.skillChip;
    }

    // Langues
    const langues = data.langues || [];
    if (langues.length > 0) {
        height += HEIGHT_ESTIMATES.sectionTitle;
        height += langues.length * HEIGHT_ESTIMATES.languageItem;
    }

    // Certifications
    const certifications = data.certifications || [];
    if (certifications.length > 0) {
        height += HEIGHT_ESTIMATES.sectionTitle;
        height += certifications.length * HEIGHT_ESTIMATES.certificationItem;
    }

    // Projets
    const projects = data.projects || [];
    if (projects.length > 0) {
        height += HEIGHT_ESTIMATES.sectionTitle;
        height += projects.length * HEIGHT_ESTIMATES.projectItem;
    }

    // Clients références
    const clients = data.clients_references?.clients || [];
    if (clients.length > 0) {
        height += HEIGHT_ESTIMATES.sectionTitle;
        height += Math.ceil(clients.length / 3) * HEIGHT_ESTIMATES.clientReference;
    }

    return height;
}

/**
 * Calcule le nombre de pages estimé
 */
export function estimatePages(data: CVData): number {
    const height = estimateCVHeight(data);
    return Math.ceil(height / USABLE_HEIGHT);
}

// ============================================================================
// FONCTIONS DE RÉDUCTION
// ============================================================================

/**
 * Réduit le nombre de réalisations par expérience
 */
function reduceRealisations(data: CVData, maxPerExp: number): CVData {
    const experiences = (data.experiences || []).map((exp) => ({
        ...exp,
        realisations: (exp.realisations || []).slice(0, maxPerExp),
    }));
    return { ...data, experiences };
}

/**
 * Réduit le nombre d'expériences
 */
function reduceExperiences(data: CVData, max: number): CVData {
    return {
        ...data,
        experiences: (data.experiences || []).slice(0, max),
    };
}

/**
 * Réduit le nombre de compétences
 */
function reduceSkills(data: CVData, maxTechniques: number, maxSoft: number): CVData {
    const competences = data.competences || { techniques: [], soft_skills: [] };
    return {
        ...data,
        competences: {
            techniques: (competences.techniques || []).slice(0, maxTechniques),
            soft_skills: (competences.soft_skills || []).slice(0, maxSoft),
        },
    };
}

/**
 * Réduit le nombre de formations
 */
function reduceFormations(data: CVData, max: number): CVData {
    return {
        ...data,
        formations: (data.formations || []).slice(0, max),
    };
}

/**
 * Réduit le nombre de certifications
 */
function reduceCertifications(data: CVData, max: number): CVData {
    return {
        ...data,
        certifications: (data.certifications || []).slice(0, max),
    };
}

/**
 * Réduit le nombre de projets
 */
function reduceProjects(data: CVData, max: number): CVData {
    return {
        ...data,
        projects: (data.projects || []).slice(0, max),
    };
}

/**
 * Réduit les clients références
 */
function reduceClients(data: CVData, max: number): CVData {
    if (!data.clients_references) return data;
    return {
        ...data,
        clients_references: {
            ...data.clients_references,
            clients: (data.clients_references.clients || []).slice(0, max),
        },
    };
}

/**
 * Tronque le pitch/résumé
 */
function truncatePitch(data: CVData, maxChars: number): CVData {
    const profil = data.profil || {};
    const pitch = profil.elevator_pitch || "";
    
    if (pitch.length <= maxChars) return data;
    
    const truncated = pitch.substring(0, maxChars).trim() + "...";
    return {
        ...data,
        profil: {
            ...profil,
            elevator_pitch: truncated,
        },
    };
}

// ============================================================================
// ALGORITHME PRINCIPAL
// ============================================================================

/**
 * Applique l'auto-fit pour faire tenir le CV sur le nombre de pages spécifié
 * 
 * @example
 * ```typescript
 * const result = autoFitToPages(cvData, { maxPages: 1 });
 * if (result.wasModified) {
 *     console.log("Réductions appliquées:", result.reductions);
 * }
 * ```
 */
export function autoFitToPages(
    data: CVData,
    options: AutoFitOptions = {}
): FitResult {
    const { maxPages = 1, aggressive = false, preserve = [] } = options;

    const originalPages = estimatePages(data);
    const reductions: string[] = [];

    // Si déjà OK, retourner sans modification
    if (originalPages <= maxPages) {
        return {
            data,
            wasModified: false,
            originalPages,
            resultPages: originalPages,
            reductions: [],
        };
    }

    let optimizedData = { ...data };

    // Étape 1: Réduire les réalisations (4 → 3 → 2)
    if (!preserve.includes('experiences')) {
        let currentPages = estimatePages(optimizedData);
        
        if (currentPages > maxPages) {
            optimizedData = reduceRealisations(optimizedData, 3);
            reductions.push("Réalisations: max 3 par expérience");
            currentPages = estimatePages(optimizedData);
        }
        
        if (currentPages > maxPages) {
            optimizedData = reduceRealisations(optimizedData, 2);
            reductions.push("Réalisations: max 2 par expérience");
        }
    }

    // Étape 2: Réduire les compétences
    if (!preserve.includes('competences')) {
        if (estimatePages(optimizedData) > maxPages) {
            optimizedData = reduceSkills(optimizedData, 12, 4);
            reductions.push("Compétences: max 12 techniques, 4 soft skills");
        }
    }

    // Étape 3: Réduire projets et certifications
    if (estimatePages(optimizedData) > maxPages) {
        optimizedData = reduceProjects(optimizedData, 2);
        optimizedData = reduceCertifications(optimizedData, 4);
        reductions.push("Projets: max 2, Certifications: max 4");
    }

    // Étape 4: Réduire clients
    if (estimatePages(optimizedData) > maxPages) {
        optimizedData = reduceClients(optimizedData, 5);
        reductions.push("Clients références: max 5");
    }

    // Étape 5: Tronquer le pitch
    if (estimatePages(optimizedData) > maxPages) {
        optimizedData = truncatePitch(optimizedData, 200);
        reductions.push("Pitch tronqué à 200 caractères");
    }

    // Étape 6: Réduire formations (mode agressif)
    if (aggressive && !preserve.includes('formations')) {
        if (estimatePages(optimizedData) > maxPages) {
            optimizedData = reduceFormations(optimizedData, 2);
            reductions.push("Formations: max 2");
        }
    }

    // Étape 7: Réduire expériences (mode très agressif)
    if (aggressive && !preserve.includes('experiences')) {
        if (estimatePages(optimizedData) > maxPages) {
            optimizedData = reduceExperiences(optimizedData, 4);
            reductions.push("Expériences: max 4");
        }
        
        if (estimatePages(optimizedData) > maxPages) {
            optimizedData = reduceExperiences(optimizedData, 3);
            reductions.push("Expériences: max 3");
        }
    }

    const resultPages = estimatePages(optimizedData);

    return {
        data: optimizedData,
        wasModified: reductions.length > 0,
        originalPages,
        resultPages,
        reductions,
    };
}

/**
 * Alias pour autoFitToPages avec maxPages=1
 */
export function autoFitToOnePage(
    data: CVData,
    options?: Omit<AutoFitOptions, 'maxPages'>
): FitResult {
    return autoFitToPages(data, { ...options, maxPages: 1 });
}

// ============================================================================
// ADDITIONAL EXPORTS (constantes)
// ============================================================================

export {
    HEIGHT_ESTIMATES,
    USABLE_HEIGHT,
    PAGE_HEIGHT_PX,
};
