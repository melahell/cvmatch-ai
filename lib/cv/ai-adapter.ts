/**
 * AI Adapter (Bridge) - Convertit AI_WIDGETS_SCHEMA en RendererResumeSchema
 *
 * [AUDIT FIX IMPORTANT-6] : Enrichissement des expériences avec dates/lieux depuis RAG
 * [AUDIT FIX CRITIQUE-3] : Propagation des infos de contact et photo depuis RAG
 * [CDC Sprint 2.6] : Helpers extraits dans lib/cv/utils/client-normalizer.ts
 */

import { aiWidgetsEnvelopeSchema, AIWidgetsEnvelope, AIWidget, type AIWidgetSection } from "./ai-widgets";
import type { RendererResumeSchema } from "./renderer-schema";
import type { InducedDataOptions } from "@/types/rag-contexte-enrichi";
import { INDUCED_DATA_PRESETS } from "@/types/rag-contexte-enrichi";
import { coerceBoolean } from "@/lib/utils/coerce-boolean";
// [CDC Sprint 2.6] Les helpers client sont disponibles dans ./utils/client-normalizer
// mais restent définis localement ici pour éviter les imports circulaires

// [CDC Phase 4] Flag pour désactiver les logs de debug en production
const DEBUG_AI_ADAPTER = process.env.NODE_ENV === "development" && process.env.DEBUG_AI_ADAPTER === "true";
const debugLog = (...args: any[]) => {
    if (DEBUG_AI_ADAPTER) console.log(...args);
};

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
        maxSoftSkills?: number; // [Sprint 2] Limite dédiée soft skills
        maxFormations?: number;
        maxLanguages?: number;
        maxProjects?: number;
        maxReferences?: number;
        maxCertifications?: number;
        maxClientsPerExperience?: number;
        maxClientsReferences?: number;
    };
    /**
     * Profil RAG source pour enrichir les données manquantes
     * (dates, lieux, contact, photo)
     */
    ragProfile?: any;
    /**
     * [AUDIT-FIX P1-1] Options de filtrage des données induites (contexte enrichi).
     * Contrôle quelles données induites sont incluses dans le CV.
     * Par défaut: "all" (tout inclure, confidence >= 60)
     */
    inducedDataOptions?: InducedDataOptions;
}

/**
 * Options par défaut : PAS DE FILTRAGE.
 * On génère tout, on trie par score, l'utilisateur décide via l'UI.
 */
const DEFAULT_OPTIONS: Required<Omit<ConvertOptions, 'ragProfile' | 'inducedDataOptions'>> & { ragProfile?: any; inducedDataOptions: InducedDataOptions } = {
    minScore: 0,           // Pas de filtrage par score
    advancedFilteringEnabled: false,
    minScoreBySection: {},
    maxExperiences: 999,   // Pas de limite d'expériences
    maxBulletsPerExperience: 999, // Pas de limite de bullets
    limitsBySection: {
        maxClientsPerExperience: 30,   // [AUDIT-FIX P0-2] De 6 à 30 - ne pas tronquer côté adapter
        maxClientsReferences: 999,      // [AUDIT-FIX P0-2] De 25 à 999 - laisser l'algo adaptatif gérer
    },
    ragProfile: undefined,
    inducedDataOptions: INDUCED_DATA_PRESETS.all, // [AUDIT-FIX P1-1] Par défaut: tout inclure
};

// ============================================================================
// ENRICHISSEMENT DEPUIS RAG
// ============================================================================

/**
 * [AUDIT FIX IMPORTANT-6] : Trouve l'expérience RAG correspondante
 * 
 * [FIX 6.4.15] : Les IDs Gemini (exp_0, exp_1) ne matchent pas les IDs RAG 
 * (exp_11lt8gr, exp_75trwn) car Gemini génère des IDs séquentiels mais le RAG 
 * utilise des hashes. On ajoute un fallback par correspondance poste/entreprise.
 */
