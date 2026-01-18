/**
 * Registre des profils de démonstration
 * 
 * Point d'entrée central pour accéder aux données du Musée des CVs Impossibles.
 */

import { DemoProfile, DemoCharacterMeta, DemoRegistry, isValidCharacterId } from "./types";
import michelangeloProfile from "./profiles/michelangelo";
import curieProfile from "./profiles/curie";
import lovelaceProfile from "./profiles/lovelace";
import davinciProfile from "./profiles/davinci";
import bakerProfile from "./profiles/baker";
import einsteinProfile from "./profiles/einstein";
import cleopatraProfile from "./profiles/cleopatra";
import teslaProfile from "./profiles/tesla";
import kahloProfile from "./profiles/kahlo";
import turingProfile from "./profiles/turing";

// =============================================================================
// TOUS LES PROFILS
// =============================================================================

/**
 * Liste de tous les profils démo disponibles
 */
export const DEMO_PROFILES: DemoProfile[] = [
    michelangeloProfile,
    curieProfile,
    lovelaceProfile,
    davinciProfile,
    bakerProfile,
    einsteinProfile,
    cleopatraProfile,
    teslaProfile,
    kahloProfile,
    turingProfile,
];

// =============================================================================
// FONCTIONS D'ACCÈS
// =============================================================================

/**
 * Récupère un profil par son ID
 */
export function getProfileById(id: string): DemoProfile | undefined {
    return DEMO_PROFILES.find(p => p.meta.id === id);
}

/**
 * Récupère toutes les métadonnées des personnages (pour la galerie)
 */
export function getAllCharacterMetas(): DemoCharacterMeta[] {
    return DEMO_PROFILES.map(p => p.meta);
}

/**
 * Vérifie si un profil existe
 */
export function profileExists(id: string): boolean {
    return DEMO_PROFILES.some(p => p.meta.id === id);
}

/**
 * Récupère les profils par catégorie
 */
export function getProfilesByCategory(category: DemoCharacterMeta['categories'][number]): DemoProfile[] {
    return DEMO_PROFILES.filter(p => p.meta.categories.includes(category));
}

// =============================================================================
// REGISTRE
// =============================================================================

/**
 * Registre complet des profils démo
 */
export const demoRegistry: DemoRegistry = {
    profiles: DEMO_PROFILES,
    getById: getProfileById,
    getAllMeta: getAllCharacterMetas,
};

// =============================================================================
// EXPORTS
// =============================================================================

export * from "./types";
export * from "./converters";
export {
    michelangeloProfile,
    curieProfile,
    lovelaceProfile,
    davinciProfile,
    bakerProfile,
    einsteinProfile,
    cleopatraProfile,
    teslaProfile,
    kahloProfile,
    turingProfile,
};
