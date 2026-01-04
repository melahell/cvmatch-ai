// CV Data Normalizer - Converts RAG data to template-friendly format

import { CVData } from "./templates";

interface RAGData {
    profil?: {
        nom?: string;
        prenom?: string;
        titre_principal?: string;
        localisation?: string;
        contact?: {
            email?: string;
            telephone?: string;
            linkedin?: string;
        };
        email?: string;
        telephone?: string;
        linkedin?: string;
        elevator_pitch?: string;
        photo_url?: string;
    };
    experiences?: Array<{
        poste?: string;
        entreprise?: string;
        debut?: string;
        date_debut?: string;
        fin?: string;
        date_fin?: string;
        actuel?: boolean;
        realisations?: Array<string | { description?: string; impact?: string }>;
        technologies?: string[];
        lieu?: string;
    }>;
    competences?: {
        techniques?: string[];
        soft_skills?: string[];
        explicit?: {
            techniques?: string[];
            soft_skills?: string[];
        };
        inferred?: {
            techniques?: Array<{ name: string; confidence?: number }>;
            tools?: Array<{ name: string; confidence?: number }>;
            soft_skills?: Array<{ name: string; confidence?: number }>;
        };
    };
    formations?: Array<{
        diplome?: string;
        ecole?: string;
        etablissement?: string;
        annee?: string;
    }>;
    langues?: Record<string, string> | Array<{ langue: string; niveau: string }>;
    certifications?: string[];
}

/**
 * Sanitize text by fixing spacing issues
 */
function sanitizeText(text: string | undefined | null): string {
    if (!text) return '';
    return text
        .replace(/([.,;:!?])([^\s\d])/g, '$1 $2')  // Espace après ponctuation
        .replace(/([a-z])([A-Z])/g, '$1 $2')       // Espace avant majuscule (camelCase)
        .replace(/\s+/g, ' ')                       // Multiple spaces -> 1
        .replace(/\( /g, '(')                       // Pas d'espace après (
        .replace(/ \)/g, ')')                       // Pas d'espace avant )
        .trim();
}

/**
 * Truncate text to max length while keeping complete sentences
 */
function truncateText(text: string, maxLength: number = 300): string {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    if (lastPeriod > maxLength * 0.5) {
        return truncated.substring(0, lastPeriod + 1);
    }
    return truncated.trim() + '...';
}

/**
 * Normalize RAG data to CVData format expected by templates
 */
export function normalizeRAGToCV(raw: any): CVData {
    const data = raw as RAGData;

    // Normalize profil
    const profil = data.profil || {};
    const contact = profil.contact || {};

    // Normalize experiences with sanitization
    const experiences = (data.experiences || []).map(exp => ({
        poste: sanitizeText(exp.poste),
        entreprise: sanitizeText(exp.entreprise),
        date_debut: exp.date_debut || exp.debut || '',
        date_fin: exp.actuel ? undefined : (exp.date_fin || exp.fin || undefined),
        lieu: sanitizeText(exp.lieu),
        realisations: (exp.realisations || []).map(r => {
            let text: string;
            if (typeof r === 'string') {
                text = r;
            } else if (typeof r === 'object' && r !== null) {
                // Handle {description, impact} format
                const parts = [];
                if (r.description) parts.push(r.description);
                if (r.impact && r.impact !== r.description) parts.push(r.impact);
                text = parts.join(' - ') || JSON.stringify(r);
            } else {
                text = String(r);
            }
            return sanitizeText(text);
        })
    }));

    // Normalize competences
    let techniques: string[] = [];
    let softSkills: string[] = [];

    if (data.competences) {
        const comp = data.competences;

        // Check for explicit competences (new format)
        if (comp.explicit) {
            techniques = [...(comp.explicit.techniques || [])];
            softSkills = [...(comp.explicit.soft_skills || [])];
        }

        // Check for inferred competences and add high-confidence ones
        if (comp.inferred) {
            if (comp.inferred.techniques) {
                comp.inferred.techniques.forEach(t => {
                    if (t.name && (t.confidence === undefined || t.confidence >= 70)) {
                        if (!techniques.includes(t.name)) techniques.push(t.name);
                    }
                });
            }
            if (comp.inferred.tools) {
                comp.inferred.tools.forEach(t => {
                    if (t.name && (t.confidence === undefined || t.confidence >= 70)) {
                        if (!techniques.includes(t.name)) techniques.push(t.name);
                    }
                });
            }
            if (comp.inferred.soft_skills) {
                comp.inferred.soft_skills.forEach(s => {
                    if (s.name && (s.confidence === undefined || s.confidence >= 70)) {
                        if (!softSkills.includes(s.name)) softSkills.push(s.name);
                    }
                });
            }
        }

        // Fallback to direct arrays (simple format)
        if (techniques.length === 0 && Array.isArray(comp.techniques)) {
            techniques = comp.techniques.map(t => typeof t === 'string' ? t : (t as any).name || String(t));
        }
        if (softSkills.length === 0 && Array.isArray(comp.soft_skills)) {
            softSkills = comp.soft_skills.map(s => typeof s === 'string' ? s : (s as any).name || String(s));
        }
    }

    // Normalize formations
    const formations = (data.formations || []).map(f => ({
        diplome: f.diplome || '',
        etablissement: f.etablissement || f.ecole || '',
        annee: f.annee
    }));

    // Normalize langues
    let langues: Array<{ langue: string; niveau: string }> = [];
    if (data.langues) {
        if (Array.isArray(data.langues)) {
            langues = data.langues;
        } else {
            // Convert object { "Français": "Natif" } to array
            langues = Object.entries(data.langues).map(([langue, niveau]) => ({
                langue,
                niveau: String(niveau)
            }));
        }
    }

    return {
        profil: {
            prenom: sanitizeText(profil.prenom),
            nom: sanitizeText(profil.nom),
            titre_principal: sanitizeText(profil.titre_principal),
            email: profil.email || contact.email || '',
            telephone: profil.telephone || contact.telephone || '',
            localisation: sanitizeText(profil.localisation),
            linkedin: profil.linkedin || contact.linkedin || '',
            elevator_pitch: truncateText(sanitizeText(profil.elevator_pitch), 400),
            photo_url: profil.photo_url
        },
        experiences,
        competences: {
            techniques,
            soft_skills: softSkills
        },
        formations,
        langues,
        certifications: data.certifications
    };
}