function findRAGExperience(expId: string, ragProfile: any, headerText?: string): any | null {
    if (!ragProfile?.experiences || !Array.isArray(ragProfile.experiences)) {
        return null;
    }

    // Format exp_0, exp_1, etc. → index dans le tableau RAG (ORDRE GEMINI)
    // ATTENTION: Ceci suppose que Gemini référence les expériences dans le même ordre que le RAG
    const numericMatch = expId.match(/^exp_(\d+)$/);
    if (numericMatch) {
        const index = parseInt(numericMatch[1], 10);
        if (index >= 0 && index < ragProfile.experiences.length) {
            return ragProfile.experiences[index];
        }
    }

    // Recherche par ID personnalisé (format hash)
    for (const exp of ragProfile.experiences) {
        if (exp.id === expId) {
            return exp;
        }
    }

    // [FIX 6.4.15] Fallback: correspondance par poste/entreprise depuis headerText
    // headerText est typiquement "Poste - Entreprise" ou juste "Poste"
    if (headerText) {
        const normalizeForMatch = (s: string) =>
            String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

        const headerNorm = normalizeForMatch(headerText);

        for (const exp of ragProfile.experiences) {
            const ragPoste = normalizeForMatch(exp.poste || exp.titre || "");
            const ragEntreprise = normalizeForMatch(exp.entreprise || exp.client || "");

            // Match si le header contient le poste ET l'entreprise
            if (ragPoste && ragEntreprise &&
                headerNorm.includes(ragPoste.substring(0, Math.min(20, ragPoste.length))) &&
                headerNorm.includes(ragEntreprise.substring(0, Math.min(15, ragEntreprise.length)))) {
                return exp;
            }

            // Match si le header contient juste le poste (pour les postes uniques)
            if (ragPoste && ragPoste.length > 10 &&
                headerNorm.includes(ragPoste.substring(0, Math.min(30, ragPoste.length)))) {
                return exp;
            }
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

    // [FIX DATA-LOSS] Splitter les strings concatenés type "Grands Comptes : X, Y, Z"
    const expandedItems: unknown[] = [];
    for (const item of items) {
        const raw = typeof item === "string" ? item : (item as any)?.nom ?? (item as any)?.name;
        if (typeof raw === "string" && (raw.includes(",") || raw.includes(":")) && raw.length > 30) {
            // Retirer le préfixe avant ":" (ex: "Grands Comptes : ")
            let cleanStr = raw;
            const colonIdx = raw.indexOf(":");
            if (colonIdx !== -1 && colonIdx < 25) {
                cleanStr = raw.slice(colonIdx + 1).trim();
            }
            // Splitter par virgule 
            const parts = cleanStr.split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
            if (parts.length > 1) {
                for (const part of parts) expandedItems.push(part);
                continue;
            }
        }
        expandedItems.push(item);
    }

    for (const item of expandedItems) {
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

// Helper pour formater "Client (Secteur)"
const formatClientWithSector = (item: any): string => {
    const name = normalizeClientName(typeof item === "string" ? item : (item as any)?.nom ?? (item as any)?.name);
    if (!name) return "";

    // Si l'objet source a un secteur, l'ajouter
    const sector = (item as any)?.secteur || (item as any)?.sector || (item as any)?.industry;
    if (sector && typeof sector === "string" && sector.length > 2) {
        // Nettoyer le secteur (pas de parenthèses superflues)
        const cleanSector = sector.replace(/[()]/g, "").trim();
        return `${name} (${cleanSector})`;
    }

    return name;
};

// Version enrichie de cleanClientList qui préserve les secteurs
const cleanClientListWithSectors = (items: unknown[], options?: { exclude?: string[]; max?: number }) => {
    const excludeKeys = new Set((options?.exclude || []).map(normalizeKey).filter(Boolean));
    const counts = new Map<string, { label: string; count: number }>();

    for (const item of items) {
        // [AUDIT-FIX 100%] Utiliser formatClientWithSector pour inclure le secteur
        const label = formatClientWithSector(item);
        if (!label) continue;

        // Extraire nom de base pour exclusion
        const baseName = label.split(" (")[0];
        if (isBadClientName(baseName)) continue;

        const key = normalizeKey(baseName);
        if (!key) continue;
        if (excludeKeys.has(key)) continue;

        const prev = counts.get(key);
        // Préférer le label le plus long (celui avec secteur)
        if (!prev) counts.set(key, { label, count: 1 });
        else counts.set(key, {
            label: label.length > prev.label.length ? label : prev.label,
            count: prev.count + 1
        });
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
    const clampScore = (value: any) => {
        const n = typeof value === "number" ? value : Number(value);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(100, n));
    };

    const sanitizedInput =
        input && typeof input === "object" && Array.isArray((input as any).widgets)
            ? {
                ...(input as any),
                widgets: (input as any).widgets.map((w: any) => ({
                    ...w,
                    relevance_score: clampScore(w?.relevance_score),
                })),
            }
            : input;

    const parsed = aiWidgetsEnvelopeSchema.parse(sanitizedInput) as AIWidgetsEnvelope;

    // DEBUG: Log entrée
    debugLog("[convertAndSort] INPUT:", {
        nbWidgetsTotal: parsed.widgets.length,
        options: options,
        sections: [...new Set(parsed.widgets.map(w => w.section))],
        types: [...new Set(parsed.widgets.map(w => w.type))],
    });

    const opts = {
        ...DEFAULT_OPTIONS,
        ...(options || {}),
        minScoreBySection: { ...(DEFAULT_OPTIONS.minScoreBySection || {}), ...(options?.minScoreBySection || {}) },
        limitsBySection: { ...(DEFAULT_OPTIONS.limitsBySection || {}), ...(options?.limitsBySection || {}) },
    };

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

    debugLog("[convertAndSort] Après filtre minScore:", {
        minScore: opts.minScore,
        advancedFilteringEnabled: opts.advancedFilteringEnabled,
        nbWidgetsAvant: parsed.widgets.length,
        nbWidgetsApres: sortedWidgets.length,
    });

    // 2) Partition par section
    const headerWidgets = sortedWidgets.filter((w) => w.section === "header" || w.section === "summary");
    const experienceWidgets = sortedWidgets.filter((w) => w.section === "experiences");

    debugLog("[convertAndSort] Partition:", {
        headerWidgets: headerWidgets.length,
        experienceWidgets: experienceWidgets.length,
    });
    const skillsWidgets = sortedWidgets
        .filter((w) => w.section === "skills");
    // [Sprint 2] Ne pas slicer les widgets ici, on slice le résultat final (tech vs soft)
    // .slice(0, opts.limitsBySection?.maxSkills ?? 999);
    const educationWidgets = sortedWidgets
        .filter((w) => w.section === "education")
        .slice(0, opts.limitsBySection?.maxFormations ?? 999);
    const certificationWidgets = sortedWidgets
        .filter((w) => w.section === "certifications")
        .slice(0, opts.limitsBySection?.maxCertifications ?? 999);
    const languageWidgets = sortedWidgets
        .filter((w) => w.section === "languages")
        .slice(0, opts.limitsBySection?.maxLanguages ?? 999);
    // [CDC Sprint 3.2] Inclure aussi les widgets de type "project_item"
    const projectWidgets = sortedWidgets
        .filter((w) => w.section === "projects" || w.type === "project_item")
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

    // [AUDIT-FIX P0-4] Validation dates : aucune expérience ne doit avoir date_debut vide
    // Si le re-matching widget/RAG a échoué, forcer un 2ème passage depuis le RAG
    // [FIX] Utiliser matching fuzzy (includes) au lieu d'exact match
    if (opts.ragProfile?.experiences && Array.isArray(opts.ragProfile.experiences)) {
        for (const exp of experiences) {
            if (!exp.date_debut || exp.date_debut.trim() === "") {
                const expPoste = normalizeKey(exp.poste);
                const expEntreprise = normalizeKey(exp.entreprise);

                let bestMatch: any = null;

                for (const ragExp of opts.ragProfile.experiences) {
                    const ragPoste = normalizeKey(ragExp.poste || ragExp.titre || "");
                    const ragEntreprise = normalizeKey(ragExp.entreprise || ragExp.client || "");

                    // Exact match poste+entreprise
                    if (expPoste === ragPoste && expEntreprise === ragEntreprise) {
                        bestMatch = ragExp;
                        break;
                    }
                    // Fuzzy: poste contains or is contained
                    if (ragPoste && expPoste && (expPoste.includes(ragPoste) || ragPoste.includes(expPoste))) {
                        // Bonus if entreprise also matches partially
                        if (ragEntreprise && expEntreprise && (expEntreprise.includes(ragEntreprise) || ragEntreprise.includes(expEntreprise))) {
                            bestMatch = ragExp;
                            break;
                        }
                        // Accept poste-only match if poste is specific enough (>15 chars)
                        if (!bestMatch && ragPoste.length > 15) {
                            bestMatch = ragExp;
                        }
                    }
                }

                if (bestMatch) {
                    exp.date_debut = formatDate(bestMatch.debut || bestMatch.date_debut || bestMatch.start_date || "");
                    if (!exp.date_fin && !exp.actuel) {
                        const fin = formatDate(bestMatch.fin || bestMatch.date_fin || bestMatch.end_date || "");
                        if (fin) exp.date_fin = fin;
                    }
                    if ((coerceBoolean(bestMatch.actuel ?? bestMatch.current) ?? false) === true) {
                        (exp as any).actuel = true;
                        exp.date_fin = undefined;
                    }
                }

                // Si toujours vide après 2ème passage, logger un warning
                if (!exp.date_debut || exp.date_debut.trim() === "") {
                    console.warn(`[AUDIT-FIX P0-4] ⚠️ Date manquante pour "${exp.poste} @ ${exp.entreprise}" - aucun match RAG trouvé`);
                }
            }
        }
    }

    // [AUDIT-FIX P1-1/P1-3] Appliquer le filtre InducedDataOptions
    const inducedOpts = opts.inducedDataOptions || INDUCED_DATA_PRESETS.all;
    const contexteEnrichi = opts.ragProfile?.contexte_enrichi;

    // [AUDIT-FIX P1-3] Injecter les responsabilités implicites comme bullets dans les expériences
    if (inducedOpts.include_responsabilites && inducedOpts.mode !== "none" && contexteEnrichi?.responsabilites_implicites) {
        const responsabilites = (contexteEnrichi.responsabilites_implicites as any[])
            .filter((r: any) => (r.confidence ?? 0) >= inducedOpts.min_confidence);

        if (responsabilites.length > 0) {
            // Distribuer les responsabilités implicites dans les expériences pertinentes
            // en cherchant une correspondance entre la justification et le contenu de l'expérience
            for (const resp of responsabilites) {
                const justif = (resp.justification || "").toLowerCase();
                let injected = false;
                for (const exp of experiences) {
                    const expText = [exp.poste, exp.entreprise, ...(exp.realisations || [])].join(" ").toLowerCase();
                    // Si la justification mentionne le poste ou l'entreprise, injecter dans cette expérience
                    if (justif.includes(normalizeKey(exp.poste)) || justif.includes(normalizeKey(exp.entreprise)) ||
                        expText.includes(resp.description.toLowerCase().slice(0, 30))) {
                        exp.realisations = exp.realisations || [];
                        exp.realisations.push(`${resp.description} [induit, confiance: ${resp.confidence}%]`);
                        injected = true;
                        break;
                    }
                }
                // Si aucune expérience ne correspond, injecter dans la première (plus récente)
                if (!injected && experiences.length > 0) {
                    experiences[0].realisations = experiences[0].realisations || [];
                    experiences[0].realisations.push(`${resp.description} [induit, confiance: ${resp.confidence}%]`);
                }
            }
            debugLog("[convertAndSort] Responsabilités implicites injectées:", responsabilites.length);
        }
    }

    // 5) Construire les compétences (avec filtre induced)
    const competences = buildCompetences(skillsWidgets, opts.ragProfile, inducedOpts, opts);

    // 6) Formations - [AUDIT FIX] : Enrichir depuis RAG si disponible
    const formations = buildFormations(educationWidgets, opts.ragProfile);

    // 7) Langues - [AUDIT FIX] : Enrichir depuis RAG si disponible
    const langues = buildLangues(languageWidgets, opts.ragProfile);

    const { certifications, clients_references } = buildCertificationsAndReferences(
        certificationWidgets,
        referenceWidgets,
        opts.ragProfile,
        opts
    );

    // [CDC-21] Construire les projets pour éviter la perte de données
    const projects = buildProjects(projectWidgets, opts.ragProfile);

    const cv: RendererResumeSchema = {
        profil,
        experiences,
        competences,
        formations,
        langues,
        certifications,
        clients_references,
        projects,
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
    debugLog("[buildExperiences] RÉÉCRITURE - INPUT:", {
        nbWidgets: experienceWidgets.length,
        widgets: experienceWidgets.map(w => ({
            id: w.id,
            type: w.type,
            score: w.relevance_score,
            ragExpId: w.sources.rag_experience_id,
            textPreview: w.text?.substring(0, 60),
        })),
    });

    // Si aucun widget, retourner tableau vide
    if (experienceWidgets.length === 0) {
        debugLog("[buildExperiences] AUCUN WIDGET - retourne []");
        return [];
    }

    // ÉTAPE 1: Grouper les widgets par rag_experience_id
    // ÉTAPE 1: Grouper les widgets par rag_experience_id
    // Les widgets sans rag_experience_id sont groupés individuellement
    // Normalisation: exp_0, exp_1, etc. sont les IDs canoniques
    const grouped = new Map<string, AIWidget[]>();
    const usedRagIds = new Set<string>(); // [FIX] Track used RAG IDs to prevent duplicates
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
        const expId = normalizeExpId(widget.sources.rag_experience_id);
        const existing = grouped.get(expId) || [];
        existing.push(widget);
        grouped.set(expId, existing);
    }

    debugLog("[buildExperiences] Groupes créés:", {
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
        // [FIX 6.4.15] Passer headerText pour fallback par poste/entreprise
        // Essayer de trouver l'expérience RAG correspondante
        // [FIX 6.4.15] Passer headerText pour fallback par poste/entreprise
        const ragExp = findRAGExperience(expId, ragProfile, headerText);

        // [FIX] Mark as used immediately if found
        if (ragExp && ragExp.id) {
            usedRagIds.add(ragExp.id);
        }

        // Déterminer poste et entreprise
        let poste = "";
        let entreprise = "";

        if (headerText) {
            // Essayer de parser "Poste - Entreprise" ou "Poste @ Entreprise" depuis le header
            const dashIndex = headerText.indexOf(" - ");
            const atIndex = headerText.indexOf(" @ ");
            // Utiliser le premier séparateur trouvé
            const separatorIndex = dashIndex !== -1 ? dashIndex : atIndex;
            const separatorLen = dashIndex !== -1 ? 3 : 3; // " - " ou " @ " = 3 chars
            if (separatorIndex !== -1) {
                poste = headerText.slice(0, separatorIndex).trim();
                entreprise = headerText.slice(separatorIndex + separatorLen).trim();
            } else {
                poste = headerText;
            }
        }

        // [FIX] Détecter les types de contrat ou lieux mis comme nom d'entreprise
        const BAD_COMPANY_KEYWORDS = [
            "cdi", "cdd", "cdic", "freelance", "stage", "alternance", "interim",
            "consultant", "contractuel", "contract", "full-time", "part-time",
            "france", "paris", "remote", "télétravail", "teletravail", "ile-de-france", "idf"
        ];
        if (entreprise) {
            const cleanEntreprise = entreprise.replace(/[()]/g, "").trim().toLowerCase();
            if (
                BAD_COMPANY_KEYWORDS.includes(cleanEntreprise) ||
                /^\([^)]*\)$/.test(entreprise.trim()) ||
                cleanEntreprise.length < 2
            ) {
                entreprise = ""; // Reset — will be enriched from RAG below
            }
        }

        // Enrichir depuis RAG si disponible
        if (ragExp) {
            // [FIX] Force RAG company name for consistency and grouping
            // Unless the parsed company is very specific and different (rare)
            // We prioritize RAG company to ensure "Volkswagen" and "Volkswagen FS" group together
            if (ragExp.entreprise || ragExp.client) {
                entreprise = ragExp.entreprise || ragExp.client;
            }
            if (!poste) poste = ragExp.poste || ragExp.titre || "";
        }

        // Fallback si toujours vide
        if (!poste) poste = "Expérience";

        // Réalisations = tous les textes restants
        const realisations = allTexts.slice(0, opts.maxBulletsPerExperience);

        // [AUDIT-FIX 100%] Priorité aux dates/lieux du WIDGET (peuplés explicitement par l'IA)
        // C'est beaucoup plus robuste que le matching RAG
        const widgetHeader = widgets.find(w => w.type === "experience_header");
        let date_debut = widgetHeader?.date_start || "";
        let date_fin = widgetHeader?.date_end;
        let lieu = widgetHeader?.location;
        let actuel = (coerceBoolean(widgetHeader?.is_current) ?? false) === true;

        if (ragExp) {
            if (!date_debut) {
                date_debut = formatDate(ragExp.debut || ragExp.date_debut || ragExp.start_date);
            }
            if (!date_fin) {
                date_fin = formatDate(ragExp.fin || ragExp.date_fin || ragExp.end_date);
            }
            if (!actuel) {
                actuel = (coerceBoolean(ragExp.actuel ?? ragExp.current ?? ragExp.is_current) ?? false) === true;
            }
        }

        const endLower = String(date_fin ?? "").trim().toLowerCase();
        const endIsPresent = endLower === "présent" || endLower === "present" || endLower === "now" || endLower === "aujourd'hui";
        if (date_fin && !endIsPresent) actuel = false;
        if (endIsPresent) actuel = true;
        if (actuel) date_fin = undefined;

        if (!lieu && ragExp) {
            lieu = ragExp.lieu || ragExp.location || undefined;
        }

        const clientsRaw =
            (Array.isArray(ragExp?.clients_references) && ragExp.clients_references) ||
            (Array.isArray(ragExp?.clients) && ragExp.clients) ||
            (Array.isArray(ragExp?.clientsReferences) && ragExp.clientsReferences) ||
            [];
        const maxClientsPerExperience = opts.limitsBySection?.maxClientsPerExperience ?? 6;

        // [AUDIT-FIX 100%] Utiliser la version avec secteurs
        let clients = cleanClientListWithSectors(clientsRaw, { exclude: [entreprise], max: maxClientsPerExperience });
        if (clients.length === 0 && clientsRaw.length > 0) {
            clients = cleanClientListWithSectors(clientsRaw, { max: maxClientsPerExperience });
        }

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
    // [FIX] Check against usedRagIds first (100% reliable), fall back to fuzzy string match
    if (ragProfile?.experiences && Array.isArray(ragProfile.experiences)) {
        // Construire un Set des expériences déjà couvertes (poste|entreprise normalisés)
        // Kept as secondary check
        const coveredKeys = new Set(
            experiences.map(e => `${normalizeKey(e.poste)}|${normalizeKey(e.entreprise)}`)
        );

        debugLog("[buildExperiences] FALLBACK check:", {
            usedRagIds: Array.from(usedRagIds),
            coveredKeys: Array.from(coveredKeys),
            ragExperiences: ragProfile.experiences.map((e: any) => `${normalizeKey(e.poste || e.titre || "")}|${normalizeKey(e.entreprise || e.client || "")}`),
        });

        for (const [i, ragExp] of ragProfile.experiences.entries()) {
            // [FIX] Skip if ID already used
            if (ragExp.id && usedRagIds.has(ragExp.id)) continue;

            const ragPoste = normalizeKey(ragExp.poste || ragExp.titre || "");
            const ragEntreprise = normalizeKey(ragExp.entreprise || ragExp.client || "");
            const ragKey = `${ragPoste}|${ragEntreprise}`;

            // Skip if key already covered (secondary check)
            if (coveredKeys.has(ragKey)) continue;

            if (ragPoste || ragEntreprise) {
                debugLog(`[buildExperiences] FALLBACK: exp RAG "${ragPoste} @ ${ragEntreprise}" non couverte par Gemini, création depuis RAG`);

                const poste = ragExp.poste || ragExp.titre || "Expérience";
                const entreprise = ragExp.entreprise || ragExp.client || "";
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
                let date_fin: string | undefined = formatDate(ragExp.fin || ragExp.date_fin || ragExp.end_date || "");
                const lieu = ragExp.lieu || ragExp.location || undefined;
                let actuel = (coerceBoolean(ragExp.actuel ?? ragExp.current ?? ragExp.is_current) ?? false) === true;
                const endLower = String(date_fin ?? "").trim().toLowerCase();
                const endIsPresent = endLower === "présent" || endLower === "present" || endLower === "now" || endLower === "aujourd'hui";
                if (date_fin && !endIsPresent) actuel = false;
                if (endIsPresent) actuel = true;
                if (actuel) date_fin = undefined;
                const clientsRaw =
                    (Array.isArray(ragExp?.clients_references) && ragExp.clients_references) ||
                    (Array.isArray(ragExp?.clients) && ragExp.clients) ||
                    (Array.isArray(ragExp?.clientsReferences) && ragExp.clientsReferences) ||
                    [];
                const maxClientsPerExperience = opts.limitsBySection?.maxClientsPerExperience ?? 6;
                // [AUDIT-FIX 100%] Utiliser la version avec secteurs
                let clients = cleanClientListWithSectors(clientsRaw, { exclude: [entreprise], max: maxClientsPerExperience });
                if (clients.length === 0 && clientsRaw.length > 0) {
                    clients = cleanClientListWithSectors(clientsRaw, { max: maxClientsPerExperience });
                }

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

    // [FIX] Trier par date_debut décroissant (plus récent en premier), score en secondaire
    // YYYY-MM se trie correctement par comparaison lexicographique (2024-12 > 2023-04 > 2016-10)
    (experiences as any[]).sort((a, b) => {
        const dateA = a.date_debut || "";
        const dateB = b.date_debut || "";
        // Expériences avec date avant celles sans date
        if (dateB && !dateA) return 1;
        if (dateA && !dateB) return -1;
        // Plus récent en premier
        if (dateB !== dateA) return dateB.localeCompare(dateA);
        // Tie-breaker: score de pertinence
        return (b._relevance_score || 0) - (a._relevance_score || 0);
    });

    // Appliquer la limite max (mais par défaut = 999, donc pas de limite)
    const limited = experiences.slice(0, opts.maxExperiences);

    debugLog("[buildExperiences] OUTPUT:", {
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

// [FIX DATA-LOSS] Blacklist des soft skills trop génériques (n'apportent rien dans un CV)
const GENERIC_SOFT_SKILLS = new Set([
    "autonomie", "rigueur", "motivation", "dynamisme",
    "ponctualité", "sérieux", "patience", "curiosité",
    "polyvalence", "réactivité", "persévérance", "assiduité",
]);

function buildCompetences(skillsWidgets: AIWidget[], ragProfile?: any, inducedOpts?: InducedDataOptions, opts?: ConvertOptions): RendererResumeSchema["competences"] {
    const techniquesSet = new Set<string>();
    const softSkillsSet = new Set<string>();
    const rejectedKeys = new Set<string>(Array.isArray(ragProfile?.rejected_inferred) ? ragProfile.rejected_inferred.map(normalizeKey).filter(Boolean) : []);

    const shouldKeep = (name: string) => {
        const key = normalizeKey(name);
        if (!key) return false;
        if (rejectedKeys.has(key)) return false;
        return true;
    };

    // [FIX DATA-LOSS] Filtre soft skills génériques
    const shouldKeepSoftSkill = (name: string) => {
        if (!shouldKeep(name)) return false;
        const lower = name.toLowerCase().trim();
        if (GENERIC_SOFT_SKILLS.has(lower)) return false;
        // Aussi filtrer les combinaisons type "Autonomie & Rigueur"
        for (const generic of GENERIC_SOFT_SKILLS) {
            if (lower === generic) return false;
        }
        // Filtrer les strings composites genre "Autonomie & Rigueur"
        const parts = lower.split(/\s*[&,\/]\s*/);
        if (parts.length > 1 && parts.every(p => GENERIC_SOFT_SKILLS.has(p.trim()))) return false;
        return true;
    };

    skillsWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;
        if (!shouldKeep(text)) return;

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
            if (shouldKeepSoftSkill(text)) softSkillsSet.add(text);
        } else {
            techniquesSet.add(text);
        }
    });

    // [AUDIT-FIX P1-1/P1-2] Appliquer le filtre InducedDataOptions pour les compétences tacites
    const effectiveInducedOpts = inducedOpts || INDUCED_DATA_PRESETS.all;
    const contexte = ragProfile?.contexte_enrichi;

    if (effectiveInducedOpts.include_competences_tacites && effectiveInducedOpts.mode !== "none") {
        const minConf = effectiveInducedOpts.min_confidence;
        const tacites = Array.isArray(contexte?.competences_tacites) ? contexte.competences_tacites : [];
        for (const item of tacites) {
            const nameRaw = typeof item === "string" ? item : item?.nom || item?.name;
            const name = String(nameRaw ?? "").trim();
            if (!name) continue;
            if (!shouldKeep(name)) continue;
            const confidence = typeof (item as any)?.confidence === "number" ? (item as any).confidence : undefined;
            const type = typeof (item as any)?.type === "string" ? String((item as any).type) : "";

            if (confidence !== undefined && confidence < minConf) continue;

            if (type === "soft_skill") {
                if (shouldKeepSoftSkill(name)) softSkillsSet.add(name);
                continue;
            }

            techniquesSet.add(name);
        }

        const softDeduites = Array.isArray(contexte?.soft_skills_deduites) ? contexte.soft_skills_deduites : [];
        for (const item of softDeduites) {
            const name = typeof item === "string" ? item : item?.nom || item?.name;
            if (name && String(name).trim() && shouldKeepSoftSkill(String(name).trim())) softSkillsSet.add(String(name).trim());
        }
    }

    // [FIX DATA-LOSS] Enrichir TOUJOURS depuis RAG direct
    // Le RAG peut stocker les skills à competences.explicit.* OU competences.* selon la version
    if (ragProfile?.competences) {
        const comp = ragProfile.competences;
        // Chemin 1 (v2): competences.explicit.techniques
        // Chemin 2 (v1): competences.techniques
        const ragTech = Array.isArray(comp.explicit?.techniques) ? comp.explicit.techniques
            : Array.isArray(comp.techniques) ? comp.techniques : [];
        for (const skill of ragTech) {
            const name = typeof skill === "string" ? skill : skill?.nom || skill?.name;
            if (name && String(name).trim() && shouldKeep(String(name).trim())) {
                techniquesSet.add(String(name).trim());
            }
        }
        const ragSoft = Array.isArray(comp.explicit?.soft_skills) ? comp.explicit.soft_skills
            : Array.isArray(comp.soft_skills) ? comp.soft_skills : [];
        for (const skill of ragSoft) {
            const name = typeof skill === "string" ? skill : skill?.nom || skill?.name;
            if (name && String(name).trim() && shouldKeepSoftSkill(String(name).trim())) {
                softSkillsSet.add(String(name).trim());
            }
        }

        // [FIX DATA-LOSS] Inferred skills (confidence >= 80 uniquement, pas les génériques)
        const inferredTech = Array.isArray(comp.inferred?.techniques) ? comp.inferred.techniques : [];
        for (const item of inferredTech) {
            const name = typeof item === "string" ? item : item?.name || item?.nom;
            const confidence = typeof item?.confidence === "number" ? item.confidence : 100;
            if (name && confidence >= 80 && shouldKeep(String(name).trim())) {
                techniquesSet.add(String(name).trim());
            }
        }
        const inferredSoft = Array.isArray(comp.inferred?.soft_skills) ? comp.inferred.soft_skills : [];
        for (const item of inferredSoft) {
            const name = typeof item === "string" ? item : item?.name || item?.nom;
            const confidence = typeof item?.confidence === "number" ? item.confidence : 100;
            if (name && confidence >= 80 && shouldKeepSoftSkill(String(name).trim())) {
                softSkillsSet.add(String(name).trim());
            }
        }
    }

    // [Sprint 3] Construction des catégories
    const categories: { name: string; skills: string[] }[] = [];
    if (ragProfile?.competences?.par_domaine) {
        for (const [domain, skills] of Object.entries(ragProfile.competences.par_domaine)) {
            if (Array.isArray(skills) && skills.length > 0) {
                // Filtrer les skills vides ou doublons
                const validSkills = skills
                    .map(s => String(s).trim())
                    .filter(s => s && shouldKeep(s));

                if (validSkills.length > 0) {
                    categories.push({
                        name: domain,
                        skills: Array.from(new Set(validSkills)) // Dedup interne
                    });
                }
            }
        }
    }

    return {
        techniques: Array.from(techniquesSet).slice(0, opts?.limitsBySection?.maxSkills ?? 999),
        soft_skills: Array.from(softSkillsSet).slice(0, opts?.limitsBySection?.maxSoftSkills ?? 999),
        categories: categories.length > 0 ? categories : undefined
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
 * [CDC-FIX] : Ajout logs debug pour tracer les clients manquants
 */
function buildCertificationsAndReferences(
    certificationWidgets: AIWidget[],
    referenceWidgets: AIWidget[],
    ragProfile?: any,
    opts?: typeof DEFAULT_OPTIONS
) {
    const certifications: string[] = [];
    const clientsRaw: unknown[] = [];
    const extractClientName = (value: any): string => {
        if (typeof value === "string") return value;
        if (!value || typeof value !== "object") return "";
        const candidate = value.nom ?? value.name ?? value.client ?? value.entreprise ?? value.company;
        return typeof candidate === "string" ? candidate : "";
    };

    // [CDC-DEBUG] Log structure RAG pour diagnostic clients
    debugLog("[buildCertificationsAndReferences] DEBUG RAG structure:", {
        hasRagProfile: !!ragProfile,
        hasReferences: !!ragProfile?.references,
        hasReferencesClients: !!ragProfile?.references?.clients,
        referencesClientsLength: ragProfile?.references?.clients?.length ?? 0,
        referencesClientsType: Array.isArray(ragProfile?.references?.clients) ? "array" : typeof ragProfile?.references?.clients,
        referencesClientsSample: ragProfile?.references?.clients?.slice?.(0, 3) ?? null,
        // Aussi checker d'autres chemins possibles
        hasClientsReferences: !!ragProfile?.clients_references,
        clientsReferencesLength: ragProfile?.clients_references?.clients?.length ?? 0,
        experiencesCount: ragProfile?.experiences?.length ?? 0,
        experiencesWithClients: ragProfile?.experiences?.filter?.((e: any) =>
            e?.clients?.length > 0 || e?.clients_references?.length > 0
        )?.length ?? 0,
    });

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

    debugLog("[buildCertificationsAndReferences] Widgets:", {
        certificationWidgetsCount: certificationWidgets.length,
        referenceWidgetsCount: referenceWidgets.length,
        clientsFromWidgets: clientsRaw.length,
    });

    // [FIX DATA-LOSS] Enrichir TOUJOURS depuis RAG avec dédoublonnage intelligent
    if (ragProfile?.certifications) {
        // Dédupliquer par normalizeKey (insensible à la casse/ponctuation)
        // Ex: "TOEIC Listening and Reading - Score: 585/990 (Niveau B1)" et
        //     "TOEIC Listening and Reading (Score 585/990 - Niveau B1)" → même cert
        const existingKeys = new Set(certifications.map(c => {
            // Extraire juste le nom principal avant les détails (score, niveau, etc.)
            const base = c.replace(/\s*[-(/].*$/, "").trim();
            return normalizeKey(base.length > 5 ? base : c);
        }));
        const ragCerts = Array.isArray(ragProfile.certifications) ? ragProfile.certifications : [];
        ragCerts.forEach((c: any) => {
            const certName = typeof c === "string" ? c : c.nom;
            if (!certName) return;
            const base = certName.replace(/\s*[-(/].*$/, "").trim();
            const key = normalizeKey(base.length > 5 ? base : certName);
            if (!existingKeys.has(key)) {
                certifications.push(certName);
                existingKeys.add(key);
            }
        });
    }

    // [AUDIT FIX] : Enrichir clients depuis RAG
    // Chemin 1: references.clients
    const ragClientsFromReferences = Array.isArray(ragProfile?.references?.clients) ? ragProfile.references.clients : [];
    debugLog("[buildCertificationsAndReferences] ragClientsFromReferences:", ragClientsFromReferences.length, ragClientsFromReferences.slice(0, 5));
    ragClientsFromReferences.forEach((c: any) => {
        const clientName = extractClientName(c);
        if (clientName) clientsRaw.push(clientName);
    });

    // [CDC-FIX] Chemin alternatif: clients_references (au niveau racine)
    const ragClientsFromRoot = Array.isArray(ragProfile?.clients_references?.clients) ? ragProfile.clients_references.clients : [];
    debugLog("[buildCertificationsAndReferences] ragClientsFromRoot:", ragClientsFromRoot.length, ragClientsFromRoot.slice(0, 5));
    ragClientsFromRoot.forEach((c: any) => {
        const clientName = extractClientName(c);
        if (clientName) clientsRaw.push(clientName);
    });

    // Chemin 3: experiences[].clients ou clients_references
    const ragClientsFromExperiences = Array.isArray(ragProfile?.experiences) ? ragProfile.experiences : [];
    let clientsFromExpCount = 0;
    ragClientsFromExperiences.forEach((exp: any, idx: number) => {
        const expClients =
            (Array.isArray(exp?.clients_references) && exp.clients_references) ||
            (Array.isArray(exp?.clients) && exp.clients) ||
            (Array.isArray(exp?.clientsReferences) && exp.clientsReferences) ||
            [];
        if (expClients.length > 0) {
            debugLog(`[buildCertificationsAndReferences] Experience ${idx} clients:`, expClients.slice(0, 3));
        }
        expClients.forEach((c: any) => {
            const clientName = extractClientName(c);
            if (clientName) {
                clientsRaw.push(clientName);
                clientsFromExpCount++;
            }
        });
    });

    debugLog("[buildCertificationsAndReferences] Total clientsRaw avant nettoyage:", {
        total: clientsRaw.length,
        fromExperiences: clientsFromExpCount,
        sample: clientsRaw.slice(0, 10),
    });

    const excludeCompanies = Array.isArray(ragProfile?.experiences)
        ? ragProfile.experiences.map((e: any) => e?.entreprise || e?.client).filter(Boolean)
        : [];
    debugLog("[buildCertificationsAndReferences] Entreprises à exclure:", excludeCompanies.slice(0, 5));

    const maxClientsReferences = opts?.limitsBySection?.maxClientsReferences ?? 25;
    let uniqueClients = cleanClientList(clientsRaw, { exclude: excludeCompanies, max: maxClientsReferences });

    debugLog("[buildCertificationsAndReferences] Après cleanClientList (avec exclude):", {
        uniqueClientsLength: uniqueClients.length,
        uniqueClients: uniqueClients.slice(0, 10),
    });

    if (uniqueClients.length === 0 && clientsRaw.length > 0) {
        debugLog("[buildCertificationsAndReferences] FALLBACK: retry sans exclude car 0 clients");
        uniqueClients = cleanClientList(clientsRaw, { max: maxClientsReferences });
        debugLog("[buildCertificationsAndReferences] Après cleanClientList (sans exclude):", uniqueClients.length, uniqueClients.slice(0, 10));
    }

    // [CDC-FIX] Construire les secteurs depuis le RAG
    // Utiliser normalizeKey pour le matching (case-insensitive)
    const uniqueClientsKeys = new Set(uniqueClients.map(normalizeKey));

    const secteursFromRag = (() => {
        const ragClients = Array.isArray(ragProfile?.references?.clients) ? ragProfile.references.clients : [];
        const bySector = new Map<string, Set<string>>();

        for (const c of ragClients) {
            if (!c || typeof c !== "object") continue;
            const sector = String((c as any).secteur || "").trim();
            if (!sector) continue;
            const name = normalizeClientName((c as any).nom ?? (c as any).name);
            if (!name) continue;

            // [CDC-FIX] Utiliser normalizeKey pour le matching au lieu de includes()
            const nameKey = normalizeKey(name);
            if (!uniqueClientsKeys.has(nameKey)) continue;

            const set = bySector.get(sector) ?? new Set<string>();
            set.add(name);
            bySector.set(sector, set);
        }

        const sectors = Array.from(bySector.entries())
            .map(([secteur, set]) => ({ secteur, clients: Array.from(set.values()) }))
            .filter((x) => x.clients.length > 0)
            .sort((a, b) => b.clients.length - a.clients.length || a.secteur.localeCompare(b.secteur, "fr"));
        return sectors.length > 0 ? sectors.slice(0, 6) : undefined;
    })();

    // [AUDIT-FIX P0-3] Scorer les clients par pertinence avec l'offre d'emploi
    // Les clients dans le même secteur que l'offre remontent en priorité
    const scoredClients = (() => {
        if (uniqueClients.length === 0) return uniqueClients;
        // Récupérer les secteurs de l'offre depuis le RAG ou le contexte
        const ragClientsBySector = new Map<string, string>();
        const ragClients = Array.isArray(ragProfile?.references?.clients) ? ragProfile.references.clients : [];
        for (const c of ragClients) {
            if (c && typeof c === "object" && c.secteur && (c.nom || c.name)) {
                ragClientsBySector.set(normalizeKey(c.nom || c.name), c.secteur);
            }
        }

        // Scorer chaque client : clients avec secteur connu en premier, puis alphabétique
        return [...uniqueClients].sort((a, b) => {
            const aSector = ragClientsBySector.get(normalizeKey(a));
            const bSector = ragClientsBySector.get(normalizeKey(b));
            // Clients avec secteur connu sont prioritaires
            if (aSector && !bSector) return -1;
            if (!aSector && bSector) return 1;
            return a.localeCompare(b, "fr");
        });
    })();

    const clients_references =
        scoredClients.length > 0
            ? {
                clients: scoredClients,
                secteurs: secteursFromRag,
            }
            : undefined;

    debugLog("[buildCertificationsAndReferences] RESULTAT FINAL:", {
        hasClientsReferences: !!clients_references,
        clientsCount: clients_references?.clients?.length ?? 0,
        secteursCount: clients_references?.secteurs?.length ?? 0,
        clientsSample: clients_references?.clients?.slice(0, 5) ?? [],
    });

    return {
        certifications: certifications.length > 0 ? certifications : undefined,
        clients_references,
    };
}

/**
 * [CDC-21] Construit les projets depuis les widgets et le RAG
 * Évite la perte de données des projets dans le pipeline
 */
function buildProjects(
    projectWidgets: AIWidget[],
    ragProfile?: any
): RendererResumeSchema["projects"] {
    const projects: NonNullable<RendererResumeSchema["projects"]> = [];

    // D'abord, construire depuis les widgets
    projectWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;

        // Heuristique : "Nom du projet - Description"
        let nom = text;
        let description = "";
        let technologies: string[] = [];
        let lien: string | undefined;

        // Chercher un lien URL dans le texte
        const urlMatch = text.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
            lien = urlMatch[0];
        }

        // Séparer nom et description
        const separatorIndex = text.indexOf(" - ");
        if (separatorIndex !== -1) {
            nom = text.slice(0, separatorIndex).trim();
            description = text.slice(separatorIndex + 3).trim();
        }

        // Extraire les technologies si mentionnées entre parenthèses ou crochets
        const techMatch = text.match(/\[([^\]]+)\]|\(([^)]+)\)/);
        if (techMatch) {
            const techStr = techMatch[1] || techMatch[2];
            technologies = techStr.split(/[,;]/).map(t => t.trim()).filter(Boolean);
        }

        projects.push({
            nom: nom || "Projet",
            description: description || text,
            technologies: technologies.length > 0 ? technologies : undefined,
            lien,
        });
    });

    // [AUDIT FIX] : Si aucun projet depuis widgets, utiliser le RAG
    if (projects.length === 0 && ragProfile?.projets) {
        const ragProjets = Array.isArray(ragProfile.projets) ? ragProfile.projets : [];
        ragProjets.forEach((p: any) => {
            projects.push({
                nom: p.nom || p.titre || p.name || "Projet",
                description: p.description || "",
                technologies: Array.isArray(p.technologies) ? p.technologies : undefined,
                lien: p.lien || p.url || p.link || undefined,
            });
        });
    }

    return projects.length > 0 ? projects : undefined;
}
