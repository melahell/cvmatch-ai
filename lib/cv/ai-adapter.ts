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
}

const DEFAULT_OPTIONS: Required<ConvertOptions> = {
    minScore: 50,
    maxExperiences: 6,
    maxBulletsPerExperience: 6,
};

/**
 * Fonction principale : convertit un payload AI_WIDGETS_SCHEMA
 * en schéma de CV consommable par le renderer (`RendererResumeSchema` / `CVData`).
 *
 * Cette fonction est 100% déterministe :
 * - même entrée → même CV,
 * - filtres et tris explicites (pas d'aléatoire).
 */
export function convertAndSort(input: unknown, options?: ConvertOptions): RendererResumeSchema {
    const parsed = aiWidgetsEnvelopeSchema.parse(input) as AIWidgetsEnvelope;
    const opts: Required<ConvertOptions> = { ...DEFAULT_OPTIONS, ...(options || {}) };

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
    const profil = buildProfil(parsed, headerWidgets);

    // 4) Construire les expériences
    const experiences = buildExperiences(experienceWidgets, opts);

    // 5) Construire les compétences
    const competences = buildCompetences(skillsWidgets);

    // 6) Formations
    const formations = buildFormations(educationWidgets);

    // 7) Langues
    const langues = buildLangues(languageWidgets);

    // 8) Certifications et références projet / clients (optionnel)
    const { certifications, clients_references } = buildCertificationsAndReferences(projectWidgets, referenceWidgets);

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

function buildProfil(payload: AIWidgetsEnvelope, headerWidgets: AIWidget[]): RendererResumeSchema["profil"] {
    const base = payload.profil_summary || {};
    const job = payload.job_context || {};

    // Chercher un éventuel bloc de résumé prioritaire
    const summaryWidget = headerWidgets.find((w) => w.type === "summary_block");
    const elevator_pitch = summaryWidget?.text || base.elevator_pitch;

    return {
        prenom: base.prenom || "",
        nom: base.nom || "",
        titre_principal: base.titre_principal || (job.job_title || "").trim() || "Profil",
        email: undefined,
        telephone: undefined,
        localisation: base.localisation,
        linkedin: undefined,
        github: undefined,
        portfolio: undefined,
        elevator_pitch: elevator_pitch,
        photo_url: undefined,
    };
}

function buildExperiences(experienceWidgets: AIWidget[], opts: Required<ConvertOptions>): RendererResumeSchema["experiences"] {
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
    const experiences: RendererResumeSchema["experiences"] = accs.map((acc, index) => {
        const header = acc.headerText || "";

        // Heuristique simple : séparer poste / entreprise si possible
        let poste = header;
        let entreprise = "";
        const separatorIndex = header.indexOf(" - ");
        if (separatorIndex !== -1) {
            poste = header.slice(0, separatorIndex).trim();
            entreprise = header.slice(separatorIndex + 3).trim();
        }

        if (!poste) {
            poste = "Expérience clé";
        }

        const realisations = acc.bullets.slice(0, opts.maxBulletsPerExperience);

        return {
            poste,
            entreprise: entreprise || "—",
            date_debut: "",
            date_fin: undefined,
            lieu: undefined,
            realisations,
        };
    });

    return experiences;
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
            lower.includes("relationnel");

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

function buildFormations(educationWidgets: AIWidget[]): RendererResumeSchema["formations"] {
    const formations: RendererResumeSchema["formations"] = [];

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

    return formations;
}

function buildLangues(languageWidgets: AIWidget[]): RendererResumeSchema["langues"] {
    const langues: NonNullable<RendererResumeSchema["langues"]> = [];

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

    return langues.length > 0 ? langues : undefined;
}

function buildCertificationsAndReferences(projectWidgets: AIWidget[], referenceWidgets: AIWidget[]) {
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

