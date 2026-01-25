/**
 * AI Adapter (Bridge) - Convertit AI_WIDGETS_SCHEMA en RendererResumeSchema
 *
 * [AUDIT FIX IMPORTANT-6] : Enrichissement des expériences avec dates/lieux depuis RAG
 * [AUDIT FIX CRITIQUE-3] : Propagation des infos de contact et photo depuis RAG
 */

import { aiWidgetsEnvelopeSchema, AIWidgetsEnvelope, AIWidget } from "./ai-widgets";
import type { RendererResumeSchema } from "./renderer-schema";

export interface ConvertOptions {
    /**
     * Score minimum pour qu'un widget soit pris en compte.
     * Par défaut: 50.
     */
    minScore?: number;
    /**
     * Nombre maximum d'expériences rendues.
     * Par défaut: 6.
     */
    maxExperiences?: number;
    /**
     * Nombre maximum de réalisations par expérience.
     * Par défaut: 6.
     */
    maxBulletsPerExperience?: number;
    /**
     * [AUDIT FIX IMPORTANT-6] : Profil RAG source pour enrichir les données manquantes
     * (dates, lieux, contact, photo)
     */
    ragProfile?: any;
}

const DEFAULT_OPTIONS: Required<Omit<ConvertOptions, 'ragProfile'>> & { ragProfile?: any } = {
    minScore: 50,
    maxExperiences: 6,
    maxBulletsPerExperience: 6,
    ragProfile: undefined,
};

/**
 * Limites dynamiques calculées selon la richesse du RAG
 */
export interface DynamicLimits {
    minExperiences: number;
    maxExperiences: number;
    minBulletsPerExperience: number;
    maxBulletsPerExperience: number;
    minScore: number;
    maxWidgets: number;
    /** Pour le prompt Gemini */
    promptHint: string;
}

/**
 * Calcule les limites dynamiques selon la richesse du profil RAG.
 *
 * Plus le RAG est riche, plus on peut être sélectif (minScore élevé)
 * mais on garde plus d'expériences pour montrer l'étendue du profil.
 */
