// CV Data Normalizer - Converts RAG data to template-friendly format

import { CVData } from "./templates";
import { logger } from "@/lib/utils/logger";
import { coerceBoolean } from "@/lib/utils/coerce-boolean";

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
function coerceToDisplayString(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (typeof value === "object") {
        const v: any = value;
        const candidate =
            v.nom ??
            v.name ??
            v.skill ??
            v.value ??
            v.label ??
            v.title ??
            v.titre ??
            v.poste ??
            v.entreprise ??
            v.description ??
            v.impact;
        if (typeof candidate === "string") return candidate;
        if (typeof candidate === "number" || typeof candidate === "boolean") return String(candidate);
        return "";
    }
    return "";
}

function sanitizeText(text: unknown): string {
    const input = coerceToDisplayString(text);
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

const normalizeLoose = (value: string) => {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "");
};

const normalizeForMatch = (value: unknown) => {
    if (value === null || value === undefined) return "";
    const s = typeof value === "string" ? value : String(value);
    return s
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
};

const isPlaceholderValue = (value: string) => {
    const v = normalizeLoose(value)
        .replace(/\s+/g, " ")
        .replace(/[^\p{L}\p{N}\s]/gu, "");
    if (!v) return true;
    return v === "non renseigne" || v === "non renseign" || v === "nr" || v === "n a" || v === "na" || v === "none" || v === "null" || v === "undefined";
};

const cleanRawString = (value: unknown) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (isPlaceholderValue(trimmed)) return "";
    return trimmed;
};

