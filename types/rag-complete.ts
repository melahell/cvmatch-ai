/**
 * RAGComplete Schema - Schéma RAG Ultra-Complet
 * 
 * Objectif : Zéro perte de données
 * - TOUTE information importée est conservée
 * - Doublons fusionnés intelligemment
 * - Clients/Références/Certifications dédiés
 */

// =============================================================================
// TYPES DE BASE
// =============================================================================

export type ContratType = 'cdi' | 'cdd' | 'freelance' | 'mission' | 'stage' | 'alternance' | 'interim';
export type EntrepriseType = 'esn' | 'client_final' | 'startup' | 'pme' | 'grand_groupe' | 'public' | 'ong';
export type ClientType = 'grand_compte' | 'pme' | 'startup' | 'public' | 'international';
export type SkillLevel = 'debutant' | 'intermediaire' | 'avance' | 'expert';
export type FormationType = 'diplome' | 'certification' | 'formation' | 'mooc';
export type QuantificationType = 'volume' | 'budget' | 'pourcentage' | 'delai' | 'equipe' | 'portee';

// =============================================================================
// IDENTITÉ
// =============================================================================

export interface ContactInfo {
    email: string;
    telephone?: string;
    adresse?: string;
    code_postal?: string;
    ville?: string;
    pays?: string;
    linkedin?: string;
    portfolio?: string;
    github?: string;
    twitter?: string;
}

export interface Profil {
    nom: string;
    prenom: string;
    titre_principal: string;
    titres_alternatifs: string[];      // Titres alternatifs accumulés
    localisation: string;
    disponibilite?: string;            // "Immédiate", "1 mois", etc.
    mobilite?: string[];               // Villes/régions acceptées
    teletravail?: string;              // "100%", "Hybride", "Présentiel"
    tjm?: number;                      // Tarif journalier (freelance)
    salaire_souhaite?: string;         // Fourchette salaire
    contact: ContactInfo;
    photo_url?: string;
    elevator_pitch: string;
    objectif_carriere?: string;        // Objectif à long terme
}

// =============================================================================
// EXPÉRIENCES
// =============================================================================

export interface Quantification {
    type: QuantificationType;
    valeur: string;
    unite: string;
    display: string;                   // Format affichage: "150+ projets/an"
}

export interface Realisation {
    id: string;
    description: string;
    description_courte?: string;       // Version condensée
    impact?: string;
    quantification?: Quantification;
    keywords_ats?: string[];
    sources: string[];                 // Documents sources
}

export interface Experience {
    id: string;
    poste: string;
    poste_original?: string;           // Si adapté, garde l'original
    entreprise: string;
    type_entreprise?: EntrepriseType;
    secteur?: string;
    lieu?: string;
    type_contrat?: ContratType;

    // Dates
    debut: string;                     // Format YYYY-MM
    fin: string | null;
    actuel: boolean;
    duree_mois?: number;               // Calculé

    // Contexte
    contexte?: string;                 // 1-2 phrases de contexte
    equipe_size?: number;
    budget_gere?: string;
    perimetre?: string;                // Ex: "France et Belgique"

    // Contenu
    realisations: Realisation[];
    technologies: string[];
    outils: string[];                  // Séparé de technologies
    methodologies: string[];           // Agile, Scrum, SAFe, etc.

    // Clients/Références pour cette XP
    clients_references: string[];

    // Métadonnées merge
    sources: string[];                 // Documents d'où vient l'info
    last_updated: string;
    merge_count: number;               // Fois où cette XP a été enrichie
}

// =============================================================================
// COMPÉTENCES
// =============================================================================

export interface SkillExplicit {
    nom: string;
    niveau?: SkillLevel;
    annees_experience?: number;
    certifie?: boolean;
    derniere_utilisation?: string;     // Année
}

export interface SkillInferred {
    name: string;
    confidence: number;                // 0-100
    reasoning: string;
    sources: string[];                 // Citations exactes
}

export interface Competences {
    explicit: {
        techniques: SkillExplicit[];
        soft_skills: string[];
        methodologies: string[];
        langages_programmation?: string[];
        frameworks?: string[];
        outils?: string[];
        cloud_devops?: string[];
    };
    inferred: {
        techniques: SkillInferred[];
        tools: SkillInferred[];
        soft_skills: SkillInferred[];
    };
    par_domaine: Record<string, string[]>;  // { "Cloud": ["AWS", "Azure"], "BDD": ["PostgreSQL"] }
}

// =============================================================================
// FORMATIONS
// =============================================================================

export interface Formation {
    id: string;
    type: FormationType;
    titre: string;
    titre_court?: string;
    organisme: string;
    lieu?: string;
    date_debut?: string;
    date_fin?: string;
    annee: string;
    en_cours: boolean;
    mention?: string;
    specialite?: string;
    details?: string;
    sources: string[];
}

// =============================================================================
// CERTIFICATIONS (Section dédiée)
// =============================================================================

export interface Certification {
    id: string;
    nom: string;
    organisme: string;
    date_obtention: string;
    date_expiration?: string;
    numero?: string;
    url_verification?: string;
    niveau?: string;                   // Ex: "Associate", "Professional"
    domaine?: string;                  // Ex: "Cloud", "Sécurité"
    sources: string[];
}

// =============================================================================
// LANGUES
// =============================================================================

