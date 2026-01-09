/**
 * Enhanced RAG Types
 * Based on ragCDC.md specifications
 */

// ============ UPDATE MODES ============

export type UpdateMode = "creation" | "completion" | "regeneration";

// ============ CONTEXTUAL ENRICHMENT ============

export interface ResponsabiliteImplicite {
    categorie:
    | "Gouvernance"
    | "Budget"
    | "Stakeholders"
    | "Qualité"
    | "Conformité"
    | "Gestion_Crise"
    | "Reporting"
    | "Change_Management";
    actions: string[];
    niveau_certitude: "Très probable" | "Probable" | "Possible";
    justification: string;
    source_experience_id?: string;
}

export interface CompetenceTacite {
    competence: string;
    niveau_deduit: "Expert" | "Avancé" | "Intermédiaire";
    contexte: string;
    source_experience_ids: string[];
}

export interface EnvironnementTravail {
    complexite_organisationnelle: "Très élevée" | "Élevée" | "Moyenne" | "Faible";
    niveau_autonomie: "Très élevé" | "Élevé" | "Moyen" | "Faible";
    exposition_direction: "Très élevée" | "Élevée" | "Moyenne" | "Faible";
    criticite_missions: "Très élevée" | "Élevée" | "Moyenne" | "Faible";
    environnement_multiculturel: boolean;
    langues_travail: string[];
}

export interface ContexteEnrichi {
    responsabilites_implicites: ResponsabiliteImplicite[];
    competences_tacites: CompetenceTacite[];
    soft_skills_deduites: string[];
    environnement_travail: EnvironnementTravail;
}

// ============ DOCUMENT TRACKING ============

export interface DocumentSource {
    filename: string;
    upload_date: string;
    extraction_status: "processed" | "partial" | "failed";
    sections_extracted: string[];
}

// ============ MERGE STATISTICS ============

export interface MergeStats {
    experiences: {
        added: number;
        updated: number;
        kept: number;
    };
    competences: {
        added: number;
        kept: number;
    };
    clients: {
        added: number;
        kept: number;
    };
    total_changes: number;
}

export interface MergeResult {
    merged: any;
    stats: MergeStats;
    conflicts: any[];
}

// ============ RAG METADATA ============

export interface RAGMetadata {
    version: string;
    creation_date: string;
    last_update: string;
    update_mode: UpdateMode;
    documents_sources: DocumentSource[];
    gemini_model_used: "pro" | "flash";
    merge_stats?: MergeStats;
    regenerated_from_version?: string;
}

// ============ QUALITY METRICS ============

export interface QualityMetrics {
    overall_score: number;
    completeness_score: number;
    quality_score: number;
    impact_score: number;
}

// ============ ENHANCED RAG DATA ============

export interface EnhancedRAGData {
    // Explicit data (from documents)
    profil: {
        nom?: string;
        prenom?: string;
        titre_principal?: string;
        localisation?: string;
        elevator_pitch?: string;
        contact?: {
            email?: string;
            telephone?: string;
            linkedin?: string;
        };
        photo_url?: string;
    };
    experiences: Experience[];
    competences: {
        explicit: {
            techniques: string[];
            soft_skills: string[];
        };
        inferred: {
            techniques: InferredSkill[];
            tools: InferredSkill[];
            soft_skills: InferredSkill[];
        };
    };
    formations: Formation[];
    certifications: string[];
    langues: Record<string, string>;
    projets: Projet[];
    references: {
        clients: Client[];
    };

    // User rejections (respect user choices)
    rejected_inferred: string[];

    // Contextual enrichment (AI-deduced)
    contexte_enrichi?: ContexteEnrichi;

    // System metadata
    metadata?: RAGMetadata;
    quality_metrics?: QualityMetrics;
    extraction_metadata?: {
        gemini_model_used: string;
        extraction_date: string;
        documents_processed: string[];
        warnings: string[];
    };
}

// ============ SUB-TYPES ============

export interface Experience {
    id?: string;
    entreprise: string;
    poste: string;
    debut: string;
    fin?: string | null;
    realisations: Realisation[];
    technologies: string[];
    clients_references?: string[];
    weight?: "important" | "inclus" | "exclu";
    merged_from?: string[];
}

export interface Realisation {
    description: string;
    impact_quantifie?: string;
}

export interface InferredSkill {
    name: string;
    confidence: number;
    reasoning: string;
    sources?: string[];
}

export interface Formation {
    diplome: string;
    ecole: string;
    annee?: string;
    weight?: "important" | "inclus" | "exclu";
}

export interface Projet {
    nom: string;
    description?: string;
    technologies?: string[];
    url?: string;
}

export interface Client {
    nom: string;
    secteur?: string;
    sources?: { exp_id: string; date: string }[];
    frequence_mention?: number;
}