const pickFirstString = (...candidates: unknown[]) => {
    for (const c of candidates) {
        const s = cleanRawString(c);
        if (s) return s;
    }
    return "";
};

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
    maxExperiences: 10,
    maxRealisationsPerExp: 20,  // Solution 2.1: Augmenté de 8 à 20 pour garder plus de réalisations
    maxRealisationLength: 999,     // No truncation
    maxSkills: 28,
    maxSoftSkills: 14,
    maxFormations: 5,
    maxLangues: 6,
    maxCertifications: 8,
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
    const contactAny = contact as any;

    // Get name - try multiple sources
    const nom = profil.nom || identity.nom || '';
    const prenom = profil.prenom || identity.prenom || '';
    const titre = profil.titre_principal || identity.titre_vise || identity.titre_principal || '';
    const email = pickFirstString(
        profil.email,
        contactAny.email,
        contactAny.mail,
        contactAny.email_pro,
        identity?.contact?.email
    );
    const telephone = pickFirstString(
        profil.telephone,
        contactAny.telephone,
        contactAny.tel,
        contactAny.phone,
        contactAny.mobile,
        identity?.contact?.telephone
    );
    const localisation = pickFirstString(
        profil.localisation,
        contactAny.ville,
        contactAny.city,
        contactAny.localisation,
        identity?.contact?.ville
    );
    const linkedin = pickFirstString(
        profil.linkedin,
        contactAny.linkedin,
        contactAny.linkedin_url,
        contactAny.linkedinUrl,
        identity?.contact?.linkedin
    );
    const github = pickFirstString(
        profil.github,
        contactAny.github,
        contactAny.github_url,
        contactAny.githubUrl,
        identity?.contact?.github
    );
    const portfolio = pickFirstString(
        profil.portfolio,
        profil.website,
        contactAny.portfolio,
        contactAny.website,
        contactAny.site,
        identity?.contact?.portfolio,
        identity?.contact?.website
    );
    const elevatorPitch = profil.elevator_pitch || (data as any).elevator_pitch?.text || '';
    const photoUrl = profil.photo_url || identity.photo_url || '';

    // Normalize experiences with sanitization - PRESERVE _format and _relevance_score from adaptive algorithm
    const experiences = (data.experiences || []).map((exp: any, i: number) => {
        // Phase 2 Diagnostic: Log avant normalisation
        const beforeCount = exp.realisations?.length || 0;
        logger.debug(`[normalizeRAGToCV] Exp ${i}: ${beforeCount} realisations before filter`);

        // Phase 3 Diagnostic: Log données essentielles
        const hasEssentialData = !!(exp.poste && exp.entreprise && exp.date_debut);
        if (!hasEssentialData) {
            logger.warn(`[normalizeRAGToCV] Exp ${i} missing essential data`, {
                poste: exp.poste,
                entreprise: exp.entreprise,
                date_debut: exp.date_debut
            });
        }

        const realisations = (exp.realisations || [])
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
                    text = parts.join(' - ') || "";
                } else {
                    text = String(r);
                }
                const cleaned = sanitizeText(text);
                if (!cleaned) return "";
                if (cleaned.includes("[object Object]")) return "";
                return cleaned;
            });

        // Phase 2 Diagnostic: Log après sanitize
        logger.debug(`[normalizeRAGToCV] Exp ${i}: ${realisations.length} realisations after sanitize`);

        const endCandidate =
            exp.date_fin ||
            exp.fin ||
            exp.end_date ||
            exp.endDate ||
            exp.dateFin ||
            exp.date_end ||
            undefined;

        const endLower = typeof endCandidate === "string" ? endCandidate.trim().toLowerCase() : "";
        const endIsPresent =
            endLower === "présent" ||
            endLower === "present" ||
            endLower === "now" ||
            endLower === "aujourd'hui";

        const actuel =
            (coerceBoolean(exp.actuel ?? exp.current ?? exp.is_current) ??
                (endIsPresent ? true : undefined) ??
                false) === true;

        return {
            poste: sanitizeText(exp.poste),
            entreprise: sanitizeText(exp.entreprise),
            date_debut: exp.date_debut || exp.debut || exp.start_date || exp.startDate || exp.dateDebut || exp.date_start || '',
            // IMPORTANT: `actuel` peut venir en string ("false") depuis RAG/IA → normaliser avant décision
            actuel: endCandidate && !endIsPresent ? false : actuel,
            date_fin: (endCandidate && !endIsPresent) ? endCandidate : (actuel ? undefined : endCandidate),
            lieu: sanitizeText(exp.lieu || exp.localisation),
            realisations,
            // Solution 6.1: Extraire contexte opérationnel
            contexte: sanitizeText(exp.contexte || exp.context || exp.environnement || ''),
            technologies: (exp.technologies || exp.technologies_utilisees || []).map((t: any) => sanitizeText(t)).filter(Boolean),
            outils: (exp.outils || exp.tools || []).map((o: any) => sanitizeText(o)).filter(Boolean),
            methodologies: (exp.methodologies || exp.methodes || []).map((m: any) => sanitizeText(m)).filter(Boolean),
            // PRESERVE adaptive algorithm metadata for templates
            _format: exp._format,
            _relevance_score: exp._relevance_score,
        };
    });

    // Phase 3 Diagnostic: Log avant filtre
    const incompleteExps = experiences.filter((exp: any) => 
        !exp.poste || !exp.entreprise || !exp.date_debut
    );
    if (incompleteExps.length > 0) {
        logger.warn(`[normalizeRAGToCV] ${incompleteExps.length} incomplete experiences before filter`, {
            incomplete: incompleteExps.map((e: any, i: number) => ({
                index: i,
                poste: e.poste,
                entreprise: e.entreprise,
                date_debut: e.date_debut
            }))
        });
    }

    const filteredExperiences = experiences.filter((exp: any) => {
        // Filter out hidden experiences (from CDC compressor)
        const rawExp = (data.experiences || []).find((e: any) => e.poste === exp.poste);
        if (rawExp && (rawExp as any).display === false) return false;
        
        // Solution 3.1: Filtrer les expériences sans données essentielles
        // Au moins 2 des 3 champs doivent être présents (poste, entreprise, date_debut)
        const hasPoste = !!(exp.poste && exp.poste.trim());
        const hasEntreprise = !!(exp.entreprise && exp.entreprise.trim());
        const hasDate = !!(exp.date_debut && exp.date_debut.trim());
        const essentialFieldsCount = [hasPoste, hasEntreprise, hasDate].filter(Boolean).length;
        
        if (essentialFieldsCount < 2) {
            logger.warn(`[normalizeRAGToCV] Filtering out incomplete experience`, {
                poste: exp.poste,
                entreprise: exp.entreprise,
                date_debut: exp.date_debut
            });
            return false;
        }
        
        return true;
    });

    // === NORMALIZE COMPETENCES ===
    // Handle multiple formats:
    // 1. { techniques: [...], soft_skills: [...] } - simple format
    // 2. { explicit: { techniques: [...] }, inferred: {...} } - RAG enriched format
    // 3. { categories: [...] } - CDC/AI format
    // 4. skill_map (from buildRAGForCVPrompt) - flattened format

    let techniques: string[] = [];
    let softSkills: string[] = [];

    // NOUVEAU : Extraire depuis skill_map si competences vide ou incomplet
    if ((!data.competences || (data.competences && !data.competences.techniques && !data.competences.explicit)) && (data as any).skill_map) {
        const skillMap = (data as any).skill_map;
        // Phase 5 Diagnostic: Log extraction compétences
        logger.debug(`[normalizeRAGToCV] Found skill_map with ${Object.keys(skillMap).length} skills`);
        const allSkills = Object.keys(skillMap);
        
        // Filtrer soft skills (mots-clés connus)
        const softSkillKeywords = ['soft', 'communication', 'leadership', 'management', 'team', 'problem solving',
            'automation mindset', 'learning agility', 'strategic thinking', 'pragmatisme', 'persistence', 'autonomie',
            'diplomatie', 'rigueur', 'synthèse', 'orientation client', 'force de proposition', 'adaptabilité'];
        
        techniques = allSkills.filter(skill => {
            const skillLower = skill.toLowerCase();
            return !softSkillKeywords.some(keyword => skillLower.includes(keyword));
        });
        
        softSkills = allSkills.filter(skill => {
            const skillLower = skill.toLowerCase();
            return softSkillKeywords.some(keyword => skillLower.includes(keyword));
        });
    }

    if (data.competences) {
        const comp = data.competences as any;

        // Handle CDC 'categories' format
        if (comp.categories && Array.isArray(comp.categories)) {
            comp.categories.forEach((cat: any) => {
                if (!cat.display && cat.display !== undefined) return; // Skip hidden categories
                const rawItems = cat.items || cat.skills || [];
                const items = (rawItems || [])
                    .filter((item: any) => item.display !== false)
                    .map((item: any) => sanitizeText(item))
                    .filter(Boolean);

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
            techniques = comp.techniques.map((t: any) => sanitizeText(t)).filter(Boolean);
        }
        if (softSkills.length === 0 && Array.isArray(comp.soft_skills)) {
            softSkills = comp.soft_skills.map((s: any) => sanitizeText(s)).filter(Boolean);
        }
    }

    // Deduplicate
    techniques = Array.from(new Set(techniques));
    softSkills = Array.from(new Set(softSkills));

    // === NORMALIZE FORMATIONS ===
    const rawFormations = [
        ...(Array.isArray((data as any).formations) ? (data as any).formations : []),
        ...(Array.isArray((profil as any).formations) ? (profil as any).formations : []),
        ...(Array.isArray((identity as any).formations) ? (identity as any).formations : []),
        ...(Array.isArray((data as any).education) ? (data as any).education : []),
        ...(Array.isArray((data as any).parcours) ? (data as any).parcours : []),
    ];

    const formations = (rawFormations || [])
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
                    langue: sanitizeText(l.langue || l.name || ''),
                    niveau: sanitizeText(l.niveau || l.level || '')
                }));
        } else if (typeof rawLangues === 'object') {
            // Object format: { 'Français': 'Natif' }
            langues = Object.entries(rawLangues).map(([langue, niveau]) => ({
                langue: sanitizeText(langue),
                niveau: sanitizeText(niveau)
            }));
        }
    }

    const niveauRank = (niveau: string) => {
        const n = normalizeLoose(niveau).replace(/\s+/g, " ");
        if (n.includes("natif") || n.includes("native") || n.includes("matern")) return 7;
        const m = n.match(/\b([abc])\s*([12])\b/i);
        if (!m) return 0;
        const letter = m[1].toUpperCase();
        const num = Number(m[2]);
        if (letter === "C") return num === 2 ? 6 : 5;
        if (letter === "B") return num === 2 ? 4 : 3;
        if (letter === "A") return num === 2 ? 2 : 1;
        return 0;
    };

    const baseLangue = (langue: string) => {
        const raw = langue.split("(")[0]?.trim() || langue.trim();
        const key = normalizeLoose(raw).replace(/\s+/g, " ");
        if (key === "english" || key === "anglais") return "anglais";
        if (key === "french" || key === "francais" || key === "français") return "français";
        return key;
    };

    const consolidateLangues = (items: Array<{ langue: string; niveau: string }>) => {
        const bestByLang = new Map<string, { langue: string; niveau: string; rank: number }>();
        for (const item of items) {
            const langue = sanitizeText(item.langue);
            const niveau = sanitizeText(item.niveau);
            if (!langue) continue;
            const key = baseLangue(langue);
            const rank = niveauRank(niveau);
            const existing = bestByLang.get(key);
            if (!existing || rank > existing.rank || (rank === existing.rank && niveau.length > existing.niveau.length)) {
                bestByLang.set(key, { langue: langue.split("(")[0]?.trim() || langue, niveau, rank });
            }
        }
        const list = Array.from(bestByLang.values());
        const priority = (k: string) => (k === "français" ? 3 : k === "anglais" ? 2 : 1);
        return list
            .sort((a, b) => priority(baseLangue(b.langue)) - priority(baseLangue(a.langue)) || b.rank - a.rank || a.langue.localeCompare(b.langue))
            .map(({ langue, niveau }) => ({ langue, niveau }));
    };

    langues = consolidateLangues(langues);

    // Apply content limits for 1-page guarantee
    const limitedExperiences = filteredExperiences
        .slice(0, CV_LIMITS.maxExperiences)
        .map((exp, i) => {
            const beforeSlice = exp.realisations.length;
            const afterSlice = exp.realisations
                .slice(0, CV_LIMITS.maxRealisationsPerExp)
                .map((r: string) => truncateRealisation(r));
            // Phase 2 Diagnostic: Log après limite
            logger.debug(`[normalizeRAGToCV] Exp ${i}: ${beforeSlice} -> ${afterSlice.length} realisations after slice(0, ${CV_LIMITS.maxRealisationsPerExp})`);
            return {
                ...exp,
                realisations: afterSlice
            };
        });

    const limitedTechniques = techniques.slice(0, CV_LIMITS.maxSkills);
    const limitedSoftSkills = softSkills.slice(0, CV_LIMITS.maxSoftSkills);
    // Phase 5 Diagnostic: Log après normalisation
    logger.debug(`[normalizeRAGToCV] Limited techniques: ${limitedTechniques.length} (from ${techniques.length} total)`);
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
            const clientName = typeof c === 'string' ? c : (c.nom || (c as any).name || '');
            if (clientName && !foundClients.includes(clientName)) {
                foundClients.push(clientName);
                const secteur = (typeof c === 'object' ? (c.secteur || (c as any).sector) : undefined) || 'Autre';
                if (!clientsBySector[secteur]) clientsBySector[secteur] = [];
                clientsBySector[secteur].push(clientName);
            }
        });
    }

    // Extract from experiences.clients_references (new format)
    experiences.forEach(exp => {
        const rawExp = (data.experiences || []).find(e =>
            (e.entreprise === exp.entreprise || normalizeForMatch(e.entreprise) === normalizeForMatch(exp.entreprise)) &&
            (e.poste === exp.poste || normalizeForMatch(e.poste) === normalizeForMatch(exp.poste))
        );
        if (rawExp?.clients_references) {
            rawExp.clients_references.forEach((c: string | any) => {
                const clientName = typeof c === 'string' ? c : (c.nom || c.name || '');
                if (clientName && !foundClients.includes(clientName)) {
                    foundClients.push(clientName);
                    const secteur = (typeof c === 'object' ? (c.secteur || c.sector) : undefined) || 'Autre';
                    if (!clientsBySector[secteur]) clientsBySector[secteur] = [];
                    clientsBySector[secteur].push(clientName);
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