export interface Langue {
    langue: string;
    niveau: string;                    // "Natif", "Courant", "Professionnel"
    niveau_cecrl?: string;             // A1-C2
    certifications?: string[];         // TOEFL, DELF, etc.
    details?: string;
}

// =============================================================================
// RÉFÉRENCES CLIENTS/PROJETS (Section dédiée)
// =============================================================================

export interface ClientReference {
    nom: string;
    secteur: string;
    type: ClientType;
    annees: string[];                  // Années de collaboration
    via_entreprise?: string;           // Via quelle ESN/employeur
    contexte?: string;                 // Brève description
    confidentiel: boolean;             // Si nom doit être masqué
}

export interface ProjetMarquant {
    id: string;
    nom: string;
    description: string;
    client?: string;
    employeur?: string;
    annee: string;
    duree?: string;
    technologies: string[];
    methodologies?: string[];
    resultats: string;
    lien?: string;
    sources: string[];
}

export interface References {
    clients: ClientReference[];
    projets_marquants: ProjetMarquant[];
    publications?: Array<{
        titre: string;
        type: 'article' | 'livre' | 'conference' | 'brevet';
        date: string;
        lien?: string;
    }>;
    interventions?: Array<{
        titre: string;
        type: 'formation' | 'conference' | 'meetup' | 'podcast';
        date: string;
        lieu?: string;
    }>;
}

// =============================================================================
// INFORMATIONS ADDITIONNELLES
// =============================================================================

export interface InfosAdditionnelles {
    centres_interet?: string[];
    benevolat?: Array<{
        role: string;
        organisation: string;
        periode?: string;
    }>;
    permis?: string[];                 // B, A, etc.
    habilitations?: string[];          // Secret défense, etc.
}

// =============================================================================
// MÉTADONNÉES SYSTÈME
// =============================================================================

export interface MergeHistoryEntry {
    date: string;
    source: string;                    // Nom du document
    action: 'create' | 'merge' | 'update';
    fields_updated: string[];
    experiences_added: number;
    experiences_merged: number;
}

export interface RAGMetadata {
    version: string;                   // Version du schéma
    created_at: string;
    last_updated: string;
    last_merge_at: string;
    sources_count: number;
    documents_sources: string[];       // Liste des documents traités
    completeness_score: number;
    merge_history: MergeHistoryEntry[];
}

// =============================================================================
// SCHÉMA PRINCIPAL - RAGComplete
// =============================================================================

export interface RAGComplete {
    profil: Profil;
    experiences: Experience[];
    competences: Competences;
    formations: Formation[];
    certifications: Certification[];
    langues: Langue[];
    references: References;
    infos_additionnelles?: InfosAdditionnelles;
    metadata: RAGMetadata;
}

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Crée un RAGComplete vide avec valeurs par défaut
 */
export function createEmptyRAG(userId: string): RAGComplete {
    const now = new Date().toISOString();
    return {
        profil: {
            nom: '',
            prenom: '',
            titre_principal: '',
            titres_alternatifs: [],
            localisation: '',
            contact: { email: '' },
            elevator_pitch: ''
        },
        experiences: [],
        competences: {
            explicit: {
                techniques: [],
                soft_skills: [],
                methodologies: []
            },
            inferred: {
                techniques: [],
                tools: [],
                soft_skills: []
            },
            par_domaine: {}
        },
        formations: [],
        certifications: [],
        langues: [],
        references: {
            clients: [],
            projets_marquants: []
        },
        metadata: {
            version: '2.0.0',
            created_at: now,
            last_updated: now,
            last_merge_at: now,
            sources_count: 0,
            documents_sources: [],
            completeness_score: 0,
            merge_history: []
        }
    };
}

/**
 * Calcule le score de complétude du RAG
 */
export function calculateRAGCompleteness(rag: RAGComplete): number {
    let score = 0;
    const max = 100;

    // Profil (20 points)
    if (rag.profil.nom && rag.profil.prenom) score += 5;
    if (rag.profil.titre_principal) score += 5;
    if (rag.profil.contact.email) score += 5;
    if (rag.profil.elevator_pitch?.length > 50) score += 5;

    // Expériences (30 points)
    const expCount = rag.experiences.length;
    score += Math.min(15, expCount * 5);
    // Bonus si réalisations quantifiées
    const quantified = rag.experiences.filter(e =>
        e.realisations.some(r => r.quantification)
    ).length;
    score += Math.min(10, quantified * 3);
    // Bonus si technologies renseignées
    const withTech = rag.experiences.filter(e => e.technologies.length > 0).length;
    score += Math.min(5, withTech * 2);

    // Compétences (20 points)
    const techCount = rag.competences.explicit.techniques.length;
    score += Math.min(15, techCount);
    const softCount = rag.competences.explicit.soft_skills.length;
    score += Math.min(5, softCount);

    // Formations (10 points)
    score += Math.min(10, rag.formations.length * 5);

    // Certifications (5 points)
    score += Math.min(5, rag.certifications.length * 2);

    // Langues (5 points)
    score += Math.min(5, rag.langues.length * 2);

    // Références clients (10 points)
    const clientCount = rag.references.clients.length;
    score += Math.min(10, clientCount * 2);

    return Math.min(max, score);
}

/**
 * Génère un ID unique pour les éléments
 */
export function generateId(prefix: string = 'item'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
