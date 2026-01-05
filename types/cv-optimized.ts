/**
 * CVOptimized Schema - CDC CV Parfait
 * 
 * Schema enrichi pour la génération de CV optimisés avec:
 * - pertinence_score par expérience
 * - quantifications structurées
 * - keywords ATS intégrés
 * - métadonnées de génération
 */

// =============================================================================
// METADATA & ENUMS
// =============================================================================

export type SeniorityLevel = 'junior' | 'confirmed' | 'senior' | 'expert';
export type OptimizationLevel = 'minimal' | 'standard' | 'high';
export type QuantificationType = 'volume' | 'budget' | 'pourcentage' | 'portee' | 'duree' | 'equipe';
export type SectorProfile = 'finance' | 'tech' | 'pharma' | 'conseil' | 'luxe' | 'industrie' | 'other';
export type SkillLevel = 'debutant' | 'intermediaire' | 'avance' | 'expert';

export interface CVMetadata {
    generated_for_job_id?: string;
    match_score?: number;
    template_used: string;
    optimization_level: OptimizationLevel;
    seniority_level: SeniorityLevel;
    sector_detected?: SectorProfile;
    generated_at: string;
    compression_level_applied: number; // 0-4
    page_count: number;
    ats_score?: number;
    optimizations_applied: string[];
}

// =============================================================================
// IDENTITY
// =============================================================================

export interface ContactInfo {
    email: string;
    telephone?: string;
    ville?: string;
    code_postal?: string;
    linkedin?: string;
    portfolio?: string;
    github?: string;
}

export interface Identity {
    nom: string;
    prenom: string;
    titre_vise: string;
    photo_url?: string;
    contact: ContactInfo;
}

// =============================================================================
// ELEVATOR PITCH
// =============================================================================

export interface ElevatorPitch {
    included: boolean;
    text: string;
    char_count: number;
    keywords_embedded: string[];
}

// =============================================================================
// EXPERIENCES
// =============================================================================

export interface Quantification {
    type: QuantificationType;
    valeur: string;
    unite: string;
    display: string; // "150+ projets/an", "budget 2M€"
}

export interface RealisationOptimized {
    id: string;
    description: string;
    description_short?: string; // Version condensée si compression
    quantification?: Quantification;
    impact?: string;
    keywords_ats: string[];
    display: boolean;
    char_count: number;
}

export interface ExperienceOptimized {
    id: string;
    ordre_affichage: number;
    pertinence_score: number; // 0-100
    display: boolean;
    condensed: boolean; // true si format réduit appliqué

    poste: string;
    poste_original?: string; // Si adapté pour l'offre
    entreprise: string;
    localisation?: string;
    type_contrat?: string;

    debut: string;
    fin: string | null;
    actuel: boolean;
    duree_affichee: string;
    duree_mois: number;

    contexte?: string; // 1 ligne de contexte si nécessaire

    realisations: RealisationOptimized[];
    realisations_display_count: number; // Combien afficher après compression

    technologies: string[];
    clients_secteurs?: string[];
}

// =============================================================================
// COMPETENCES
// =============================================================================

export interface SkillItem {
    nom: string;
    variantes?: string[]; // ["e7", "V6", "Orchestra"]
    niveau?: SkillLevel;
    annees_experience?: number;
    certification?: string;
    priorite_affichage: number;
    keywords_ats: string[];
}

export interface SkillCategory {
    nom: string;
    items: SkillItem[];
    display: boolean;
}

export interface CompetencesOptimized {
    display_mode: 'categorized' | 'flat' | 'compact';
    categories: SkillCategory[];

    // Flat lists pour mode compact
    techniques_flat?: string[];
    soft_skills_flat?: string[];
}

// =============================================================================
// FORMATIONS
// =============================================================================

export interface FormationOptimized {
    id: string;
    type: 'diplome' | 'certification' | 'formation';
    titre: string;
    titre_court?: string; // Version condensée
    organisme: string;
    date_debut?: string;
    date_fin?: string;
    date: string; // Année principale
    display: boolean;
    priorite: number;
    display_format: string; // "Master 2 - IIM (2013)"
}

// =============================================================================
// LANGUES
// =============================================================================

export interface LangueOptimized {
    langue: string;
    niveau: string;
    niveau_detail?: string;
    display: string; // "Français (natif)"
}

// =============================================================================
// INFORMATIONS ADDITIONNELLES
// =============================================================================

export interface AdditionalInfo {
    included: boolean;
    projets_perso?: string[];
    benevolat?: string[];
    centres_interet?: string[];
    publications?: string[];
}

// =============================================================================
// CLIENTS / REFERENCES
// =============================================================================

export interface ClientGroup {
    secteur: string;
    clients: string[];
}

export interface ClientsReferences {
    included: boolean;
    included_mode: 'full' | 'secteurs_only' | 'hidden';
    groupes: ClientGroup[];
}

// =============================================================================
// MAIN SCHEMA - CVOptimized
// =============================================================================

export interface CVOptimized {
    cv_metadata: CVMetadata;
    identity: Identity;
    elevator_pitch: ElevatorPitch;
    experiences: ExperienceOptimized[];
    competences: CompetencesOptimized;
    formations: FormationOptimized[];
    langues: LangueOptimized[];
    informations_additionnelles?: AdditionalInfo;
    clients_references?: ClientsReferences;
}

// =============================================================================
// SENIORITY RULES
// =============================================================================

export interface SeniorityRules {
    maxPages: number;
    elevatorPitchRequired: boolean;
    elevatorPitchMaxChars: number;
    formationFirstPosition: boolean;
    maxExperiences: number;
    maxBulletsPerExperience: number;
    maxBulletChars: number;
    showClientReferences: boolean;
    allowCondensation: boolean;
}

