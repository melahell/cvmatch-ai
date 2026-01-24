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
