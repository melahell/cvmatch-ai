/**
 * CV Validation utilities to ensure content fits on one A4 page
 */

import { adaptCVToThemeUnits } from "./adaptive-algorithm";
import { JobOfferContext, sortExperiencesByRelevance } from "./relevance-scoring";

export interface CVValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    stats: {
        experiencesCount: number;
        maxBulletsPerExperience: number;
        totalBullets: number;
        technicalSkillsCount: number;
        softSkillsCount: number;
        formationsCount: number;
        elevatorPitchLength: number;
    };
}

export interface CVContentLimits {
    maxExperiences: number;
    maxBulletsPerExperience: number;
    maxTotalBullets: number;
    maxTechnicalSkills: number;
    maxSoftSkills: number;
    maxFormations: number;
    maxLanguages: number;
    maxCertifications: number;
    maxClients: number;
    maxClientSectors: number;
    maxElevatorPitchChars: number;
}

const DEFAULT_LIMITS: CVContentLimits = {
    maxExperiences: 99,           // Pas de limite - utilisateur contrôle via UI
    maxBulletsPerExperience: 99,  // Pas de limite
    maxTotalBullets: 999,         // Pas de limite
    maxTechnicalSkills: 99,       // Pas de limite
    maxSoftSkills: 99,            // Pas de limite
    maxFormations: 99,            // Pas de limite
    maxLanguages: 99,             // Pas de limite
    maxCertifications: 99,        // Pas de limite
    maxClients: 99,               // Pas de limite
    maxClientSectors: 99,         // Pas de limite
    maxElevatorPitchChars: 9999,  // Pas de limite
};

function getLimitsForTemplate(templateName: string, includePhoto: boolean): CVContentLimits {
    // Plus de limites par template - l'utilisateur contrôle via l'UI
    // Tous les templates retournent les mêmes limites permissives
    return DEFAULT_LIMITS;
}

export function validateCVContent(cvData: any, limits: CVContentLimits = DEFAULT_LIMITS): CVValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Extract data
    const experiences = cvData.experiences || [];
    const competences = cvData.competences || {};
    const formations = cvData.formations || [];
    const elevatorPitch = cvData.profil?.elevator_pitch || "";

    // Count stats
    const stats = {
        experiencesCount: experiences.length,
        maxBulletsPerExperience: Math.max(
            ...experiences.map((exp: any) => (exp.realisations || []).length),
            0
        ),
        totalBullets: experiences.reduce(
            (sum: number, exp: any) => sum + (exp.realisations || []).length,
            0
        ),
        technicalSkillsCount: (competences.techniques || []).length,
        softSkillsCount: (competences.soft_skills || []).length,
        formationsCount: formations.length,
        elevatorPitchLength: elevatorPitch.length,
    };

    // Validate constraints
    if (stats.experiencesCount > limits.maxExperiences) {
        errors.push(
            `Trop d'expériences: ${stats.experiencesCount} (max ${limits.maxExperiences}). Le CV risque de déborder.`
        );
    }

    if (stats.maxBulletsPerExperience > limits.maxBulletsPerExperience) {
        errors.push(
            `Trop de bullets dans une expérience: ${stats.maxBulletsPerExperience} (max ${limits.maxBulletsPerExperience}).`
        );
    }

    if (stats.totalBullets > limits.maxTotalBullets) {
        warnings.push(
            `Beaucoup de bullets au total: ${stats.totalBullets}. Idéalement max ${limits.maxTotalBullets}.`
        );
    }

    if (stats.technicalSkillsCount > limits.maxTechnicalSkills) {
        warnings.push(
            `Trop de compétences techniques: ${stats.technicalSkillsCount} (max ${limits.maxTechnicalSkills}).`
        );
    }

    if (stats.softSkillsCount > limits.maxSoftSkills) {
        warnings.push(
            `Trop de soft skills: ${stats.softSkillsCount} (max ${limits.maxSoftSkills}).`
        );
    }

    if (stats.formationsCount > limits.maxFormations + 1) {
        warnings.push(
            `Beaucoup de formations: ${stats.formationsCount}. Idéalement max 2-3.`
        );
    }

    if (stats.elevatorPitchLength > limits.maxElevatorPitchChars + 50) {
        warnings.push(
            `Elevator pitch trop long: ${stats.elevatorPitchLength} caractères (max ${limits.maxElevatorPitchChars}).`
        );
    }

    // Check individual bullet lengths
    experiences.forEach((exp: any, i: number) => {
        (exp.realisations || []).forEach((real: any, j: number) => {
            const description = typeof real === "string" ? real : real.description;
            if (description && description.length > 100) {
                warnings.push(
                    `Expérience ${i + 1}, bullet ${j + 1}: ${description.length} caractères (max 80-100).`
                );
            }
        });
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        stats,
    };
}

