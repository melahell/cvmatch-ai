/**
 * Types spécifiques pour le Musée des CVs Impossibles
 * 
 * Ces types étendent le système existant pour la section démo
 * avec des personnages historiques.
 */

import { RAGComplete } from "@/types/rag-complete";

// =============================================================================
// MÉTADONNÉES PERSONNAGE
// =============================================================================

export interface DemoCharacterMeta {
    /** Slug URL (ex: "michelangelo") */
    id: string;
    /** Nom complet affiché */
    name: string;
    /** Nom court pour UI */
    shortName: string;
    /** Période de vie (ex: "1475-1564") */
    period: string;
    /** Emoji représentatif */
    icon: string;
    /** Titre professionnel principal */
    title: string;
    /** Nationalité/origine */
    nationality: string;
    /** Citation célèbre (optionnel) */
    quote?: string;
    /** URL portrait (optionnel) */
    imageUrl?: string;
    /** Catégories métier pour filtrage */
    categories: ('art' | 'science' | 'tech' | 'politics' | 'business')[];
}

// =============================================================================
// JOBS 2025
// =============================================================================

export type ContractType = "CDI" | "CDD" | "Freelance" | "Mission";

export interface DemoJob {
    /** Rang 1-10 */
    rank: number;
    /** Titre du poste */
    title: string;
    /** Entreprise (fictive ou générique) */
    company?: string;
    /** Score de match 0-100 */
    matchScore: number;
    /** Salaire minimum */
    salaryMin: number;
    /** Salaire maximum */
    salaryMax: number;
    /** Devise (EUR par défaut) */
    currency: string;
    /** Type de contrat */
    contractType: ContractType;
    /** Secteurs concernés */
    sectors: string[];
    /** Localisation */
    location: string;
    /** Politique télétravail */
    remotePolicy?: string;
    /** Explication du match */
    whyMatch: string;
    /** Compétences clés valorisées */
    keySkills: string[];
    /** Description complète du poste */
    jobDescription: string;
}

// =============================================================================
// LETTRES DE MOTIVATION
// =============================================================================

export type CoverLetterTone = "formal" | "professional_warm" | "creative";

export interface DemoCoverLetter {
    /** Référence au rang du job (1, 2, 3) */
    jobRank: number;
    /** Titre du poste */
    jobTitle: string;
    /** Ton de la lettre */
    tone: CoverLetterTone;
    /** Nombre de mots */
    wordCount: number;
    /** Contenu en Markdown */
    content: string;
}

// =============================================================================
// CVS GÉNÉRÉS
// =============================================================================

export type TemplateId = "modern" | "tech" | "classic" | "creative";

export interface DemoCV {
    /** ID du template utilisé */
    templateId: TemplateId;
    /** Nom affiché du template */
    templateName: string;
    /** Description courte */
    templateDescription: string;
    /** Chemin vers le PDF */
    pdfUrl: string;
    /** Chemin vers l'image preview */
    previewUrl: string;
    /** Template recommandé pour ce profil ? */
    recommended: boolean;
}

// =============================================================================
// PROFIL COMPLET DÉMO
// =============================================================================

export interface DemoProfile {
    /** Métadonnées du personnage */
    meta: DemoCharacterMeta;
    /** Profil RAG complet (réutilise le type existant) */
    rag: RAGComplete;
    /** Score de complétude calculé */
    completenessScore: number;
    /** Temps de génération simulé (ms) */
    generationTimeMs: number;
    /** CVs générés (4 templates) */
    cvs: DemoCV[];
    /** Top 10 des postes 2025 */
    jobs: DemoJob[];
    /** Lettres de motivation (Top 3 jobs) */
    coverLetters: DemoCoverLetter[];
}

// =============================================================================
// REGISTRE DES PROFILS
// =============================================================================

export interface DemoRegistry {
    /** Tous les profils */
    profiles: DemoProfile[];
    /** Récupérer un profil par ID */
    getById: (id: string) => DemoProfile | undefined;
    /** Récupérer toutes les métadonnées (pour galerie) */
    getAllMeta: () => DemoCharacterMeta[];
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Liste des personnages avec leurs IDs
 */
export const DEMO_CHARACTER_IDS = [
    'michelangelo',
    'curie',
    'lovelace',
    'davinci',
    'baker',
    'einstein',
    'cleopatra',
    'tesla',
    'kahlo',
    'turing',
] as const;

export type DemoCharacterId = typeof DEMO_CHARACTER_IDS[number];

/**
 * Vérifie si un ID est un personnage valide
 */
export function isValidCharacterId(id: string): id is DemoCharacterId {
    return DEMO_CHARACTER_IDS.includes(id as DemoCharacterId);
}
