// CV Template Types and Registry

export interface CVData {
    profil: {
        prenom: string;
        nom: string;
        titre_principal: string;
        email?: string;
        telephone?: string;
        localisation?: string;
        linkedin?: string;
        github?: string;
        portfolio?: string;
        elevator_pitch?: string;
        photo_url?: string;
    };
    experiences: Array<{
        poste: string;
        entreprise: string;
        date_debut: string;
        date_fin?: string;
        actuel?: boolean;         // [AUDIT-FIX P0-5] Champ actuel manquant
        lieu?: string;
        realisations: string[];
        clients?: string[];
    }>;
    competences: {
        techniques: string[];
        soft_skills?: string[];
    };
    formations: Array<{
        diplome: string;
        etablissement: string;
        annee?: string;
    }>;
    langues?: Array<{
        langue: string;
        niveau: string;
    }>;
    certifications?: string[];
    clients_references?: {
        clients: string[];
        secteurs?: Array<{ secteur: string; clients: string[] }>;
    };
    // [CDC-21] Ajout des projets pour éviter la perte de données
    projects?: Array<{
        nom: string;
        description: string;
        technologies?: string[];
        lien?: string;
    }>;
}

export interface JobContext {
    company?: string;
    job_title?: string;
    company_logo?: string;
    match_score?: number;
    keywords?: string[];
}

export interface DisplayLimits {
    maxSkills?: number;
    maxSoftSkills?: number;
    maxRealisationsPerExp?: number;
    maxClientsPerExp?: number;
    maxClientsReferences?: number;
    maxCertifications?: number;
    maxProjects?: number;
    maxFormations?: number;
    maxLangues?: number;
}

/** Returns true if entreprise is a real company name (not a placeholder like "—" or "Entreprise non précisée") */
export function isValidEntreprise(e: string | undefined | null): boolean {
    if (!e || !e.trim()) return false;
    const lower = e.toLowerCase().trim();
    if (lower === "—" || lower === "-" || lower === "n/a") return false;
    if (lower.includes("non précisé") || lower.includes("non spécifié")) return false;
    return true;
}

export interface TemplateProps {
    data: CVData;
    includePhoto?: boolean;
    jobContext?: JobContext;
    dense?: boolean;
    displayLimits?: DisplayLimits;
}

export interface TemplateInfo {
    id: string;
    name: string;
    description: string;
    category: 'modern' | 'classic' | 'tech' | 'creative' | 'professional' | 'minimal';
    preview: string;
    available: boolean;
    recommended?: string[];
}

// Template Registry — 10 distinct templates, each with a unique layout
export const TEMPLATES: TemplateInfo[] = [
    // ── Originals (4) ──
    {
        id: 'modern',
        name: 'Sidebar Pro',
        description: 'Sidebar sombre, accents colorés — management & conseil',
        category: 'modern',
        preview: '/templates/modern-preview.png',
        available: true,
        recommended: ['Business', 'Consulting', 'Management'],
    },
    {
        id: 'tech',
        name: 'Développeur',
        description: 'Profils techniques, compétences catégorisées',
        category: 'tech',
        preview: '/templates/tech-preview.png',
        available: true,
        recommended: ['Développeur', 'Data', 'DevOps'],
    },
    {
        id: 'classic',
        name: 'Classique',
        description: 'Deux colonnes, format traditionnel et sobre',
        category: 'classic',
        preview: '/templates/classic-preview.png',
        available: true,
        recommended: ['Finance', 'Droit', 'Administration'],
    },
    {
        id: 'creative',
        name: 'Créatif',
        description: 'Design coloré, sidebar droite, timeline dynamique',
        category: 'creative',
        preview: '/templates/creative-preview.png',
        available: true,
        recommended: ['Design', 'Marketing', 'Communication'],
    },
    // ── Reactive Resume inspired (6) ──
    {
        id: 'pikachu',
        name: 'Gradient Moderne',
        description: 'Header dégradé, timeline, une colonne impactante',
        category: 'modern',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Marketing', 'Startup', 'Digital'],
    },
    {
        id: 'bronzor',
        name: 'Élégant Minimal',
        description: 'Minimaliste sans sidebar, typographie raffinée',
        category: 'minimal',
        preview: '/templates/bronzor-preview.png',
        available: true,
        recommended: ['Juridique', 'Académique', 'Direction'],
    },
    {
        id: 'gengar',
        name: 'Pro Sombre',
        description: 'Sidebar intégrée au header, fond sombre contrasté',
        category: 'professional',
        preview: '/templates/gengar-preview.png',
        available: true,
        recommended: ['Tech', 'Data', 'Product'],
    },
    {
        id: 'chikorita',
        name: 'Sidebar Couleur',
        description: 'Sidebar droite colorée, texte blanc, look vibrant',
        category: 'modern',
        preview: '/templates/chikorita-preview.png',
        available: true,
        recommended: ['UX/UI', 'Growth', 'Consulting'],
    },
    {
        id: 'ditto',
        name: 'ATS Classique',
        description: 'Bannière pleine largeur, compatible ATS, polyvalent',
        category: 'professional',
        preview: '/templates/ditto-preview.png',
        available: true,
        recommended: ['Engineering', 'Généraliste', 'Corporate'],
    },
    {
        id: 'lapras',
        name: 'Vague Moderne',
        description: 'Header avec effet vague, deux colonnes élégantes',
        category: 'modern',
        preview: '/templates/lapras-preview.png',
        available: true,
        recommended: ['Tech', 'SaaS', 'Innovation'],
    },
];

/** Liste pour galerie / sélection : dérivée de TEMPLATES (source unique) */
export const CV_TEMPLATES = TEMPLATES.filter(t => t.available).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    preview: t.preview,
}));

export function getTemplateById(id: string): TemplateInfo | undefined {
    return TEMPLATES.find(t => t.id === id);
}

export function getAvailableTemplates(): TemplateInfo[] {
    return TEMPLATES.filter(t => t.available);
}
