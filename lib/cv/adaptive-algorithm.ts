import { ThemeId } from "@/lib/cv/types";
import { CVData } from "../../components/cv/templates";
import { getThemeConfig } from "./theme-configs";
import { getUnitHeight } from "./content-units-reference";
import { JobOfferContext, sortExperiencesByRelevance } from "./relevance-scoring";

type ExperienceFormat = "detailed" | "standard" | "compact" | "minimal";

export interface CVAdaptationResult {
    cvData: CVData;
    dense: boolean;
    totalUnitsUsed: number;
    zoneUnitsUsed: Record<string, number>;
    warnings: string[];
    compressionLevelApplied: number;
}

function parseYear(value: string | undefined): number | null {
    if (!value) return null;
    const match = value.match(/(\d{4})/);
    if (!match) return null;
    const year = Number(match[1]);
    return Number.isFinite(year) ? year : null;
}

function yearsSince(value: string | undefined): number {
    const year = parseYear(value);
    if (!year) return 0;
    return Math.max(0, new Date().getFullYear() - year);
}

function getHeaderUnitType(params: { includePhoto: boolean; photoUrl?: string; contactCount: number }) {
    if (params.includePhoto && params.photoUrl) return "header_with_photo" as const;
    if (params.contactCount > 0) return "header_with_contacts" as const;
    return "header_minimal" as const;
}

function pickSummaryUnitType(pitch: string | undefined) {
    const text = (pitch || "").trim();
    if (!text) return null;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount >= 80 || text.length >= 420) return "summary_elevator" as const;
    if (wordCount >= 45 || text.length >= 220) return "summary_standard" as const;
    return "summary_short" as const;
}

