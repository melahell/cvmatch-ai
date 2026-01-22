// CV Data Normalizer - Converts RAG data to template-friendly format

import { CVData } from "./templates";

interface RAGData {
    profil?: {
        nom?: string;
        prenom?: string;
        titre_principal?: string;
        titres_alternatifs?: string[];
        localisation?: string;
        disponibilite?: string;
        teletravail?: string;
        tjm?: number;
        github?: string;
        portfolio?: string;
        website?: string;
        contact?: {
            email?: string;
            telephone?: string;
            linkedin?: string;
            portfolio?: string;
            github?: string;
        };
        email?: string;
        telephone?: string;
        linkedin?: string;
        elevator_pitch?: string;
        photo_url?: string;
    };
    // Alternative nested format from AI
    identity?: {
        nom?: string;
        prenom?: string;
        titre_principal?: string;
        email?: string;
        telephone?: string;
        linkedin?: string;
        localisation?: string;
        elevator_pitch?: string;
    };
    experiences?: Array<{
        poste?: string;
        entreprise?: string;
        type_entreprise?: string;
        secteur?: string;
        type_contrat?: string;
        debut?: string;
        date_debut?: string;
        fin?: string;
        date_fin?: string;
        actuel?: boolean;
        contexte?: string;
        equipe_size?: number;
        budget_gere?: string;
        realisations?: Array<string | { description?: string; impact?: string; display?: boolean }>;
        technologies?: string[];
        outils?: string[];
        methodologies?: string[];
        clients_references?: string[];
        lieu?: string;
        display?: boolean;
    }>;
    competences?: {
        techniques?: string[] | Array<{ nom: string; niveau?: string; annees_experience?: number }>;
        soft_skills?: string[];
        methodologies?: string[];
        langages_programmation?: string[];
        frameworks?: string[];
        outils?: string[];
        cloud_devops?: string[];
        explicit?: {
            techniques?: string[] | Array<{ nom: string; niveau?: string }>;
            soft_skills?: string[];
            methodologies?: string[];
            langages_programmation?: string[];
            frameworks?: string[];
            outils?: string[];
            cloud_devops?: string[];
        };
        inferred?: {
            techniques?: Array<{ name: string; confidence?: number }>;
            tools?: Array<{ name: string; confidence?: number }>;
            soft_skills?: Array<{ name: string; confidence?: number }>;
        };
        par_domaine?: Record<string, string[]>;
        // CDC format with categories
        categories?: Array<{ name: string; skills: string[] }>;
    };
    formations?: Array<{
        type?: string;
        titre?: string;
        diplome?: string;
        organisme?: string;
        ecole?: string;
        etablissement?: string;
        annee?: string;
        en_cours?: boolean;
        specialite?: string;
        mention?: string;
        display?: boolean;
    }>;
    // Dedicated certifications section
    certifications?: string[] | Array<{
        nom: string;
        organisme?: string;
        date_obtention?: string;
        date_expiration?: string;
        niveau?: string;
        domaine?: string;
    }>;
    langues?: Record<string, string> | Array<{ langue: string; niveau: string; niveau_cecrl?: string; display?: boolean }>;
    // NEW: Dedicated references section
    references?: {
        clients?: Array<{
            nom: string;
            secteur?: string;
            type?: string;
            via_entreprise?: string;
        }>;
        projets_marquants?: Array<{
            nom: string;
            description?: string;
            client?: string;
            annee?: string;
            technologies?: string[];
            resultats?: string;
        }>;
    };
}

/**
 * Sanitize text by fixing spacing issues - AGGRESSIVE version
 */
