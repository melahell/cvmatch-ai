/**
 * AI Adapter (Bridge) - Convertit AI_WIDGETS_SCHEMA en RendererResumeSchema
 *
 * [AUDIT FIX IMPORTANT-6] : Enrichissement des expériences avec dates/lieux depuis RAG
 * [AUDIT FIX CRITIQUE-3] : Propagation des infos de contact et photo depuis RAG
 */

import { aiWidgetsEnvelopeSchema, AIWidgetsEnvelope, AIWidget, type AIWidgetSection } from "./ai-widgets";
import type { RendererResumeSchema } from "./renderer-schema";

export interface ConvertOptions {
    /**
     * Score minimum pour qu'un widget soit inclus.
     * Par défaut: 0 (tout inclure, pas de filtrage).
     * L'utilisateur peut ajuster via l'UI.
     */
    minScore?: number;
    /**
     * Active les filtres avancés (seuils par section).
     */
    advancedFilteringEnabled?: boolean;
    /**
     * Seuils par section (si advancedFilteringEnabled=true).
     * Chaque section peut avoir son seuil spécifique, sinon fallback sur minScore.
     */
    minScoreBySection?: Partial<Record<AIWidgetSection, number>>;
    /**
     * Nombre maximum d'expériences à inclure.
     * Par défaut: 999 (pas de limite).
     * L'utilisateur peut ajuster via l'UI.
     */
    maxExperiences?: number;
    /**
     * Nombre maximum de réalisations par expérience.
     * Par défaut: 999 (pas de limite).
     * L'utilisateur peut ajuster via l'UI.
     */
    maxBulletsPerExperience?: number;
    /**
     * Quotas par section (si besoin).
     */
    limitsBySection?: {
        maxSkills?: number;
        maxFormations?: number;
        maxLanguages?: number;
        maxProjects?: number;
        maxReferences?: number;
        maxCertifications?: number;
    };
    /**
     * Profil RAG source pour enrichir les données manquantes
     * (dates, lieux, contact, photo)
     */
    ragProfile?: any;
}

/**
 * Options par défaut : PAS DE FILTRAGE.
 * On génère tout, on trie par score, l'utilisateur décide via l'UI.
 */
const DEFAULT_OPTIONS: Required<Omit<ConvertOptions, 'ragProfile'>> & { ragProfile?: any } = {
    minScore: 0,           // Pas de filtrage par score
    advancedFilteringEnabled: false,
    minScoreBySection: {},
    maxExperiences: 999,   // Pas de limite d'expériences
    maxBulletsPerExperience: 999, // Pas de limite de bullets
    limitsBySection: {},
    ragProfile: undefined,
};

/**
 * @deprecated Plus utilisé - on génère tout maintenant
 * Gardé pour compatibilité avec le code existant
 */
export interface DynamicLimits {
    minExperiences: number;
    maxExperiences: number;
    minBulletsPerExperience: number;
    maxBulletsPerExperience: number;
    minScore: number;
    maxWidgets: number;
    promptHint: string;
}

/**
 * @deprecated Plus utilisé - on génère tout maintenant
 * Retourne des limites "sans limite" pour compatibilité
 */
export function calculateDynamicLimits(_ragProfile: any): DynamicLimits {
    // Plus de filtrage - on génère tout
    return {
        minExperiences: 1,
        maxExperiences: 999,
        minBulletsPerExperience: 1,
        maxBulletsPerExperience: 999,
        minScore: 0,
        maxWidgets: 999,
        promptHint: "",
    };
}

/**
 * [AUDIT FIX IMPORTANT-6] : Trouve l'expérience RAG correspondante
 */
function findRAGExperience(expId: string, ragProfile: any): any | null {
    if (!ragProfile?.experiences || !Array.isArray(ragProfile.experiences)) {
        return null;
    }

    // Format exp_0, exp_1, etc.
    const numericMatch = expId.match(/^exp_(\d+)$/);
    if (numericMatch) {
        const index = parseInt(numericMatch[1], 10);
        if (index >= 0 && index < ragProfile.experiences.length) {
            return ragProfile.experiences[index];
        }
    }

    // Recherche par ID personnalisé
    for (const exp of ragProfile.experiences) {
        if (exp.id === expId) {
            return exp;
        }
    }

    return null;
}