function unitForExperience(format: ExperienceFormat) {
    if (format === "detailed") return getUnitHeight("experience_detailed");
    if (format === "standard") return getUnitHeight("experience_standard");
    if (format === "compact") return getUnitHeight("experience_compact");
    return getUnitHeight("experience_minimal");
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function computeSkillLines(cvData: CVData) {
    const techniques = Array.isArray(cvData.competences?.techniques) ? cvData.competences.techniques : [];
    const soft = Array.isArray(cvData.competences?.soft_skills) ? cvData.competences.soft_skills : [];
    return { techniques, soft };
}

function sliceText(text: string, maxChars: number) {
    if (text.length <= maxChars) return text;
    const sliced = text.slice(0, Math.max(0, maxChars - 3)).trimEnd();
    return sliced ? sliced + "..." : "";
}

function applyExperienceFormat(exp: CVData["experiences"][number], format: ExperienceFormat, maxBullets: number) {
    const bullets = Array.isArray(exp.realisations) ? exp.realisations : [];

    // CDC format limits: detailed=5, standard=3, compact=1, minimal=0
    // Note: maxBullets from theme is used as fallback but CDC takes priority
    const formatLimits: Record<ExperienceFormat, number> = {
        detailed: 5,
        standard: 3,
        compact: 1,
        minimal: 0,
    };

    const limit = formatLimits[format] ?? 3;
    const effectiveLimit = Math.min(limit, bullets.length);

    if (format === "compact") {
        const first = bullets[0];
        const compactLine = typeof first === "string" ? sliceText(first, 110) : "";
        return { ...exp, realisations: compactLine ? [compactLine] : [] };
    }

    if (format === "minimal") {
        return { ...exp, realisations: [] };
    }

    return { ...exp, realisations: bullets.slice(0, effectiveLimit) };
}

export function adaptCVToThemeUnits(params: {
    cvData: CVData;
    templateName: string;
    includePhoto: boolean;
    jobOffer?: JobOfferContext | null;
}): CVAdaptationResult {
    const theme = getThemeConfig(params.templateName);
    const warnings: string[] = [];

    let compressionLevelApplied = 0;
    let dense = false;

    const next: CVData = JSON.parse(JSON.stringify(params.cvData));
    const profil = next.profil || ({} as any);

    const contactCount = [profil.email, profil.telephone, profil.localisation, profil.linkedin]
        .filter((v) => typeof v === "string" && v.trim().length > 0).length;

    const headerUnitType = getHeaderUnitType({
        includePhoto: params.includePhoto,
        photoUrl: profil.photo_url,
        contactCount,
    });

    const headerUnits = getUnitHeight(headerUnitType);

    const zones = theme.zones;

    const experiences = Array.isArray(next.experiences) ? next.experiences : [];

    // Sort by relevance if job offer provided, otherwise by date
    const sortedExperiences: typeof experiences = params.jobOffer
        ? (sortExperiencesByRelevance(experiences as any, params.jobOffer) as typeof experiences)
        : [...experiences].sort((a, b) => {
            const aYear = parseYear(a.date_debut) || 0;
            const bYear = parseYear(b.date_debut) || 0;
            return bYear - aYear;
        });

    const maxBullets = theme.adaptive_rules.max_bullet_points_per_exp;

    // ════════════════════════════════════════════════════════════════
    // ALLOCATION GOURMANDE DES FORMATS D'EXPÉRIENCES
    // ════════════════════════════════════════════════════════════════
    // Stratégie : Maximiser l'information en remplissant au maximum la capacité
    // 1. Commencer par "detailed" pour toutes les expériences récentes
    // 2. Dégrader progressivement si on dépasse la capacité
    // ════════════════════════════════════════════════════════════════

    const experienceCapacity = zones.experiences.capacity_units;
    const experienceFormats: ExperienceFormat[] = [];

    // Phase 1 : Initialiser avec le format optimal pour chaque expérience
    // Les expériences récentes commencent en "detailed", les anciennes en "compact"
    for (const exp of sortedExperiences) {
        const isOld = yearsSince(exp.date_fin) >= theme.adaptive_rules.compact_after_years;
        if (isOld) {
            experienceFormats.push("compact");
        } else {
            experienceFormats.push("detailed"); // Gourmand : commencer par detailed
        }
    }

    // Phase 2 : Calculer les units utilisées et dégrader si dépassement
    const calculateExperienceUnits = () => {
        return experienceFormats.reduce((sum, f) => sum + unitForExperience(f), 0);
    };

    // Phase 3 : Dégradation itérative - du dernier detailed vers standard, etc.
    // On dégrade les expériences les moins prioritaires d'abord (fin de la liste)
    let iterations = 0;
    const maxIterations = sortedExperiences.length * 4; // Sécurité anti-boucle infinie

    while (calculateExperienceUnits() > experienceCapacity && iterations < maxIterations) {
        iterations++;

        // Trouver le dernier index avec un format dégradable
        let degraded = false;
        for (let i = experienceFormats.length - 1; i >= 0; i--) {
            const format = experienceFormats[i];
            if (format === "detailed") {
                experienceFormats[i] = "standard";
                degraded = true;
                break;
            } else if (format === "standard") {
                experienceFormats[i] = "compact";
                degraded = true;
                break;
            } else if (format === "compact") {
                experienceFormats[i] = "minimal";
                degraded = true;
                break;
            }
            // "minimal" ne peut plus être dégradé, on passe à l'expérience précédente
        }

        // Si aucune dégradation possible et toujours en dépassement, 
        // on devra exclure des expériences (géré par fitExperiencesToCapacity)
        if (!degraded) break;
    }

    const computeZoneUnits = (data: CVData, formats: ExperienceFormat[]) => {
        const zoneUnitsUsed: Record<string, number> = {};
        zoneUnitsUsed.header = headerUnits;
        const summaryType = pickSummaryUnitType(data.profil?.elevator_pitch);
        zoneUnitsUsed.summary = summaryType ? getUnitHeight(summaryType) : 0;

        const expUnits = formats.reduce((sum, f) => sum + unitForExperience(f), 0);
        zoneUnitsUsed.experiences = expUnits;

        const { techniques, soft } = computeSkillLines(data);
        const skillLineUnits = getUnitHeight("skill_line");
        zoneUnitsUsed.skills = (techniques.length + soft.length) * skillLineUnits;

        zoneUnitsUsed.formation = (data.formations?.length || 0) * getUnitHeight("formation_standard");
        zoneUnitsUsed.certifications = (data.certifications?.length || 0) * getUnitHeight("certification");
        zoneUnitsUsed.languages = (data.langues?.length || 0) * getUnitHeight("language");

        const clients = (data.clients_references?.clients || []).length;
        zoneUnitsUsed.clients = clients * skillLineUnits;

        const totalUnitsUsed = Object.values(zoneUnitsUsed).reduce((sum, n) => sum + n, 0);
        return { zoneUnitsUsed, totalUnitsUsed };
    };

    const shrinkSummaryIfNeeded = () => {
        if (!next.profil?.elevator_pitch) return false;

        const currentType = pickSummaryUnitType(next.profil.elevator_pitch);
        if (!currentType) return false;

        if (currentType === "summary_elevator") {
            next.profil.elevator_pitch = sliceText(next.profil.elevator_pitch, 260);
            compressionLevelApplied++;
            return true;
        }

        if (currentType === "summary_standard") {
            next.profil.elevator_pitch = sliceText(next.profil.elevator_pitch, 180);
            compressionLevelApplied++;
            return true;
        }
        next.profil.elevator_pitch = "";
        compressionLevelApplied++;
        return true;
    };

    const fitExperiencesToCapacity = () => {
        const cap = zones.experiences.capacity_units;
        const excludedExperiences: string[] = [];

        while (true) {
            const { zoneUnitsUsed } = computeZoneUnits(next, experienceFormats);
            if (zoneUnitsUsed.experiences <= cap) break;

            const idx = experienceFormats.length - 1;
            if (idx < 0) break;

            const current = experienceFormats[idx];
            const exp = sortedExperiences[idx];

            if (current === "detailed") {
                experienceFormats[idx] = "standard";
            } else if (current === "standard") {
                experienceFormats[idx] = "compact";
            } else if (current === "compact") {
                experienceFormats[idx] = "minimal";
            } else {
                // Track excluded experience for warning
                if (exp) {
                    excludedExperiences.push(`${exp.poste} (${exp.entreprise})`);
                }
                experienceFormats.pop();
                sortedExperiences.pop();
            }
            compressionLevelApplied++;
        }

        // Add explicit warnings for excluded experiences
        if (excludedExperiences.length > 0) {
            warnings.push(`⚠️ ${excludedExperiences.length} expérience(s) exclue(s) par manque d'espace: ${excludedExperiences.slice(0, 3).join(", ")}${excludedExperiences.length > 3 ? "..." : ""}`);
        }
    };

    const fitSkillsToCapacity = () => {
        const cap = zones.skills.capacity_units;
        const skillLineUnits = getUnitHeight("skill_line");

        const maxLines = Math.floor(cap / skillLineUnits);
        const { techniques, soft } = computeSkillLines(next);
        const combined = [...techniques, ...soft];

        if (combined.length <= maxLines) return;

        const trimmed = combined.slice(0, maxLines);
        next.competences = {
            techniques: trimmed.slice(0, Math.min(trimmed.length, techniques.length)),
            soft_skills: trimmed.slice(Math.min(trimmed.length, techniques.length)),
        };
        compressionLevelApplied++;
    };

    const fitFormationToCapacity = () => {
        const cap = zones.formation.capacity_units;
        const per = getUnitHeight("formation_standard");
        const maxItems = Math.floor(cap / per);
        if (Array.isArray(next.formations) && next.formations.length > maxItems) {
            next.formations = next.formations.slice(0, maxItems);
            compressionLevelApplied++;
        }
    };

    const fitCertificationsToCapacity = () => {
        const cap = zones.certifications.capacity_units;
        const per = getUnitHeight("certification");
        const maxItems = Math.floor(cap / per);
        if (Array.isArray(next.certifications) && next.certifications.length > maxItems) {
            next.certifications = next.certifications.slice(0, maxItems);
            compressionLevelApplied++;
        }
    };

    const fitLanguagesToCapacity = () => {
        const cap = zones.languages.capacity_units;
        const per = getUnitHeight("language");
        const maxItems = Math.floor(cap / per);
        if (Array.isArray(next.langues) && next.langues.length > maxItems) {
            next.langues = next.langues.slice(0, maxItems);
            compressionLevelApplied++;
        }
    };

    const dropClientsIfNeeded = () => {
        if (!next.clients_references) return;
        const cap = zones.clients.capacity_units;
        const per = getUnitHeight("skill_line");
        const maxItems = cap > 0 ? Math.floor(cap / per) : 0;
        if (maxItems <= 0) {
            delete (next as any).clients_references;
            compressionLevelApplied++;
            return;
        }
        const clients = next.clients_references.clients || [];
        if (clients.length > maxItems) {
            next.clients_references.clients = clients.slice(0, maxItems);
            compressionLevelApplied++;
        }
    };

    fitExperiencesToCapacity();
    // Enrich each experience with format and relevance metadata for templates
    next.experiences = sortedExperiences.map((exp, idx) => {
        const format = experienceFormats[idx] || "standard";
        const baseExp = applyExperienceFormat(exp, format, maxBullets);
        return {
            ...baseExp,
            _format: format,
            _relevance_score: (exp as any)._relevance_score || 0,
        };
    });

    fitSkillsToCapacity();
    fitFormationToCapacity();
    fitCertificationsToCapacity();
    fitLanguagesToCapacity();
    dropClientsIfNeeded();

    let computed = computeZoneUnits(next, experienceFormats);
    const allowed = theme.page_config.total_height_units - zones.margins.capacity_units;

    if (computed.totalUnitsUsed > allowed) {
        dense = true;
        compressionLevelApplied++;
        if (computed.zoneUnitsUsed.summary > 0) {
            shrinkSummaryIfNeeded();
            computed = computeZoneUnits(next, experienceFormats);
        }
    }

    if (computed.totalUnitsUsed > allowed) {
        warnings.push(`⚠️ Contenu dépasse la capacité (${computed.totalUnitsUsed}/${allowed} units) - Considérez un template plus compact`);
    }

    return {
        cvData: next,
        dense,
        totalUnitsUsed: computed.totalUnitsUsed,
        zoneUnitsUsed: computed.zoneUnitsUsed,
        warnings,
        compressionLevelApplied,
    };
}

/**
 * Wrapper pour compatibilité avec le code existant (notamment api/cv/preview/route.ts)
 * 
 * @param cvData Données du CV
 * @param jobOffer Offre d'emploi (optionnelle)
 * @param templateName Nom du template (themeId)
 * @param options Options supplémentaires (photo, etc)
 */
export function generateAdaptiveCV(
    cvData: any,
    jobOffer: any | null,
    templateName: string,
    options: { include_photo: boolean }
) {
    // Normaliser les données si nécessaire
    const normalizedData = cvData;

    // Convertir jobOffer au format attendu par adaptCVToThemeUnits si besoin
    // Ici on passe tel quel car le typage est assez lâche dans le wrapper

    const result = adaptCVToThemeUnits({
        cvData: normalizedData,
        templateName: templateName,
        includePhoto: options.include_photo,
        jobOffer: jobOffer
    });

    // Mapper le résultat vers le format attendu par la route preview
    // La route attend : { sections: { experiences: [...] }, total_units_used: number, pages: number }
    // On doit reconstruire cette structure à partir de CVAdaptationResult

    const experiences = result.cvData.experiences?.map((exp: any) => ({
        format: exp._format || "standard",
        relevance_score: exp._relevance_score || 0,
        content: {
            achievements: exp.realisations || []
        }
    })) || [];

    const pages = Math.ceil(result.totalUnitsUsed / 200); // 200 units par page standard

    // NOTE: Cast complet en 'any' pour éviter les erreurs de build liées au type AdaptedContent
    // qui est très strict et différent de ce que retourne adaptCVToThemeUnits.
    // Idéalement, il faudrait un mapper complet.
    return {
        theme_id: templateName as ThemeId,
        total_units_used: result.totalUnitsUsed,
        pages: pages,
        warnings: result.warnings,
        sections: {
            header: { units_used: result.zoneUnitsUsed.header || 0, content: {} },
            summary: { units_used: result.zoneUnitsUsed.summary || 0, content: {} },
            experiences: experiences,
            skills: [],
            formation: []
        }
    } as any;
}
