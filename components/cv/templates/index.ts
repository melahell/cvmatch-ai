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
        elevator_pitch?: string;
        photo_url?: string;
    };
    experiences: Array<{
        poste: string;
        entreprise: string;
        date_debut: string;
        date_fin?: string;
        lieu?: string;
        realisations: string[];
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
    category: 'modern' | 'classic' | 'tech' | 'creative';
    preview: string;
    available: boolean;
    recommended?: string[];
}

// Template Registry
export const TEMPLATES: TemplateInfo[] = [
    {
        id: 'modern',
        name: 'Modern',
        description: 'Design épuré et professionnel, idéal pour la plupart des postes',
        category: 'modern',
        preview: '/templates/modern-preview.png',
        available: true,
        recommended: ['Business', 'Consulting', 'Management'],
    },
    {
        id: 'tech',
        name: 'Tech',
        description: 'Optimisé pour les profils techniques, focus sur les compétences',
        category: 'tech',
        preview: '/templates/tech-preview.png',
        available: true,
        recommended: ['Développeur', 'Data', 'DevOps'],
    },
    {
        id: 'classic',
        name: 'Classic',
        description: 'Format traditionnel, sobre et formel',
        category: 'classic',
        preview: '/templates/classic-preview.png',
        available: true,
        recommended: ['Finance', 'Droit', 'Administration'],
    },
    {
        id: 'creative',
        name: 'Creative',
        description: 'Design moderne et coloré pour les profils créatifs',
        category: 'creative',
        preview: '/templates/creative-preview.png',
        available: true,
        recommended: ['Design', 'Marketing', 'Communication'],
    },
];

export function getTemplateById(id: string): TemplateInfo | undefined {
    return TEMPLATES.find(t => t.id === id);
}

export function getAvailableTemplates(): TemplateInfo[] {
    return TEMPLATES.filter(t => t.available);
}