function sanitizeText(text: unknown): string {
    if (text === null || text === undefined) return '';
    const input = typeof text === "string" ? text : String(text);
    if (!input) return '';

    let result = input
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
 * Handles BOTH old RAG format AND new AI-generated format (categories, identity, etc.)
 */
export function normalizeRAGToCV(raw: any): CVData {
    const data = raw as RAGData;

    // === NORMALIZE PROFIL ===
    // Handle multiple possible structures:
    // 1. profil.nom, profil.prenom, profil.contact.email (RAG format)
    // 2. identity.nom, identity.prenom, identity.contact.email (CVOptimized format)
    // 3. profil.nom but email directly on profil (mixed format)

    const profil = data.profil || {};
    const identity = (data as any).identity || {};
    const contact = profil.contact || identity.contact || {};

    // Get name - try multiple sources
    const nom = profil.nom || identity.nom || '';
    const prenom = profil.prenom || identity.prenom || '';
    const titre = profil.titre_principal || identity.titre_vise || identity.titre_principal || '';
    const email = profil.email || contact.email || identity.contact?.email || '';
    const telephone = profil.telephone || contact.telephone || identity.contact?.telephone || '';
    const localisation = profil.localisation || contact.ville || identity.contact?.ville || '';
    const linkedin = profil.linkedin || contact.linkedin || identity.contact?.linkedin || '';
    const github = profil.github || contact.github || identity.contact?.github || '';
    const portfolio = profil.portfolio || profil.website || contact.portfolio || contact.website || identity.contact?.portfolio || identity.contact?.website || '';
    const elevatorPitch = profil.elevator_pitch || (data as any).elevator_pitch?.text || '';
    const photoUrl = profil.photo_url || identity.photo_url || '';

    // Normalize experiences with sanitization - PRESERVE _format and _relevance_score from adaptive algorithm
    const experiences = (data.experiences || []).map((exp: any) => ({
        poste: sanitizeText(exp.poste),
        entreprise: sanitizeText(exp.entreprise),
        date_debut: exp.date_debut || exp.debut || exp.start_date || exp.startDate || exp.dateDebut || exp.date_start || '',
        date_fin: exp.actuel ? undefined : (exp.date_fin || exp.fin || exp.end_date || exp.endDate || exp.dateFin || exp.date_end || undefined),
        lieu: sanitizeText(exp.lieu || exp.localisation),
        realisations: (exp.realisations || [])
            .filter((r: any) => {
                // Filter out hidden realisations (from CDC compressor)
                if (typeof r === 'object' && r !== null && r.display === false) return false;
                return true;
            })
            .map((r: any) => {
                let text: string;
                if (typeof r === 'string') {
                    text = r;
                } else if (typeof r === 'object' && r !== null) {
                    // Handle {description, impact} format OR {description, display} format
                    const parts = [];
                    if (r.description) parts.push(r.description);
                    if (r.impact && r.impact !== r.description) parts.push(r.impact);
                    text = parts.join(' - ') || JSON.stringify(r);
                } else {
                    text = String(r);
                }
                return sanitizeText(text);
            }),
        // PRESERVE adaptive algorithm metadata for templates
        _format: exp._format,
        _relevance_score: exp._relevance_score,
    })).filter((exp: any) => {
        // Filter out hidden experiences (from CDC compressor)
        const rawExp = (data.experiences || []).find((e: any) => e.poste === exp.poste);
        if (rawExp && (rawExp as any).display === false) return false;
        return true;
    });

    // === NORMALIZE COMPETENCES ===
    // Handle multiple formats:
    // 1. { techniques: [...], soft_skills: [...] } - simple format
    // 2. { explicit: { techniques: [...] }, inferred: {...} } - RAG enriched format
    // 3. { categories: [...] } - CDC/AI format

    let techniques: string[] = [];
    let softSkills: string[] = [];

    if (data.competences) {
        const comp = data.competences as any;

        // Handle CDC 'categories' format
        if (comp.categories && Array.isArray(comp.categories)) {
            comp.categories.forEach((cat: any) => {
                if (!cat.display && cat.display !== undefined) return; // Skip hidden categories
                const rawItems = cat.items || cat.skills || [];
                const items = (rawItems || [])
                    .filter((item: any) => item.display !== false)
                    .map((item: any) => typeof item === 'string' ? item : item.nom || item.name || item.skill || item.value || String(item));

                // Determine if technical or soft skill based on category name
                const catName = (cat.nom || cat.name || '').toLowerCase();
                if (catName.includes('soft') || catName.includes('personnel') || catName.includes('transvers')) {
                    softSkills.push(...items);
                } else {
                    techniques.push(...items);
                }
            });
        }

        // Handle flat arrays directly (techniques_flat, soft_skills_flat from CDC)
        if (comp.techniques_flat && Array.isArray(comp.techniques_flat)) {
            techniques = [...techniques, ...comp.techniques_flat];
        }
        if (comp.soft_skills_flat && Array.isArray(comp.soft_skills_flat)) {
            softSkills = [...softSkills, ...comp.soft_skills_flat];
        }

        // Handle explicit competences (RAG enriched format)
        if (comp.explicit) {
            if (comp.explicit.techniques) {
                techniques = [...techniques, ...comp.explicit.techniques];
            }
            if (comp.explicit.soft_skills) {
                softSkills = [...softSkills, ...comp.explicit.soft_skills];
            }
        }

        // Handle inferred competences and add high-confidence ones
        if (comp.inferred) {
            if (comp.inferred.techniques) {
                comp.inferred.techniques.forEach((t: any) => {
                    if (t.name && (t.confidence === undefined || t.confidence >= 70)) {
                        if (!techniques.includes(t.name)) techniques.push(t.name);
                    }
                });
            }
            if (comp.inferred.tools) {
                comp.inferred.tools.forEach((t: any) => {
                    if (t.name && (t.confidence === undefined || t.confidence >= 70)) {
                        if (!techniques.includes(t.name)) techniques.push(t.name);
                    }
                });
            }
            if (comp.inferred.soft_skills) {
                comp.inferred.soft_skills.forEach((s: any) => {
                    if (s.name && (s.confidence === undefined || s.confidence >= 70)) {
                        if (!softSkills.includes(s.name)) softSkills.push(s.name);
                    }
                });
            }
        }

        // Fallback to direct arrays (simplest format)
        if (techniques.length === 0 && Array.isArray(comp.techniques)) {
            techniques = comp.techniques.map((t: any) => typeof t === 'string' ? t : t.name || String(t));
        }
        if (softSkills.length === 0 && Array.isArray(comp.soft_skills)) {
            softSkills = comp.soft_skills.map((s: any) => typeof s === 'string' ? s : s.name || String(s));
        }
    }

    // Deduplicate
    techniques = Array.from(new Set(techniques));
    softSkills = Array.from(new Set(softSkills));

    // === NORMALIZE FORMATIONS ===
    const formations = (data.formations || [])
        .filter((f: any) => f.display !== false)
        .map((f: any) => ({
            diplome: f.diplome || f.titre || '',
            etablissement: f.etablissement || f.ecole || f.organisme || '',
            annee: f.annee || f.date || ''
        }));

    // === NORMALIZE LANGUES ===
    let langues: Array<{ langue: string; niveau: string }> = [];
    const rawLangues = data.langues || (data as any).langues;

    if (rawLangues) {
        if (Array.isArray(rawLangues)) {
            // Array format: [{ langue: 'Français', niveau: 'Natif' }]
            langues = rawLangues
                .filter((l: any) => l.display !== false)
                .map((l: any) => ({
                    langue: l.langue || l.name || '',
                    niveau: l.niveau || l.level || ''
                }));
        } else if (typeof rawLangues === 'object') {
            // Object format: { 'Français': 'Natif' }
            langues = Object.entries(rawLangues).map(([langue, niveau]) => ({
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
                .map((r: string) => truncateRealisation(r))
        }));

    const limitedTechniques = techniques.slice(0, CV_LIMITS.maxSkills);
    const limitedSoftSkills = softSkills.slice(0, CV_LIMITS.maxSoftSkills);
    const limitedFormations = formations.slice(0, CV_LIMITS.maxFormations);
    const limitedLangues = langues.slice(0, CV_LIMITS.maxLangues);

    // Convert certifications to string array (may be objects or strings)
    let certificationStrings: string[] = [];
    if (data.certifications) {
        certificationStrings = data.certifications.map((c: any) => {
            if (typeof c === 'string') return c;
            if (typeof c === 'object' && c.nom) return c.nom;
            return '';
        }).filter(Boolean);
    }
    const limitedCertifications = certificationStrings.slice(0, CV_LIMITS.maxCertifications);

    const foundClients: string[] = [];
    const clientsBySector: Record<string, string[]> = {};

    // Extract from references.clients (new RAGComplete format)
    if (data.references?.clients) {
        data.references.clients.forEach((c) => {
            if (c.nom && !foundClients.includes(c.nom)) {
                foundClients.push(c.nom);
                const secteur = c.secteur || 'Autre';
                if (!clientsBySector[secteur]) clientsBySector[secteur] = [];
                clientsBySector[secteur].push(c.nom);
            }
        });
    }

    // Extract from experiences.clients_references (new format)
    experiences.forEach(exp => {
        const rawExp = (data.experiences || []).find(e =>
            e.entreprise === exp.entreprise
        );
        if (rawExp?.clients_references) {
            rawExp.clients_references.forEach((c: string) => {
                if (!foundClients.includes(c)) {
                    foundClients.push(c);
                    if (!clientsBySector['Autre']) clientsBySector['Autre'] = [];
                    clientsBySector['Autre'].push(c);
                }
            });
        }
    });

    // Also check cv_data.clients_references if already present (from AI generation)
    const existingClients = (data as any).clients_references;
    if (existingClients?.groupes) {
        existingClients.groupes.forEach((g: any) => {
            (g.clients || []).forEach((c: string) => {
                if (!foundClients.includes(c)) {
                    foundClients.push(c);
                    const secteur = g.secteur || 'Autre';
                    if (!clientsBySector[secteur]) clientsBySector[secteur] = [];
                    clientsBySector[secteur].push(c);
                }
            });
        });
    }

    const secteurs = Object.entries(clientsBySector).map(([secteur, clients]) => ({
        secteur,
        clients
    }));

    return {
        profil: {
            prenom: sanitizeText(prenom),
            nom: sanitizeText(nom),
            titre_principal: sanitizeText(titre),
            email: email,
            telephone: telephone,
            localisation: sanitizeText(localisation),
            linkedin: linkedin,
            github: github || undefined,
            portfolio: portfolio || undefined,
            elevator_pitch: truncateText(sanitizeText(elevatorPitch), CV_LIMITS.maxElevatorPitchLength),
            photo_url: photoUrl
        },
        experiences: limitedExperiences,
        competences: {
            techniques: limitedTechniques,
            soft_skills: limitedSoftSkills
        },
        formations: limitedFormations,
        langues: limitedLangues,
        certifications: limitedCertifications,
        clients_references: foundClients.length > 0 ? {
            clients: foundClients,
            secteurs: secteurs
        } : undefined
    };
}
// Force rebuild Sun Jan  4 16:32:17 CET 2026
