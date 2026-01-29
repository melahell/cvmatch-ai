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
    clients_references?: string[];
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

export interface Projet {
    nom: string;
    description: string;
    technologies?: string[];
    url?: string;
    impact?: string;
    date?: string;
}

export interface QualityMetrics {
    has_quantified_impacts: boolean;
    quantification_percentage: number; // 0-100
    clients_count: number;
    certifications_count: number;
    elevator_pitch_quality_score: number; // 0-100
    inferred_skills_avg_confidence: number; // 0-100
}

export interface ExtractionMetadata {
    gemini_model_used: "pro" | "flash";
    extraction_date: string;
    documents_processed: string[];
    warnings: string[];
}

export interface ClientReference {
    nom: string;
    secteur: string;
    sources?: string[];
}

export interface References {
    clients?: ClientReference[];
}

export interface RAGMetadata {
    profil?: Profil;
    experiences?: Experience[];
    competences?: Competences;
    formations?: Formation[];
    langues?: Record<string, string>;
    projets?: Projet[];
    certifications?: string[];
    references?: References;
    contexte_enrichi?: any;

    // Computed fields
    score?: number;
    breakdown?: any[];
    topJobs?: any[];

    // Quality metrics
    quality_metrics?: QualityMetrics;
    extraction_metadata?: ExtractionMetadata;

    // Rejected suggestions tracking
    rejected_inferred?: string[];
}