/**
 * Auto-compress CV content to fit on one page
 */
export function autoCompressCV(cvData: any): any {
    const compressed = JSON.parse(JSON.stringify(cvData)); // Deep clone

    // 1. Limit experiences to 3
    if (compressed.experiences && compressed.experiences.length > 3) {
        compressed.experiences = compressed.experiences.slice(0, 3);
    }

    // 2. Limit bullets per experience to 4
    if (compressed.experiences) {
        compressed.experiences = compressed.experiences.map((exp: any, i: number) => {
            const beforeCount = (exp.realisations || []).length;
            const afterCount = (exp.realisations || []).slice(0, 4).length;
            // Phase 2 Diagnostic: Log auto-compress
            if (beforeCount > 4) {
                console.log(`[autoCompressCV] Exp ${i}: ${beforeCount} -> ${afterCount} realisations (limited to 4)`);
            }
            return {
                ...exp,
                realisations: (exp.realisations || []).slice(0, 4),
            };
        });
    }

    // 3. Limit technical skills to 12
    if (compressed.competences?.techniques?.length > 12) {
        compressed.competences.techniques = compressed.competences.techniques.slice(0, 12);
    }

    // 4. Limit soft skills to 6
    if (compressed.competences?.soft_skills?.length > 6) {
        compressed.competences.soft_skills = compressed.competences.soft_skills.slice(0, 6);
    }

    // 5. Limit formations to 2
    if (compressed.formations && compressed.formations.length > 2) {
        compressed.formations = compressed.formations.slice(0, 2);
    }

    // 6. Truncate elevator pitch if too long
    if (compressed.profil?.elevator_pitch?.length > 250) {
        compressed.profil.elevator_pitch =
            compressed.profil.elevator_pitch.substring(0, 247) + "...";
    }

    return compressed;
}

function sliceToLimits(cvData: any, limits: CVContentLimits) {
    const next = JSON.parse(JSON.stringify(cvData));

    const experiences = Array.isArray(next.experiences) ? next.experiences : [];
    next.experiences = experiences
        .filter((e: any) => e?.display !== false)
        .slice(0, limits.maxExperiences)
        .map((exp: any) => ({
            ...exp,
            realisations: (Array.isArray(exp.realisations) ? exp.realisations : [])
                .filter((r: any) => (typeof r === "object" && r !== null ? r.display !== false : true))
                .slice(0, limits.maxBulletsPerExperience),
        }));

    let remainingBullets = Math.max(0, limits.maxTotalBullets);
    if (Array.isArray(next.experiences)) {
        next.experiences = next.experiences.map((exp: any) => {
            const reals = Array.isArray(exp.realisations) ? exp.realisations : [];
            const kept = reals.slice(0, remainingBullets);
            remainingBullets = Math.max(0, remainingBullets - kept.length);
            return { ...exp, realisations: kept };
        });
    }

    if (next.competences?.techniques?.length > limits.maxTechnicalSkills) {
        next.competences.techniques = next.competences.techniques.slice(0, limits.maxTechnicalSkills);
    }
    if (next.competences?.soft_skills?.length > limits.maxSoftSkills) {
        next.competences.soft_skills = next.competences.soft_skills.slice(0, limits.maxSoftSkills);
    }

    if (Array.isArray(next.formations) && next.formations.length > limits.maxFormations) {
        next.formations = next.formations.slice(0, limits.maxFormations);
    }

    if (Array.isArray(next.langues) && next.langues.length > limits.maxLanguages) {
        next.langues = next.langues.slice(0, limits.maxLanguages);
    }

    if (Array.isArray(next.certifications) && next.certifications.length > limits.maxCertifications) {
        next.certifications = next.certifications.slice(0, limits.maxCertifications);
    }

    const clients = next.clients_references;
    if (clients && typeof clients === "object") {
        if (Array.isArray(clients.secteurs) && clients.secteurs.length > limits.maxClientSectors) {
            clients.secteurs = clients.secteurs.slice(0, limits.maxClientSectors);
        }
        if (Array.isArray(clients.clients) && clients.clients.length > limits.maxClients) {
            clients.clients = clients.clients.slice(0, limits.maxClients);
        }
        if (Array.isArray(clients.secteurs)) {
            const trimmed: any[] = [];
            let total = 0;
            for (const sector of clients.secteurs) {
                const sectorClients = Array.isArray(sector.clients) ? sector.clients : [];
                if (total >= limits.maxClients) break;
                const allowed = sectorClients.slice(0, Math.max(0, limits.maxClients - total));
                total += allowed.length;
                trimmed.push({ ...sector, clients: allowed });
            }
            clients.secteurs = trimmed;
        }
        next.clients_references = clients;
    }

    if (typeof next.profil?.elevator_pitch === "string" && next.profil.elevator_pitch.length > limits.maxElevatorPitchChars) {
        next.profil.elevator_pitch = next.profil.elevator_pitch.substring(0, Math.max(0, limits.maxElevatorPitchChars - 3)) + "...";
    }

    return next;
}