export function calculateDynamicLimits(ragProfile: any): DynamicLimits {
    // Compter les éléments du RAG
    const experiences = ragProfile?.experiences || [];
    const nbExperiences = Array.isArray(experiences) ? experiences.length : 0;

    // Compter le nombre total de réalisations
    let nbRealisations = 0;
    if (Array.isArray(experiences)) {
        experiences.forEach((exp: any) => {
            if (Array.isArray(exp.realisations)) {
                nbRealisations += exp.realisations.length;
            }
        });
    }

    // Compter les compétences
    const competences = ragProfile?.competences || {};
    const nbCompetences = (competences.techniques?.length || 0) + (competences.soft_skills?.length || 0);

    // Logique adaptative
    let limits: DynamicLimits;

    if (nbExperiences <= 3) {
        // Profil junior/débutant : inclure presque tout
        limits = {
            minExperiences: Math.max(1, nbExperiences - 1),
            maxExperiences: nbExperiences,
            minBulletsPerExperience: 3,
            maxBulletsPerExperience: 6,
            minScore: 35,  // Seuil bas pour ne rien perdre
            maxWidgets: 40,
            promptHint: `Ce profil a ${nbExperiences} expériences - inclure TOUTES ou presque toutes les expériences (${Math.max(1, nbExperiences - 1)}-${nbExperiences}).`
        };
    } else if (nbExperiences <= 6) {
        // Profil intermédiaire : garder la majorité
        limits = {
            minExperiences: Math.max(3, nbExperiences - 2),
            maxExperiences: nbExperiences,
            minBulletsPerExperience: 3,
            maxBulletsPerExperience: 5,
            minScore: 40,
            maxWidgets: 55,
            promptHint: `Ce profil a ${nbExperiences} expériences - sélectionner ${Math.max(3, nbExperiences - 2)}-${nbExperiences} expériences les plus pertinentes.`
        };
    } else if (nbExperiences <= 10) {
        // Profil senior : sélection plus stricte mais large
        limits = {
            minExperiences: 5,
            maxExperiences: 8,
            minBulletsPerExperience: 3,
            maxBulletsPerExperience: 5,
            minScore: 45,
            maxWidgets: 70,
            promptHint: `Ce profil riche a ${nbExperiences} expériences - sélectionner 5-8 expériences les plus pertinentes pour l'offre.`
        };
    } else {
        // Profil très expérimenté (11+) : être sélectif
        limits = {
            minExperiences: 6,
            maxExperiences: 10,
            minBulletsPerExperience: 2,
            maxBulletsPerExperience: 4,
            minScore: 50,
            maxWidgets: 80,
            promptHint: `Ce profil très riche a ${nbExperiences} expériences - sélectionner 6-10 expériences les plus stratégiques pour l'offre.`
        };
    }

    // Bonus si beaucoup de réalisations : augmenter maxWidgets
    if (nbRealisations > 30) {
        limits.maxWidgets = Math.min(100, limits.maxWidgets + 20);
    }

    console.log(`[DynamicLimits] RAG: ${nbExperiences} exp, ${nbRealisations} réalisations, ${nbCompetences} compétences → maxExp=${limits.maxExperiences}, minScore=${limits.minScore}`);

    return limits;
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

    // Si ragProfile est fourni et que les limites ne sont pas explicitement définies,
    // calculer les limites dynamiques selon la richesse du profil
    let effectiveOptions = { ...DEFAULT_OPTIONS, ...(options || {}) };
    if (options?.ragProfile && !options?.maxExperiences) {
        const dynamicLimits = calculateDynamicLimits(options.ragProfile);
        effectiveOptions = {
            ...effectiveOptions,
            minScore: options?.minScore ?? dynamicLimits.minScore,
            maxExperiences: dynamicLimits.maxExperiences,
            maxBulletsPerExperience: dynamicLimits.maxBulletsPerExperience,
        };
        console.log(`[ai-adapter] Limites dynamiques appliquées: maxExp=${effectiveOptions.maxExperiences}, minScore=${effectiveOptions.minScore}`);
    }

    const opts = effectiveOptions;

    // 1) Filtrer + trier globalement les widgets par score de pertinence
    const sortedWidgets = [...parsed.widgets]
        .filter((w) => w.relevance_score >= opts.minScore)
        .sort((a, b) => b.relevance_score - a.relevance_score);

    // 2) Partition par section
    const headerWidgets = sortedWidgets.filter((w) => w.section === "header" || w.section === "summary");
    const experienceWidgets = sortedWidgets.filter((w) => w.section === "experiences");
    const skillsWidgets = sortedWidgets.filter((w) => w.section === "skills");
    const educationWidgets = sortedWidgets.filter((w) => w.section === "education");
    const languageWidgets = sortedWidgets.filter((w) => w.section === "languages");
    const projectWidgets = sortedWidgets.filter((w) => w.section === "projects");
    const referenceWidgets = sortedWidgets.filter((w) => w.section === "references");

    // 3) Construire le header / profil
    // [AUDIT FIX CRITIQUE-3] : Passer le ragProfile pour enrichir le profil
    const profil = buildProfil(parsed, headerWidgets, opts.ragProfile);

    // 4) Construire les expériences
    // [AUDIT FIX IMPORTANT-6] : Passer le ragProfile pour enrichir les dates/lieux
    const experiences = buildExperiences(experienceWidgets, opts, opts.ragProfile);

    // 5) Construire les compétences
    const competences = buildCompetences(skillsWidgets);

    // 6) Formations - [AUDIT FIX] : Enrichir depuis RAG si disponible
    const formations = buildFormations(educationWidgets, opts.ragProfile);

    // 7) Langues - [AUDIT FIX] : Enrichir depuis RAG si disponible
    const langues = buildLangues(languageWidgets, opts.ragProfile);

    // 8) Certifications et références projet / clients
    const { certifications, clients_references } = buildCertificationsAndReferences(
        projectWidgets,
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
 * [AUDIT FIX IMPORTANT-6] : Construit les expériences en enrichissant depuis le RAG
 */
function buildExperiences(
    experienceWidgets: AIWidget[],
    opts: typeof DEFAULT_OPTIONS,
    ragProfile?: any
): RendererResumeSchema["experiences"] {
    type ExperienceAccumulator = {
        id: string;
        bestScore: number;
        headerText?: string;
        bullets: string[];
    };

    const byExpId = new Map<string, ExperienceAccumulator>();

    experienceWidgets.forEach((widget, idx) => {
        const expId =
            widget.sources?.rag_experience_id ||
            `exp_${idx}`;

        const existing = byExpId.get(expId) || {
            id: expId,
            bestScore: -1,
            headerText: undefined,
            bullets: [],
        };

        if (widget.type === "experience_header") {
            // Utilisé principalement pour le titre de l'expérience
            if (widget.relevance_score > existing.bestScore) {
                existing.headerText = widget.text;
                existing.bestScore = widget.relevance_score;
            }
        } else if (widget.type === "experience_bullet") {
            const text = widget.text.trim();
            if (text && !existing.bullets.includes(text)) {
                existing.bullets.push(text);
            }
            if (widget.relevance_score > existing.bestScore) {
                existing.bestScore = widget.relevance_score;
            }
        }

        byExpId.set(expId, existing);
    });

    // Transformer en tableau et trier par bestScore
    const accs = Array.from(byExpId.values())
        .filter((acc) => acc.bullets.length > 0)
        .sort((a, b) => b.bestScore - a.bestScore)
        .slice(0, opts.maxExperiences);

    // Construire les expériences au format RendererResumeSchema
    const experiences: RendererResumeSchema["experiences"] = accs.map((acc) => {
        const header = acc.headerText || "";

        // Heuristique simple : séparer poste / entreprise si possible
        let poste = header;
        let entreprise = "";
        const separatorIndex = header.indexOf(" - ");
        if (separatorIndex !== -1) {
            poste = header.slice(0, separatorIndex).trim();
            entreprise = header.slice(separatorIndex + 3).trim();
        }

        // [AUDIT FIX IMPORTANT-6] : Enrichir depuis le RAG source
        const ragExp = findRAGExperience(acc.id, ragProfile);

        if (ragExp) {
            // Si on a trouvé l'expérience RAG, utiliser ses données
            if (!poste || poste === "Expérience clé") {
                poste = ragExp.poste || poste;
            }
            if (!entreprise || entreprise === "—") {
                entreprise = ragExp.entreprise || entreprise;
            }
        }

        if (!poste) {
            poste = "Expérience clé";
        }

        const realisations = acc.bullets.slice(0, opts.maxBulletsPerExperience);

        // [AUDIT FIX IMPORTANT-6] : Récupérer dates et lieu depuis RAG
        const date_debut = ragExp ? formatDate(ragExp.debut || ragExp.date_debut) : "";
        const date_fin = ragExp ? formatDate(ragExp.fin || ragExp.date_fin) : undefined;
        const lieu = ragExp?.lieu || undefined;
        const actuel = ragExp?.actuel || false;

        return {
            poste,
            entreprise: entreprise || "—",
            date_debut,
            date_fin: actuel ? undefined : date_fin,
            actuel,
            lieu,
            realisations,
            // Métadonnées pour scoring
            _relevance_score: acc.bestScore,
            _rag_experience_id: acc.id,
        } as any;
    });

    // Filtrer "Expérience clé" sans contexte suffisant
    const filteredExperiences = experiences.filter((exp) => {
        // Si c'est "Expérience clé" sans entreprise valide et sans dates, masquer
        if (
            exp.poste === "Expérience clé" &&
            (!exp.entreprise || exp.entreprise === "—") &&
            (!exp.date_debut || exp.date_debut.trim() === "")
        ) {
            return false;
        }
        return true;
    });

    return filteredExperiences;
}

function buildCompetences(skillsWidgets: AIWidget[]): RendererResumeSchema["competences"] {
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
    projectWidgets: AIWidget[],
    referenceWidgets: AIWidget[],
    ragProfile?: any
) {
    const certifications: string[] = [];
    const clients: string[] = [];

    projectWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;
        certifications.push(text);
    });

    referenceWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;
        clients.push(text);
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
    if (clients.length === 0 && ragProfile?.references?.clients) {
        const ragClients = Array.isArray(ragProfile.references.clients) ? ragProfile.references.clients : [];
        ragClients.forEach((c: any) => {
            const clientName = typeof c === "string" ? c : c.nom;
            if (clientName) clients.push(clientName);
        });
    }

    const clients_references =
        clients.length > 0
            ? {
                  clients,
                  secteurs: undefined,
              }
            : undefined;

    return {
        certifications: certifications.length > 0 ? certifications : undefined,
        clients_references,
    };
}
