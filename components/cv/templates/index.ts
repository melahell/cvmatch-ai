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

/** Centralized defaults — single source of truth for all templates */
export const DL_DEFAULTS: Required<DisplayLimits> = {
    maxSkills: 20,
    maxSoftSkills: 8,
    maxRealisationsPerExp: 6,
    maxClientsPerExp: 6,
    maxClientsReferences: 30,
    maxCertifications: 10,
    maxProjects: 5,
    maxFormations: 5,
    maxLangues: 10,
};

/** Merge user displayLimits with centralized defaults */
export function withDL(dl?: DisplayLimits): Required<DisplayLimits> {
    return { ...DL_DEFAULTS, ...(dl || {}) };
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

export type TemplateSource = 'reactive-resume' | 'cv-crush';

export interface TemplateInfo {
    id: string;
    name: string;
    description: string;
    category: 'modern' | 'classic' | 'tech' | 'creative' | 'professional' | 'minimal';
    preview: string;
    available: boolean;
    recommended?: string[];
    /** Distinguishes Reactive Resume templates from CV-Crush originals */
    source: TemplateSource;
}

// Template Registry — 10+ distinct templates, each with a unique layout
export const TEMPLATES: TemplateInfo[] = [
    // ── CV-Crush originals (4) ──
    {
        id: 'modern',
        name: 'Sidebar Pro',
        description: 'Sidebar sombre, accents colorés — management & conseil',
        category: 'modern',
        preview: '/templates/modern-preview.png',
        available: true,
        recommended: ['Business', 'Consulting', 'Management'],
        source: 'cv-crush',
    },
    {
        id: 'tech',
        name: 'Développeur',
        description: 'Profils techniques, compétences catégorisées',
        category: 'tech',
        preview: '/templates/tech-preview.png',
        available: true,
        recommended: ['Développeur', 'Data', 'DevOps'],
        source: 'cv-crush',
    },
    {
        id: 'classic',
        name: 'Classique',
        description: 'Deux colonnes, format traditionnel et sobre',
        category: 'classic',
        preview: '/templates/classic-preview.png',
        available: true,
        recommended: ['Finance', 'Droit', 'Administration'],
        source: 'cv-crush',
    },
    {
        id: 'creative',
        name: 'Créatif',
        description: 'Design coloré, sidebar droite, timeline dynamique',
        category: 'creative',
        preview: '/templates/creative-preview.png',
        available: true,
        recommended: ['Design', 'Marketing', 'Communication'],
        source: 'cv-crush',
    },
    // ── Premium (6) ──
    {
        id: 'elegant',
        name: 'Élégant',
        description: 'Minimaliste luxe, typographie raffinée, séparateurs fins',
        category: 'minimal',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Direction', 'Finance', 'Consulting'],
        source: 'cv-crush',
    },
    {
        id: 'executive',
        name: 'Executive',
        description: 'Sidebar sombre à gauche, timeline expériences, look corporate',
        category: 'professional',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Management', 'Consulting', 'Business'],
        source: 'cv-crush',
    },
    {
        id: 'terminal',
        name: 'Terminal',
        description: 'Style IDE/terminal, monospace accents, sidebar dark',
        category: 'tech',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Développeur', 'DevOps', 'Data Engineer'],
        source: 'cv-crush',
    },
    {
        id: 'metropolis',
        name: 'Metropolis',
        description: 'Grand header gradient diagonal, body deux colonnes',
        category: 'modern',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Marketing', 'Product', 'Polyvalent'],
        source: 'cv-crush',
    },
    {
        id: 'horizon',
        name: 'Horizon',
        description: 'Bande latérale fine colorée, blanc aéré, ATS-friendly',
        category: 'minimal',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Juridique', 'Académique', 'Universel'],
        source: 'cv-crush',
    },
    {
        id: 'catalyst',
        name: 'Catalyst',
        description: 'Header gradient clip-path diagonal, sections en cartes',
        category: 'creative',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Design', 'UX/UI', 'Startup'],
        source: 'cv-crush',
    },
    // ── Reactive Resume (6 existing) ──
    {
        id: 'pikachu',
        name: 'Gradient Moderne',
        description: 'Header dégradé, timeline, une colonne impactante',
        category: 'modern',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Marketing', 'Startup', 'Digital'],
        source: 'reactive-resume',
    },
    {
        id: 'bronzor',
        name: 'Élégant Minimal',
        description: 'Minimaliste sans sidebar, typographie raffinée',
        category: 'minimal',
        preview: '/templates/bronzor-preview.png',
        available: true,
        recommended: ['Juridique', 'Académique', 'Direction'],
        source: 'reactive-resume',
    },
    {
        id: 'gengar',
        name: 'Pro Sombre',
        description: 'Sidebar intégrée au header, fond sombre contrasté',
        category: 'professional',
        preview: '/templates/gengar-preview.png',
        available: true,
        recommended: ['Tech', 'Data', 'Product'],
        source: 'reactive-resume',
    },
    {
        id: 'chikorita',
        name: 'Sidebar Couleur',
        description: 'Sidebar droite colorée, texte blanc, look vibrant',
        category: 'modern',
        preview: '/templates/chikorita-preview.png',
        available: true,
        recommended: ['UX/UI', 'Growth', 'Consulting'],
        source: 'reactive-resume',
    },
    {
        id: 'ditto',
        name: 'ATS Classique',
        description: 'Bannière pleine largeur, compatible ATS, polyvalent',
        category: 'professional',
        preview: '/templates/ditto-preview.png',
        available: true,
        recommended: ['Engineering', 'Généraliste', 'Corporate'],
        source: 'reactive-resume',
    },
    {
        id: 'lapras',
        name: 'Vague Moderne',
        description: 'Header avec effet vague, deux colonnes élégantes',
        category: 'modern',
        preview: '/templates/lapras-preview.png',
        available: true,
        recommended: ['Tech', 'SaaS', 'Innovation'],
        source: 'reactive-resume',
    },
    // ── Reactive Resume (7 additional) ──
    {
        id: 'azurill',
        name: 'Azurill Compact',
        description: 'Header compact avec barre colorée, une colonne',
        category: 'modern',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Généraliste', 'Admin'],
        source: 'reactive-resume',
    },
    {
        id: 'glalie',
        name: 'Glalie Pro',
        description: 'Header sombre pleine largeur, contenu aéré',
        category: 'professional',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Tech', 'Data'],
        source: 'reactive-resume',
    },
    {
        id: 'kakuna',
        name: 'Kakuna Sobre',
        description: 'Une colonne sobre, ligne d\'accent en haut',
        category: 'minimal',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Finance', 'Juridique'],
        source: 'reactive-resume',
    },
    {
        id: 'leafish',
        name: 'Leafish Nature',
        description: 'Header dégradé doux, une colonne',
        category: 'creative',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Environnement', 'Associatif'],
        source: 'reactive-resume',
    },
    {
        id: 'nosepass',
        name: 'Nosepass Épuré',
        description: 'Barre latérale fine, style épuré',
        category: 'minimal',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Recherche', 'Académique'],
        source: 'reactive-resume',
    },
    {
        id: 'onyx',
        name: 'Onyx Sidebar',
        description: 'Sidebar gauche sombre, style professionnel',
        category: 'professional',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Consulting', 'Management'],
        source: 'reactive-resume',
    },
    {
        id: 'rhyhorn',
        name: 'Rhyhorn Robuste',
        description: 'Une colonne robuste, titres soulignés',
        category: 'classic',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Engineering', 'Corporate'],
        source: 'reactive-resume',
    },
    // ── RR Améliorés (10) ──
    { id: 'aurora', name: 'Aurora', description: 'Dégradé doux, cartes légères, espacement soigné', category: 'modern', preview: '/templates/pikachu-preview.png', available: true, recommended: ['Marketing', 'Startup'], source: 'reactive-resume' },
    { id: 'carbon', name: 'Carbon', description: 'Fond gris léger, bordures fines, style éditorial', category: 'professional', preview: '/templates/pikachu-preview.png', available: true, recommended: ['Tech', 'Data'], source: 'reactive-resume' },
    { id: 'slate', name: 'Slate', description: 'Tons slate, séparateurs nets, très lisible', category: 'minimal', preview: '/templates/pikachu-preview.png', available: true, recommended: ['Juridique', 'Académique'], source: 'reactive-resume' },
    { id: 'ivory', name: 'Ivory', description: 'Fond ivoire, accents discrets, très lisible', category: 'classic', preview: '/templates/pikachu-preview.png', available: true, recommended: ['Finance', 'Direction'], source: 'reactive-resume' },
    { id: 'apex', name: 'Apex', description: 'Header fort, sections numérotées, ligne géométrique', category: 'professional', preview: '/templates/pikachu-preview.png', available: true, recommended: ['Consulting', 'Management'], source: 'reactive-resume' },
    { id: 'vertex', name: 'Vertex', description: 'Deux colonnes (compétences + formation), exp pleine largeur', category: 'tech', preview: '/templates/pikachu-preview.png', available: true, recommended: ['Engineering', 'Product'], source: 'reactive-resume' },
    { id: 'prism', name: 'Prism', description: 'Cartes arrondies, barres d\'accent colorées', category: 'creative', preview: '/templates/pikachu-preview.png', available: true, recommended: ['Design', 'UX'], source: 'reactive-resume' },
    { id: 'lumen', name: 'Lumen', description: 'Fond blanc pur, titres soulignés, très pro', category: 'minimal', preview: '/templates/pikachu-preview.png', available: true, recommended: ['Corporate', 'Généraliste'], source: 'reactive-resume' },
    { id: 'helix', name: 'Helix', description: 'Timeline pastilles, bullets soignés', category: 'modern', preview: '/templates/pikachu-preview.png', available: true, recommended: ['Tech', 'Digital'], source: 'reactive-resume' },
    { id: 'nova', name: 'Nova', description: 'Bandeau header sombre, contenu clair, contraste fort', category: 'professional', preview: '/templates/pikachu-preview.png', available: true, recommended: ['Tech', 'Data'], source: 'reactive-resume' },
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

/** Get templates by source for UI grouping (Reactive Resume vs CV-Crush) */
export function getTemplatesBySource(source: TemplateSource): TemplateInfo[] {
    return TEMPLATES.filter(t => t.available && t.source === source);
}