const normalizeKey = (value: unknown) =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .replace(/[^\p{L}\p{N}\s\-_.]/gu, "");

const parseStartYear = (exp: any) => {
    const raw = exp?.date_debut || exp?.debut || exp?.start_date || exp?.startDate || "";
    const m = String(raw).match(/(19|20)\d{2}/);
    return m ? Number(m[0]) : 0;
};

const isPMFamilyJob = (jobOffer: JobOfferContext | null) => {
    const title = normalizeKey(jobOffer?.title || "");
    return title.includes("chef de projet") || title.includes("project manager") || title.includes("pmo") || title.includes("program manager");
};

const isDevSideProjectLike = (exp: any) => {
    const poste = normalizeKey(exp?.poste);
    const entreprise = normalizeKey(exp?.entreprise);
    const flags = ["fondateur", "developpeur", "developer", "backend", "architecte", "automation", "ia", "ml", "time project", "side project"];
    const inPoste = flags.some((f) => poste.includes(f));
    const inEntreprise = flags.some((f) => entreprise.includes(f));
    const isCurrent = !exp?.date_fin && !exp?.fin && exp?.actuel;
    return inPoste || inEntreprise || isCurrent;
};

function selectExperiencesForTemplate(cvData: any, limits: CVContentLimits, jobOffer: JobOfferContext | null) {
    const next = JSON.parse(JSON.stringify(cvData));
    const experiences = Array.isArray(next.experiences) ? next.experiences : [];
    const visible = experiences.filter((e: any) => e?.display !== false);

    const sorted = jobOffer
        ? (sortExperiencesByRelevance(visible as any, jobOffer) as any[])
        : [...visible].sort((a, b) => parseStartYear(b) - parseStartYear(a));

    const deduped: any[] = [];
    const seen = new Set<string>();
    for (const exp of sorted) {
        const key = [
            normalizeKey(exp?.poste),
            normalizeKey(exp?.entreprise),
            normalizeKey(exp?.date_debut ?? exp?.debut),
            normalizeKey(exp?.date_fin ?? exp?.fin ?? (exp?.actuel ? "present" : "")),
        ].join("|");
        if (!key || key === "|||") continue;
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(exp);
    }

    const max = Math.max(1, limits.maxExperiences);
    if (!isPMFamilyJob(jobOffer)) {
        next.experiences = deduped.slice(0, max);
        return next;
    }

    const kept: any[] = [];
    const lowPriority: any[] = [];
    for (const exp of deduped) {
        if (isDevSideProjectLike(exp)) lowPriority.push(exp);
        else kept.push(exp);
    }
    const primary = kept.slice(0, max);
    if (primary.length > 0) {
        next.experiences = primary;
        return next;
    }

    next.experiences = lowPriority.slice(0, max);
    return next;
}

export function fitCVToTemplate(params: {
    cvData: any;
    templateName: string;
    includePhoto: boolean;
    jobOffer?: any;
}) {
    const baseLimits = getLimitsForTemplate(params.templateName, params.includePhoto);
    const preselected = selectExperiencesForTemplate(params.cvData, baseLimits, (params.jobOffer || null) as JobOfferContext | null);
    const prelimited = sliceToLimits(preselected, baseLimits);
    const adapted = adaptCVToThemeUnits({
        cvData: prelimited,
        templateName: params.templateName,
        includePhoto: params.includePhoto,
        jobOffer: params.jobOffer || null,
    });
    const validation = validateCVContent(adapted.cvData, baseLimits);
    return {
        cvData: adapted.cvData,
        compressionLevelApplied: adapted.compressionLevelApplied,
        validation,
        dense: adapted.dense,
        unitStats: {
            totalUnitsUsed: adapted.totalUnitsUsed,
            zoneUnitsUsed: adapted.zoneUnitsUsed,
            warnings: adapted.warnings,
        },
    };
}
