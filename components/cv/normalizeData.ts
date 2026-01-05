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
 * Sanitize text by fixing spacing issues - AGGRESSIVE version
 */
function sanitizeText(text: string | undefined | null): string {
    if (!text) return '';

    let result = text
        // First pass: Add space before ANY uppercase letter that follows a lowercase (handles é→S, etc.)
        .replace(/([a-zàâäéèêëïîôùûüçœæ])([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇŒÆ])/g, '$1 $2')
        // Add space after punctuation if followed by letter
        .replace(/([.,;:!?])([a-zA-ZÀ-ÿ])/g, '$1 $2')
        // Add space around parentheses
        .replace(/\)([a-zA-ZÀ-ÿ])/g, ') $1')
        .replace(/([a-zA-ZÀ-ÿ])\(/g, '$1 (')
        // Fix common French word concatenations
        .replace(/etde/gi, 'et de')
        .replace(/dela/gi, 'de la')
        .replace(/deles/gi, 'de les')
        .replace(/àla/gi, 'à la')
        .replace(/enplace/gi, 'en place')
        .replace(/pourla/gi, 'pour la')
        .replace(/surle/gi, 'sur le')
        .replace(/avecle/gi, 'avec le')
        .replace(/dansle/gi, 'dans le')
        .replace(/etles/gi, 'et les')
        .replace(/avec\+/gi, 'avec +')
        .replace(/\+(\d)/g, '+ $1')
        // Fix word patterns commonly seen in CV extractions
        .replace(/(\d)ans/gi, '$1 ans')
        .replace(/etla/gi, 'et la')
        .replace(/KPIs/gi, 'KPIs')
        // Multiple spaces to single
        .replace(/\s+/g, ' ')
        .trim();

    return result;
}

/**
 * Truncate text to max length
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
 * Content limits for 1-page CV - NO TRUNCATION
 * Text is NOT cut - these are just max counts for sections
 */
const CV_LIMITS = {
    maxExperiences: 5,             // Allow more experiences
    maxRealisationsPerExp: 5,      // Allow more bullets  
    maxRealisationLength: 999,     // No truncation
    maxSkills: 15,                 // Show all skills
    maxSoftSkills: 10,
    maxFormations: 3,
    maxLangues: 5,
    maxCertifications: 5,
    maxElevatorPitchLength: 999    // No truncation
};

/**
 * DO NOT truncate - return text as-is
 */
function truncateRealisation(text: string): string {
    // No truncation - keep full text
    return text;
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

    // Apply content limits for 1-page guarantee
    const limitedExperiences = experiences
        .slice(0, CV_LIMITS.maxExperiences)
        .map(exp => ({
            ...exp,
            realisations: exp.realisations
                .slice(0, CV_LIMITS.maxRealisationsPerExp)
                .map(r => truncateRealisation(r))
        }));

    const limitedTechniques = techniques.slice(0, CV_LIMITS.maxSkills);
    const limitedSoftSkills = softSkills.slice(0, CV_LIMITS.maxSoftSkills);
    const limitedFormations = formations.slice(0, CV_LIMITS.maxFormations);
    const limitedLangues = langues.slice(0, CV_LIMITS.maxLangues);
    const limitedCertifications = data.certifications?.slice(0, CV_LIMITS.maxCertifications);

    return {
        profil: {
            prenom: sanitizeText(profil.prenom),
            nom: sanitizeText(profil.nom),
            titre_principal: sanitizeText(profil.titre_principal),
            email: profil.email || contact.email || '',
            telephone: profil.telephone || contact.telephone || '',
            localisation: sanitizeText(profil.localisation),
            linkedin: profil.linkedin || contact.linkedin || '',
            elevator_pitch: truncateText(sanitizeText(profil.elevator_pitch), CV_LIMITS.maxElevatorPitchLength),
            photo_url: profil.photo_url
        },
        experiences: limitedExperiences,
        competences: {
            techniques: limitedTechniques,
            soft_skills: limitedSoftSkills
        },
        formations: limitedFormations,
        langues: limitedLangues,
        certifications: limitedCertifications
    };
}
// Force rebuild Sun Jan  4 16:32:17 CET 2026
