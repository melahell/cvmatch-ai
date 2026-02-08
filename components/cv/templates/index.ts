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

export interface TemplateProps {
    data: CVData;
    includePhoto?: boolean;
    jobContext?: JobContext;
    dense?: boolean;
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
        name: 'Modern',
        description: 'Sidebar gauche sombre avec accents colorés, layout professionnel',
        category: 'modern',
        preview: '/templates/modern-preview.png',
        available: true,
        recommended: ['Business', 'Consulting', 'Management'],
    },
    {
        id: 'tech',
        name: 'Tech',
        description: 'Style terminal, catégorisation des compétences, optimisé développeurs',
        category: 'tech',
        preview: '/templates/tech-preview.png',
        available: true,
        recommended: ['Développeur', 'Data', 'DevOps'],
    },
    {
        id: 'classic',
        name: 'Classic',
        description: 'Header formel avec deux colonnes, format traditionnel',
        category: 'classic',
        preview: '/templates/classic-preview.png',
        available: true,
        recommended: ['Finance', 'Droit', 'Administration'],
    },
    {
        id: 'creative',
        name: 'Creative',
        description: 'Sidebar droite colorée, timeline avec émojis, design artistique',
        category: 'creative',
        preview: '/templates/creative-preview.png',
        available: true,
        recommended: ['Design', 'Marketing', 'Communication'],
    },
    // ── Reactive Resume inspired (6) ──
    {
        id: 'pikachu',
        name: 'Pikachu',
        description: 'Header gradient avec timeline dots, single-column dynamique',
        category: 'modern',
        preview: '/templates/pikachu-preview.png',
        available: true,
        recommended: ['Marketing', 'Startup', 'Digital'],
    },
    {
        id: 'bronzor',
        name: 'Bronzor',
        description: 'Single-column minimaliste, typographie élégante, sans sidebar',
        category: 'minimal',
        preview: '/templates/bronzor-preview.png',
        available: true,
        recommended: ['Juridique', 'Académique', 'Direction'],
    },
    {
        id: 'gengar',
        name: 'Gengar',
        description: 'Sidebar gauche avec header intégré dans la couleur, fond sombre',
        category: 'professional',
        preview: '/templates/gengar-preview.png',
        available: true,
        recommended: ['Tech', 'Data', 'Product'],
    },
    {
        id: 'chikorita',
        name: 'Chikorita',
        description: 'Sidebar DROITE avec fond coloré solide et texte blanc',
        category: 'modern',
        preview: '/templates/chikorita-preview.png',
        available: true,
        recommended: ['UX/UI', 'Growth', 'Consulting'],
    },
    {
        id: 'ditto',
        name: 'Ditto',
        description: 'Bannière header pleine largeur, body single-column ATS-friendly',
        category: 'professional',
        preview: '/templates/ditto-preview.png',
        available: true,
        recommended: ['Engineering', 'Généraliste', 'Corporate'],
    },
    {
        id: 'lapras',
        name: 'Lapras',
        description: 'Header gradient avec effet vague, deux colonnes aquatiques',
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