/**
 * [AUDIT FIX IMPORTANT-6] : Normalise et formate une date pour affichage
 */
function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return "";

    // Si déjà au format "YYYY-MM", retourner tel quel
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }

    // Si format ISO, extraire YYYY-MM
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})/);
    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2]}`;
    }

    // Si juste une année
    const yearMatch = dateStr.match(/^(\d{4})$/);
    if (yearMatch) {
        return `${yearMatch[1]}-01`;
    }

    return dateStr;
}

const normalizeKey = (value: unknown) =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^\p{L}\p{N}\s&'’.\-]/gu, "");

const normalizeClientName = (value: unknown): string => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const cleaned = raw
        .replace(/[\u00A0]/g, " ")
        .replace(/\s+/g, " ")
        .replace(/^[-–—•·\s]+|[-–—•·\s]+$/g, "")
        .replace(/\s*\((confidentiel|n\/a|na|nc)\)\s*/gi, "")
        .trim();
    if (!cleaned) return "";

    const upper = cleaned.toUpperCase();
    const isAcronym =
        cleaned.length <= 10 &&
        /[A-Z]/.test(cleaned) &&
        cleaned === upper &&
        !/[a-z]/.test(cleaned);
    if (isAcronym) return cleaned;

    const words = cleaned.split(" ");
    const cased = words
        .map((w) => {
            if (!w) return w;
            if (/^[A-Z0-9&'’.\-]{2,}$/.test(w) && !/[a-z]/.test(w)) return w;
            const head = w[0]?.toUpperCase() ?? "";
            return head + w.slice(1).toLowerCase();
        })
        .join(" ");
    return cased;
};

const isBadClientName = (name: string): boolean => {
    const key = normalizeKey(name);
    if (!key) return true;
    if (key.length < 2) return true;
    if (key === "client" || key === "clients" || key === "references") return true;
    if (key.includes("confidentiel") || key.includes("nda") || key.includes("n a")) return true;
    if (key.startsWith("entreprise ") || key.startsWith("societe ") || key.startsWith("company ")) return true;
    if (/^client\s*\d+$/.test(key)) return true;
    if (/[<>]/.test(name)) return true;
    const digits = (name.match(/\d/g) || []).length;
    if (digits >= 5) return true;
    return false;
};

const cleanClientList = (items: unknown[], options?: { exclude?: string[]; max?: number }) => {
    const excludeKeys = new Set((options?.exclude || []).map(normalizeKey).filter(Boolean));
    const counts = new Map<string, { label: string; count: number }>();
    for (const item of items) {
        const label = normalizeClientName(typeof item === "string" ? item : (item as any)?.nom ?? (item as any)?.name);
        if (!label) continue;
        if (isBadClientName(label)) continue;
        const key = normalizeKey(label);
        if (!key) continue;
        if (excludeKeys.has(key)) continue;
        const prev = counts.get(key);
        if (!prev) counts.set(key, { label, count: 1 });
        else counts.set(key, { label: prev.label.length >= label.length ? prev.label : label, count: prev.count + 1 });
    }
    const sorted = Array.from(counts.values())
        .sort((a, b) => (b.count - a.count) || a.label.localeCompare(b.label, "fr"))
        .map((x) => x.label);
    const max = options?.max ?? 30;
    return sorted.slice(0, max);
};

/**
 * Fonction principale : convertit un payload AI_WIDGETS_SCHEMA
 * en schéma de CV consommable par le renderer (`RendererResumeSchema` / `CVData`).
 *
 * Cette fonction est 100% déterministe :
 * - même entrée → même CV,
 * - filtres et tris explicites (pas d'aléatoire).
 *
 * [AUDIT FIX IMPORTANT-6] : Enrichit les expériences avec les données du RAG source
 */
export function convertAndSort(input: unknown, options?: ConvertOptions): RendererResumeSchema {
    const parsed = aiWidgetsEnvelopeSchema.parse(input) as AIWidgetsEnvelope;

    // DEBUG: Log entrée
    console.log("[convertAndSort] INPUT:", {
        nbWidgetsTotal: parsed.widgets.length,
        options: options,
        sections: [...new Set(parsed.widgets.map(w => w.section))],
        types: [...new Set(parsed.widgets.map(w => w.type))],
    });

    // Fusionner options avec défauts (pas de filtrage par défaut)
    const opts = { ...DEFAULT_OPTIONS, ...(options || {}) };

    const getMinScoreForWidget = (w: AIWidget) => {
        if (!opts.advancedFilteringEnabled) return opts.minScore;
        const bySection = opts.minScoreBySection || {};
        const perSection = typeof bySection[w.section] === "number" ? (bySection[w.section] as number) : undefined;
        return perSection ?? opts.minScore;
    };

    // 1) Filtrer + trier les widgets par score de pertinence (global ou par section)
    const sortedWidgets = [...parsed.widgets]
        .filter((w) => w.relevance_score >= getMinScoreForWidget(w))
        .sort((a, b) => b.relevance_score - a.relevance_score);

    console.log("[convertAndSort] Après filtre minScore:", {
        minScore: opts.minScore,
        advancedFilteringEnabled: opts.advancedFilteringEnabled,
        nbWidgetsAvant: parsed.widgets.length,
        nbWidgetsApres: sortedWidgets.length,
    });

    // 2) Partition par section
    const headerWidgets = sortedWidgets.filter((w) => w.section === "header" || w.section === "summary");
    const experienceWidgets = sortedWidgets.filter((w) => w.section === "experiences");

    console.log("[convertAndSort] Partition:", {
        headerWidgets: headerWidgets.length,
        experienceWidgets: experienceWidgets.length,
    });
    const skillsWidgets = sortedWidgets
        .filter((w) => w.section === "skills")
        .slice(0, opts.limitsBySection?.maxSkills ?? 999);
    const educationWidgets = sortedWidgets
        .filter((w) => w.section === "education")
        .slice(0, opts.limitsBySection?.maxFormations ?? 999);
    const certificationWidgets = sortedWidgets
        .filter((w) => w.section === "certifications")
        .slice(0, opts.limitsBySection?.maxCertifications ?? 999);
    const languageWidgets = sortedWidgets
        .filter((w) => w.section === "languages")
        .slice(0, opts.limitsBySection?.maxLanguages ?? 999);
    const projectWidgets = sortedWidgets
        .filter((w) => w.section === "projects")
        .slice(0, opts.limitsBySection?.maxProjects ?? 999);
    const referenceWidgets = sortedWidgets
        .filter((w) => w.section === "references")
        .slice(0, opts.limitsBySection?.maxReferences ?? 999);

    // 3) Construire le header / profil
    // [AUDIT FIX CRITIQUE-3] : Passer le ragProfile pour enrichir le profil
    const profil = buildProfil(parsed, headerWidgets, opts.ragProfile);

    // 4) Construire les expériences
    // [AUDIT FIX IMPORTANT-6] : Passer le ragProfile pour enrichir les dates/lieux
    const experiences = buildExperiences(experienceWidgets, opts, opts.ragProfile);

    // 5) Construire les compétences
    const competences = buildCompetences(skillsWidgets, opts.ragProfile);

    // 6) Formations - [AUDIT FIX] : Enrichir depuis RAG si disponible
    const formations = buildFormations(educationWidgets, opts.ragProfile);

    // 7) Langues - [AUDIT FIX] : Enrichir depuis RAG si disponible
    const langues = buildLangues(languageWidgets, opts.ragProfile);

    // 8) Certifications et références projet / clients
    const { certifications, clients_references } = buildCertificationsAndReferences(
        certificationWidgets,
        referenceWidgets,
        opts.ragProfile
    );

    const cv: RendererResumeSchema = {
        profil,
        experiences,
        competences,
        formations,
        langues,
        certifications,
        clients_references,
    };

    return cv;
}

/**
 * [AUDIT FIX CRITIQUE-3] : Construit le profil en enrichissant depuis le RAG
 */
function buildProfil(
    payload: AIWidgetsEnvelope,
    headerWidgets: AIWidget[],
    ragProfile?: any
): RendererResumeSchema["profil"] {
    const base = payload.profil_summary || {};
    const job = payload.job_context || {};
    const ragProfil = ragProfile?.profil || {};
    const ragContact = ragProfil?.contact || {};

    // Chercher un éventuel bloc de résumé prioritaire
    const summaryWidget = headerWidgets.find((w) => w.type === "summary_block");
    const elevator_pitch = summaryWidget?.text || base.elevator_pitch || ragProfil.elevator_pitch;

    return {
        prenom: base.prenom || ragProfil.prenom || "",
        nom: base.nom || ragProfil.nom || "",
        titre_principal: base.titre_principal || ragProfil.titre_principal || (job.job_title || "").trim() || "Profil",
        // [AUDIT FIX CRITIQUE-3] : Enrichir les contacts depuis RAG
        email: ragContact.email || ragProfil.email || undefined,
        telephone: ragContact.telephone || ragProfil.telephone || undefined,
        localisation: base.localisation || ragProfil.localisation || undefined,
        linkedin: ragContact.linkedin || ragProfil.linkedin || undefined,
        github: ragContact.github || ragProfil.github || undefined,
        portfolio: ragContact.portfolio || ragProfil.portfolio || undefined,
        elevator_pitch: elevator_pitch,
        // [AUDIT FIX CRITIQUE-3] : Propager photo depuis RAG
        photo_url: ragProfil.photo_url || undefined,
    };
}

/**
 * [RÉÉCRITURE COMPLÈTE] Construit les expériences depuis les widgets
 *
 * LOGIQUE SIMPLIFIÉE:
 * 1. On prend TOUS les widgets section="experiences"
 * 2. Chaque widget avec un rag_experience_id UNIQUE devient une expérience
 * 3. Les widgets sans rag_experience_id deviennent chacun une expérience
 * 4. On enrichit depuis le RAG pour les métadonnées (dates, entreprise, etc.)
 * 5. AUCUN FILTRAGE - tout est retourné, l'UI filtre via sliders
 */
function buildExperiences(
    experienceWidgets: AIWidget[],
    opts: typeof DEFAULT_OPTIONS,
    ragProfile?: any
): RendererResumeSchema["experiences"] {
    console.log("[buildExperiences] RÉÉCRITURE - INPUT:", {
        nbWidgets: experienceWidgets.length,
        widgets: experienceWidgets.map(w => ({
            id: w.id,
            type: w.type,
            score: w.relevance_score,
            ragExpId: w.sources?.rag_experience_id,
            textPreview: w.text?.substring(0, 60),
        })),
    });

    // Si aucun widget, retourner tableau vide
    if (experienceWidgets.length === 0) {
        console.log("[buildExperiences] AUCUN WIDGET - retourne []");
        return [];
    }

    // ÉTAPE 1: Grouper les widgets par rag_experience_id
    // Les widgets sans rag_experience_id sont groupés individuellement
    // Normalisation: exp_0, exp_1, etc. sont les IDs canoniques
    const grouped = new Map<string, AIWidget[]>();
    let orphanCounter = 0;

    // Construire une map de normalisation des IDs d'expérience
    // Gemini peut utiliser exp_0, exp_scalepay, ou d'autres formats
    const normalizeExpId = (rawId: string | undefined): string => {
        if (!rawId) return `orphan_${orphanCounter++}`;
        // Déjà au format canonique exp_N
        if (/^exp_\d+$/.test(rawId)) return rawId;
        // Format numérique brut "0", "1", etc.
        if (/^\d+$/.test(rawId)) return `exp_${rawId}`;
        // Autre format custom (exp_scalepay, etc.) - chercher dans le RAG par correspondance
        if (ragProfile?.experiences && Array.isArray(ragProfile.experiences)) {
            for (let i = 0; i < ragProfile.experiences.length; i++) {
                const ragExp = ragProfile.experiences[i];
                const ragId = ragExp.id || `exp_${i}`;
                if (ragId === rawId) return rawId; // ID valide trouvé dans RAG
                // Correspondance par nom d'entreprise dans l'ID custom
                const entreprise = (ragExp.entreprise || ragExp.client || "").toLowerCase().replace(/\s+/g, "_");
                if (entreprise && rawId.toLowerCase().includes(entreprise)) {
                    return ragId; // Normaliser vers l'ID canonique
                }
            }
        }
        return rawId; // Retourner tel quel si pas de normalisation possible
    };

    for (const widget of experienceWidgets) {
        const expId = normalizeExpId(widget.sources?.rag_experience_id);
        const existing = grouped.get(expId) || [];
        existing.push(widget);
        grouped.set(expId, existing);
    }

    console.log("[buildExperiences] Groupes créés:", {
        nbGroupes: grouped.size,
        groupeIds: Array.from(grouped.keys()),
    });

    // ÉTAPE 2: Construire une expérience par groupe
    const experiences: RendererResumeSchema["experiences"] = [];

    for (const [expId, widgets] of grouped.entries()) {
        // Calculer le meilleur score du groupe
        const bestScore = Math.max(...widgets.map(w => w.relevance_score));

        // Collecter tous les textes (headers et bullets)
        const allTexts: string[] = [];
        let headerText: string | undefined;

        for (const widget of widgets) {
            const text = widget.text?.trim();
            if (!text) continue;

            // Le premier widget de type header ou le texte le plus long = header
            if (widget.type === "experience_header" && !headerText) {
                headerText = text;
            } else {
                allTexts.push(text);
            }
        }

        // Si pas de header explicite, utiliser le premier texte comme header
        if (!headerText && allTexts.length > 0) {
            headerText = allTexts.shift();
        }

        // Essayer de trouver l'expérience RAG correspondante
        const ragExp = findRAGExperience(expId, ragProfile);

        // Déterminer poste et entreprise
        let poste = "";
        let entreprise = "";

        if (headerText) {
            // Essayer de parser "Poste - Entreprise" depuis le header
            const separatorIndex = headerText.indexOf(" - ");
            if (separatorIndex !== -1) {
                poste = headerText.slice(0, separatorIndex).trim();
                entreprise = headerText.slice(separatorIndex + 3).trim();
            } else {
                poste = headerText;
            }
        }

        // Enrichir depuis RAG si disponible
        if (ragExp) {
            if (!poste) poste = ragExp.poste || ragExp.titre || "";
            if (!entreprise) entreprise = ragExp.entreprise || ragExp.client || "";
        }

        // Fallback si toujours vide
        if (!poste) poste = "Expérience";
        if (!entreprise) entreprise = "—";

        // Réalisations = tous les textes restants
        const realisations = allTexts.slice(0, opts.maxBulletsPerExperience);

        // Métadonnées depuis RAG
        const date_debut = ragExp ? formatDate(ragExp.debut || ragExp.date_debut || ragExp.start_date) : "";
        const date_fin = ragExp ? formatDate(ragExp.fin || ragExp.date_fin || ragExp.end_date) : undefined;
        const lieu = ragExp?.lieu || ragExp?.location || undefined;
        const actuel = ragExp?.actuel || ragExp?.current || false;
        const clientsRaw =
            (Array.isArray(ragExp?.clients_references) && ragExp.clients_references) ||
            (Array.isArray(ragExp?.clients) && ragExp.clients) ||
            (Array.isArray(ragExp?.clientsReferences) && ragExp.clientsReferences) ||
            [];
        const clients = cleanClientList(clientsRaw, { exclude: [entreprise], max: 6 });

        const experience = {
            poste,
            entreprise,
            date_debut,
            date_fin: actuel ? undefined : date_fin,
            actuel,
            lieu,
            realisations,
            clients: clients.length > 0 ? clients : undefined,
            // Métadonnées pour l'UI
            _relevance_score: bestScore,
            _rag_experience_id: expId,
        } as any;

        experiences.push(experience);
    }

    // ÉTAPE 3: FALLBACK - Vérifier si des expériences RAG n'ont pas été couvertes par Gemini
    // C'est le filet de sécurité: si Gemini omet une expérience, on la crée depuis le RAG
    //
    // IMPORTANT: On ne peut PAS comparer par ID car:
    // - Gemini utilise des IDs séquentiels (exp_0, exp_1...) assignés par buildRAGForCVPrompt
    // - Le ragProfile ici vient de useRAGData() avec des IDs hash (exp_a7f3b2)
    // → On compare par poste+entreprise normalisés (robuste et indépendant des IDs)
    if (ragProfile?.experiences && Array.isArray(ragProfile.experiences)) {
        // Construire un Set des expériences déjà couvertes (poste|entreprise normalisés)
        const coveredKeys = new Set(
            experiences.map(e => `${normalizeKey(e.poste)}|${normalizeKey(e.entreprise)}`)
        );

        console.log("[buildExperiences] FALLBACK check:", {
            coveredKeys: Array.from(coveredKeys),
            ragExperiences: ragProfile.experiences.map((e: any) => `${normalizeKey(e.poste || e.titre || "")}|${normalizeKey(e.entreprise || e.client || "")}`),
        });

        for (let i = 0; i < ragProfile.experiences.length; i++) {
            const ragExp = ragProfile.experiences[i];
            const ragPoste = normalizeKey(ragExp.poste || ragExp.titre || "");
            const ragEntreprise = normalizeKey(ragExp.entreprise || ragExp.client || "");
            const ragKey = `${ragPoste}|${ragEntreprise}`;

            if (!coveredKeys.has(ragKey) && (ragPoste || ragEntreprise)) {
                console.log(`[buildExperiences] FALLBACK: exp RAG "${ragPoste} @ ${ragEntreprise}" non couverte par Gemini, création depuis RAG`);

                const poste = ragExp.poste || ragExp.titre || "Expérience";
                const entreprise = ragExp.entreprise || ragExp.client || "—";
                const realisations: string[] = [];

                if (Array.isArray(ragExp.realisations)) {
                    for (const r of ragExp.realisations) {
                        if (typeof r === "string" && r.trim()) {
                            realisations.push(r.trim());
                        } else if (r && typeof r === "object" && r.description) {
                            realisations.push(r.description);
                        }
                    }
                }

                const date_debut = formatDate(ragExp.debut || ragExp.date_debut || ragExp.start_date || "");
                const date_fin = formatDate(ragExp.fin || ragExp.date_fin || ragExp.end_date || "");
                const lieu = ragExp.lieu || ragExp.location || undefined;
                const actuel = ragExp.actuel || ragExp.current || false;
                const clientsRaw =
                    (Array.isArray(ragExp?.clients_references) && ragExp.clients_references) ||
                    (Array.isArray(ragExp?.clients) && ragExp.clients) ||
                    (Array.isArray(ragExp?.clientsReferences) && ragExp.clientsReferences) ||
                    [];
                const clients = cleanClientList(clientsRaw, { exclude: [entreprise], max: 6 });

                experiences.push({
                    poste,
                    entreprise,
                    date_debut,
                    date_fin: actuel ? undefined : date_fin,
                    actuel,
                    lieu,
                    realisations: realisations.slice(0, opts.maxBulletsPerExperience),
                    clients: clients.length > 0 ? clients : undefined,
                    _relevance_score: 10, // Score bas car non traité par Gemini
                    _rag_experience_id: ragExp.id || `exp_${i}`,
                    _from_fallback: true, // Marqueur pour debug
                } as any);

                coveredKeys.add(ragKey); // Éviter les doublons
            }
        }
    }

    // Trier par score décroissant (cast pour accéder aux métadonnées)
    (experiences as any[]).sort((a, b) => (b._relevance_score || 0) - (a._relevance_score || 0));

    // Appliquer la limite max (mais par défaut = 999, donc pas de limite)
    const limited = experiences.slice(0, opts.maxExperiences);

    console.log("[buildExperiences] OUTPUT:", {
        nbExperiences: limited.length,
        fromGemini: limited.filter((e: any) => !e._from_fallback).length,
        fromFallback: limited.filter((e: any) => e._from_fallback).length,
        experiences: limited.map(e => ({
            poste: e.poste,
            entreprise: e.entreprise,
            nbRealisations: e.realisations?.length || 0,
            score: (e as any)._relevance_score,
            fallback: (e as any)._from_fallback || false,
        })),
    });

    return limited;
}

function buildCompetences(skillsWidgets: AIWidget[], ragProfile?: any): RendererResumeSchema["competences"] {
    const techniquesSet = new Set<string>();
    const softSkillsSet = new Set<string>();

    skillsWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;

        const lower = text.toLowerCase();
        const isSoft =
            lower.includes("communication") ||
            lower.includes("management") ||
            lower.includes("leadership") ||
            lower.includes("soft") ||
            lower.includes("relationnel") ||
            lower.includes("team") ||
            lower.includes("collaboration");

        if (isSoft) {
            softSkillsSet.add(text);
        } else {
            techniquesSet.add(text);
        }
    });

    const contexte = ragProfile?.contexte_enrichi;
    const tacites = Array.isArray(contexte?.competences_tacites) ? contexte.competences_tacites : [];
    for (const item of tacites) {
        const name = typeof item === "string" ? item : item?.nom || item?.name;
        if (name && String(name).trim()) techniquesSet.add(String(name).trim());
    }

    const softDeduites = Array.isArray(contexte?.soft_skills_deduites) ? contexte.soft_skills_deduites : [];
    for (const item of softDeduites) {
        const name = typeof item === "string" ? item : item?.nom || item?.name;
        if (name && String(name).trim()) softSkillsSet.add(String(name).trim());
    }

    return {
        techniques: Array.from(techniquesSet),
        soft_skills: Array.from(softSkillsSet),
    };
}

/**
 * [AUDIT FIX] : Enrichit les formations depuis le RAG si widgets insuffisants
 */
function buildFormations(
    educationWidgets: AIWidget[],
    ragProfile?: any
): RendererResumeSchema["formations"] {
    const formations: RendererResumeSchema["formations"] = [];

    // D'abord, construire depuis les widgets
    educationWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;

        // Heuristique minimale : "Diplôme - Établissement (Année)"
        let diplome = text;
        let etablissement = "";
        let annee: string | undefined;

        const yearMatch = text.match(/(19|20)\d{2}/);
        if (yearMatch) {
            annee = yearMatch[0];
        }

        const parts = text.split(" - ");
        if (parts.length >= 2) {
            diplome = parts[0].trim();
            etablissement = parts[1].trim();
        }

        formations.push({
            diplome: diplome || "Formation",
            etablissement: etablissement || "",
            annee,
        });
    });

    // [AUDIT FIX] : Si aucune formation depuis widgets, utiliser le RAG
    if (formations.length === 0 && ragProfile?.formations) {
        const ragFormations = Array.isArray(ragProfile.formations) ? ragProfile.formations : [];
        ragFormations.forEach((f: any) => {
            formations.push({
                diplome: f.titre || f.diplome || "Formation",
                etablissement: f.organisme || f.ecole || f.etablissement || "",
                annee: f.annee,
            });
        });
    }

    return formations;
}

/**
 * [AUDIT FIX] : Enrichit les langues depuis le RAG si widgets insuffisants
 */
function buildLangues(
    languageWidgets: AIWidget[],
    ragProfile?: any
): RendererResumeSchema["langues"] {
    const langues: NonNullable<RendererResumeSchema["langues"]> = [];

    // D'abord, construire depuis les widgets
    languageWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;

        // Exemples attendus : "Français - Natif", "Anglais (Courant)"
        let langue = text;
        let niveau = "Professionnel";

        const separators = [" - ", ":", "("];
        for (const sep of separators) {
            const idx = text.indexOf(sep);
            if (idx !== -1) {
                langue = text.slice(0, idx).replace(/[()]/g, "").trim();
                niveau = text.slice(idx + sep.length).replace(/[()]/g, "").trim() || niveau;
                break;
            }
        }

        langues.push({ langue, niveau });
    });

    // [AUDIT FIX] : Si aucune langue depuis widgets, utiliser le RAG
    if (langues.length === 0 && ragProfile?.langues) {
        if (Array.isArray(ragProfile.langues)) {
            ragProfile.langues.forEach((l: any) => {
                langues.push({
                    langue: l.langue || l.name || "",
                    niveau: l.niveau || l.level || "Professionnel",
                });
            });
        } else if (typeof ragProfile.langues === "object") {
            Object.entries(ragProfile.langues).forEach(([langue, niveau]) => {
                langues.push({
                    langue,
                    niveau: String(niveau),
                });
            });
        }
    }

    return langues.length > 0 ? langues : undefined;
}

/**
 * [AUDIT FIX] : Enrichit les certifications et clients depuis le RAG
 */
function buildCertificationsAndReferences(
    certificationWidgets: AIWidget[],
    referenceWidgets: AIWidget[],
    ragProfile?: any
) {
    const certifications: string[] = [];
    const clientsRaw: unknown[] = [];

    certificationWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;
        certifications.push(text);
    });

    referenceWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;
        clientsRaw.push(text);
    });

    // [AUDIT FIX] : Enrichir depuis RAG si vide
    if (certifications.length === 0 && ragProfile?.certifications) {
        const ragCerts = Array.isArray(ragProfile.certifications) ? ragProfile.certifications : [];
        ragCerts.forEach((c: any) => {
            const certName = typeof c === "string" ? c : c.nom;
            if (certName) certifications.push(certName);
        });
    }

    // [AUDIT FIX] : Enrichir clients depuis RAG
    const ragClientsFromReferences = Array.isArray(ragProfile?.references?.clients) ? ragProfile.references.clients : [];
    ragClientsFromReferences.forEach((c: any) => {
        const clientName = typeof c === "string" ? c : c.nom;
        if (clientName) clientsRaw.push(clientName);
    });

    const ragClientsFromExperiences = Array.isArray(ragProfile?.experiences) ? ragProfile.experiences : [];
    ragClientsFromExperiences.forEach((exp: any) => {
        const expClients =
            (Array.isArray(exp?.clients_references) && exp.clients_references) ||
            (Array.isArray(exp?.clients) && exp.clients) ||
            (Array.isArray(exp?.clientsReferences) && exp.clientsReferences) ||
            [];
        expClients.forEach((c: any) => {
            const clientName = typeof c === "string" ? c : c.nom;
            if (clientName) clientsRaw.push(clientName);
        });
    });
    const excludeCompanies = Array.isArray(ragProfile?.experiences)
        ? ragProfile.experiences.map((e: any) => e?.entreprise || e?.client).filter(Boolean)
        : [];
    const uniqueClients = cleanClientList(clientsRaw, { exclude: excludeCompanies, max: 25 });

    const clients_references =
        uniqueClients.length > 0
            ? {
                  clients: uniqueClients,
                  secteurs: undefined,
              }
            : undefined;

    return {
        certifications: certifications.length > 0 ? certifications : undefined,
        clients_references,
    };
}