export const SENIORITY_RULES: Record<SeniorityLevel, SeniorityRules> = {
    junior: {
        maxPages: 1,
        elevatorPitchRequired: false,
        elevatorPitchMaxChars: 200,
        formationFirstPosition: true,
        maxExperiences: 4,
        maxBulletsPerExperience: 4,
        maxBulletChars: 180,
        showClientReferences: false,
        allowCondensation: false
    },
    confirmed: {
        maxPages: 1,
        elevatorPitchRequired: true,
        elevatorPitchMaxChars: 280,
        formationFirstPosition: false,
        maxExperiences: 5,
        maxBulletsPerExperience: 5,
        maxBulletChars: 200,
        showClientReferences: true,
        allowCondensation: true
    },
    senior: {
        maxPages: 2,
        elevatorPitchRequired: true,
        elevatorPitchMaxChars: 350,
        formationFirstPosition: false,
        maxExperiences: 6,
        maxBulletsPerExperience: 5,
        maxBulletChars: 220,
        showClientReferences: true,
        allowCondensation: true
    },
    expert: {
        maxPages: 2,
        elevatorPitchRequired: true,
        elevatorPitchMaxChars: 400,
        formationFirstPosition: false,
        maxExperiences: 8,
        maxBulletsPerExperience: 6,
        maxBulletChars: 250,
        showClientReferences: true,
        allowCondensation: true
    }
};

// =============================================================================
// COMPRESSION LEVELS
// =============================================================================

export interface CompressionLevel {
    level: number;
    name: string;
    description: string;
    actions: string[];
}

export const COMPRESSION_LEVELS: CompressionLevel[] = [
    {
        level: 0,
        name: 'none',
        description: 'Pas de compression',
        actions: []
    },
    {
        level: 1,
        name: 'soft',
        description: 'Compression douce',
        actions: [
            'Réduire espacement inter-sections (16pt → 12pt)',
            'Réduire taille police corps (11pt → 10pt)',
            'Passer certaines listes en inline'
        ]
    },
    {
        level: 2,
        name: 'moderate',
        description: 'Compression modérée',
        actions: [
            'Limiter bullets/réalisation à 3 max',
            'Raccourcir phrases longues',
            'Fusionner catégories compétences',
            'Utiliser titres courts formations'
        ]
    },
    {
        level: 3,
        name: 'aggressive',
        description: 'Compression agressive',
        actions: [
            'Supprimer XP pertinence_score < 50',
            'Supprimer sections optionnelles',
            'Format ultra-compact compétences',
            '2 bullets max par expérience'
        ]
    },
    {
        level: 4,
        name: 'two_pages',
        description: 'Passage 2 pages',
        actions: [
            'Autoriser débordement page 2',
            'Conserver tout le contenu pertinent',
            'Signaler à l\'utilisateur'
        ]
    }
];

// =============================================================================
// SECTOR PROFILES
// =============================================================================

export interface SectorProfileConfig {
    sector: SectorProfile;
    template_recommended: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    photo_recommended: boolean;
    tone: 'formal' | 'dynamic' | 'executive';
    keywords_critical: string[];
    max_pages_preference: number;
}

export const SECTOR_PROFILES: Record<SectorProfile, SectorProfileConfig> = {
    finance: {
        sector: 'finance',
        template_recommended: 'standard',
        colors: { primary: '#1e3a5f', secondary: '#4a5568', accent: '#2c5282' },
        photo_recommended: true,
        tone: 'formal',
        keywords_critical: ['conformité', 'audit', 'KPI', 'ROI', 'budget', 'risque'],
        max_pages_preference: 1
    },
    tech: {
        sector: 'tech',
        template_recommended: 'modern',
        colors: { primary: '#4f46e5', secondary: '#0d9488', accent: '#7c3aed' },
        photo_recommended: false,
        tone: 'dynamic',
        keywords_critical: ['stack', 'agile', 'CI/CD', 'cloud', 'API', 'microservices'],
        max_pages_preference: 2
    },
    pharma: {
        sector: 'pharma',
        template_recommended: 'standard',
        colors: { primary: '#1e40af', secondary: '#059669', accent: '#3b82f6' },
        photo_recommended: true,
        tone: 'formal',
        keywords_critical: ['GxP', 'FDA', 'validation', 'qualité', 'audit', 'conformité'],
        max_pages_preference: 1
    },
    conseil: {
        sector: 'conseil',
        template_recommended: 'executive',
        colors: { primary: '#1e3a5f', secondary: '#7f1d1d', accent: '#374151' },
        photo_recommended: true,
        tone: 'executive',
        keywords_critical: ['stratégie', 'transformation', 'change management', 'C-level'],
        max_pages_preference: 2
    },
    luxe: {
        sector: 'luxe',
        template_recommended: 'modern',
        colors: { primary: '#1f2937', secondary: '#92400e', accent: '#d97706' },
        photo_recommended: true,
        tone: 'formal',
        keywords_critical: ['excellence', 'qualité', 'client', 'expérience', 'premium'],
        max_pages_preference: 1
    },
    industrie: {
        sector: 'industrie',
        template_recommended: 'standard',
        colors: { primary: '#374151', secondary: '#1f2937', accent: '#4b5563' },
        photo_recommended: true,
        tone: 'formal',
        keywords_critical: ['production', 'lean', 'qualité', 'sécurité', 'performance'],
        max_pages_preference: 1
    },
    other: {
        sector: 'other',
        template_recommended: 'modern',
        colors: { primary: '#4f46e5', secondary: '#6366f1', accent: '#818cf8' },
        photo_recommended: true,
        tone: 'dynamic',
        keywords_critical: [],
        max_pages_preference: 1
    }
};
