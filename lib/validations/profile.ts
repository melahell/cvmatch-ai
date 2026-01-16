import { z } from 'zod';

// Helper validators
const isValidDate = (date: string) => {
    if (!date) return true; // Optional dates
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
};

const phoneRegex = /^[\d\s+()-]+$/;

// Personal Info Schema
export const personalInfoSchema = z.object({
    prenom: z.string().min(2, 'Prénom requis (min 2 caractères)'),
    nom: z.string().min(2, 'Nom requis (min 2 caractères)'),
    email: z.string().email('Email invalide'),
    telephone: z.string().regex(phoneRegex, 'Format téléphone invalide').optional().or(z.literal('')),
    adresse: z.string().optional(),
    localisation: z.string().optional(),
    titre_principal: z.string().min(3, 'Titre professionnel requis (min 3 caractères)'),
    linkedin: z.string().url('URL LinkedIn invalide').optional().or(z.literal('')),
    github: z.string().url('URL GitHub invalide').optional().or(z.literal('')),
    site_web: z.string().url('URL invalide').optional().or(z.literal('')),
});

// Experience Schema
export const experienceSchema = z.object({
    titre: z.string().min(2, 'Titre requis'),
    entreprise: z.string().min(2, 'Entreprise requise'),
    date_debut: z.string().refine(isValidDate, 'Date de début invalide'),
    date_fin: z.string().refine(isValidDate, 'Date de fin invalide').optional().or(z.literal('')),
    description: z.string().optional(),
    lieu: z.string().optional(),
    poids: z.enum(['important', 'inclus', 'exclu']).default('inclus'),
}).refine(
    (data) => {
        if (!data.date_fin || data.date_fin === '') return true;
        return new Date(data.date_debut) <= new Date(data.date_fin);
    },
    { message: 'La date de début doit être avant la date de fin', path: ['date_fin'] }
);

// Formation/Education Schema
export const formationSchema = z.object({
    diplome: z.string().min(2, 'Diplôme requis'),
    etablissement: z.string().min(2, 'Établissement requis'),
    date_debut: z.string().refine(isValidDate, 'Date invalide').optional().or(z.literal('')),
    date_fin: z.string().refine(isValidDate, 'Date invalide').optional().or(z.literal('')),
    description: z.string().optional(),
    lieu: z.string().optional(),
    poids: z.enum(['important', 'inclus', 'exclu']).default('inclus'),
});

// Skill Schema
export const skillSchema = z.object({
    nom: z.string().min(1, 'Nom de compétence requis'),
    niveau: z.number().min(1).max(5).optional(),
    poids: z.enum(['important', 'inclus', 'exclu']).default('inclus'),
});

// Language Schema
export const languageSchema = z.object({
    langue: z.string().min(2, 'Langue requise'),
    niveau: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Natif']).optional(),
    poids: z.enum(['important', 'inclus', 'exclu']).default('inclus'),
});

// Types exports
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Formation = z.infer<typeof formationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Language = z.infer<typeof languageSchema>;
