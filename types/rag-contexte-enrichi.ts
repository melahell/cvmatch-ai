/**
 * Types pour le contexte enrichi RAG
 * Permet d'ajouter des informations implicites déduites du RAG explicite
 */

export interface ResponsabiliteImplicite {
    description: string;
    justification: string; // Phrase source qui justifie
    confidence: number; // 60-100
}

export interface CompetenceTacite {
    nom: string;
    type: "technique" | "soft_skill" | "methodologie";
    justification: string;
    confidence: number; // 60-100
}

export interface EnvironnementTravail {
    taille_equipe?: string;
    contexte_projet?: string;
    outils_standards?: string[];
}

export interface ContexteEnrichi {
    responsabilites_implicites: ResponsabiliteImplicite[];
    competences_tacites: CompetenceTacite[];
    environnement_travail?: EnvironnementTravail;
}

/**
 * [AUDIT-FIX P1-1] Options de filtrage des données induites pour la génération de CV.
 * Permet à l'utilisateur de contrôler ce qui est inclus dans le CV.
 *
 * - "all"             : Toutes les données induites (confidence >= min_confidence)
 * - "high_confidence" : Seulement les données à haute confiance (>= 80)
 * - "none"            : Aucune donnée induite dans le CV
 */
export interface InducedDataOptions {
    mode: "all" | "high_confidence" | "none";
    /** Seuil minimal de confiance (60-100). Défaut: 60 en mode "all", 80 en mode "high_confidence" */
    min_confidence: number;
    /** Inclure les responsabilités implicites comme bullets dans les expériences */
    include_responsabilites: boolean;
    /** Inclure les compétences tacites dans la section compétences */
    include_competences_tacites: boolean;
    /** Inclure l'environnement de travail dans le contexte des expériences */
    include_env_travail: boolean;
}

/** Présets pour InducedDataOptions */
export const INDUCED_DATA_PRESETS: Record<InducedDataOptions["mode"], InducedDataOptions> = {
    all: {
        mode: "all",
        min_confidence: 60,
        include_responsabilites: true,
        include_competences_tacites: true,
        include_env_travail: true,
    },
    high_confidence: {
        mode: "high_confidence",
        min_confidence: 80,
        include_responsabilites: true,
        include_competences_tacites: true,
        include_env_travail: true,
    },
    none: {
        mode: "none",
        min_confidence: 100,
        include_responsabilites: false,
        include_competences_tacites: false,
        include_env_travail: false,
    },
};
