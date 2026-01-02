// Types for RAG Data with dual skills architecture

export interface InferredSkill {
    name: string;
    confidence: number; // 0-100
    reasoning: string;
    sources: string[];
    addedToProfile?: boolean;
}

export interface CompetencesExplicit {
    techniques: string[];
    soft_skills: string[];
}

export interface CompetencesInferred {
    techniques: InferredSkill[];
    tools: InferredSkill[];
    soft_skills: InferredSkill[];
}

export interface Competences {
    explicit?: CompetencesExplicit;
    inferred?: CompetencesInferred;

    // Legacy format support (backward compatibility)
    techniques?: string[];
    soft_skills?: string[];
}

export interface Experience {
    poste: string;
    entreprise: string;
    debut: string;
    fin: string | null;
    actuel?: boolean;
    realisations?: Array<{
        description: string;
        impact?: string;
    }>;
    technologies?: string[];
    weight?: "important" | "inclus" | "exclu";
}

export interface Formation {
    diplome: string;
    ecole: string;
    annee: string;
    weight?: "important" | "inclus" | "exclu";
}

export interface Profil {
    nom?: string;
    prenom?: string;
    titre_principal?: string;
    localisation?: string;
    elevator_pitch?: string;
    photo_url?: string;
    contact?: {
        email?: string;
        telephone?: string;
        linkedin?: string;
    };
}

export interface RAGMetadata {
    profil?: Profil;
    experiences?: Experience[];
    competences?: Competences;
    formations?: Formation[];
    langues?: Record<string, string>;
    projets?: any[];

    // Computed fields
    score?: number;
    breakdown?: any[];
    topJobs?: any[];

    // Rejected suggestions tracking
    rejected_inferred?: string[];
}
