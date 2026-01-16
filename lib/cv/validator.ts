/**
 * CV Validation utilities to ensure content fits on one A4 page
 */

import { adaptCVToThemeUnits } from "./adaptive-algorithm";

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
    maxElevatorPitchChars: number;
}

const DEFAULT_LIMITS: CVContentLimits = {
    maxExperiences: 3,
    maxBulletsPerExperience: 4,
    maxTotalBullets: 12,
    maxTechnicalSkills: 12,
    maxSoftSkills: 6,
    maxFormations: 2,
    maxElevatorPitchChars: 250,
};

function getLimitsForTemplate(templateName: string, includePhoto: boolean): CVContentLimits {
    const template = (templateName || "").toLowerCase();

    if (template === "classic") {
        return {
            maxExperiences: includePhoto ? 3 : 4,
            maxBulletsPerExperience: 4,
            maxTotalBullets: 14,
            maxTechnicalSkills: 14,
            maxSoftSkills: 8,
            maxFormations: 3,
            maxElevatorPitchChars: 280,
        };
    }

    if (template === "creative") {
        return {
            maxExperiences: 3,
            maxBulletsPerExperience: 3,
            maxTotalBullets: 10,
            maxTechnicalSkills: 12,
            maxSoftSkills: 7,
            maxFormations: 2,
            maxElevatorPitchChars: 240,
        };
    }

    if (template === "tech") {
        return {
            maxExperiences: 3,
            maxBulletsPerExperience: 3,
            maxTotalBullets: 10,
            maxTechnicalSkills: 14,
            maxSoftSkills: 6,
            maxFormations: 2,
            maxElevatorPitchChars: 220,
        };
    }

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
        compressed.experiences = compressed.experiences.map((exp: any) => ({
            ...exp,
            realisations: (exp.realisations || []).slice(0, 4),
        }));
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

    if (next.competences?.techniques?.length > limits.maxTechnicalSkills) {
        next.competences.techniques = next.competences.techniques.slice(0, limits.maxTechnicalSkills);
    }
    if (next.competences?.soft_skills?.length > limits.maxSoftSkills) {
        next.competences.soft_skills = next.competences.soft_skills.slice(0, limits.maxSoftSkills);
    }

    if (Array.isArray(next.formations) && next.formations.length > limits.maxFormations) {
        next.formations = next.formations.slice(0, limits.maxFormations);
    }

    if (typeof next.profil?.elevator_pitch === "string" && next.profil.elevator_pitch.length > limits.maxElevatorPitchChars) {
        next.profil.elevator_pitch = next.profil.elevator_pitch.substring(0, Math.max(0, limits.maxElevatorPitchChars - 3)) + "...";
    }

    return next;
}

export function fitCVToTemplate(params: {
    cvData: any;
    templateName: string;
    includePhoto: boolean;
    jobOffer?: any;
}) {
    const baseLimits = getLimitsForTemplate(params.templateName, params.includePhoto);
    const adapted = adaptCVToThemeUnits({
        cvData: params.cvData,
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
