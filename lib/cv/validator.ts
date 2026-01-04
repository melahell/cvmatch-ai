/**
 * CV Validation utilities to ensure content fits on one A4 page
 */

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

export function validateCVContent(cvData: any): CVValidationResult {
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
    if (stats.experiencesCount > 3) {
        errors.push(
            `Trop d'expériences: ${stats.experiencesCount} (max 3). Le CV risque de déborder.`
        );
    }

    if (stats.maxBulletsPerExperience > 4) {
        errors.push(
            `Trop de bullets dans une expérience: ${stats.maxBulletsPerExperience} (max 4).`
        );
    }

    if (stats.totalBullets > 12) {
        warnings.push(
            `Beaucoup de bullets au total: ${stats.totalBullets}. Idéalement max 12.`
        );
    }

    if (stats.technicalSkillsCount > 12) {
        warnings.push(
            `Trop de compétences techniques: ${stats.technicalSkillsCount} (max 12).`
        );
    }

    if (stats.softSkillsCount > 6) {
        warnings.push(
            `Trop de soft skills: ${stats.softSkillsCount} (max 6).`
        );
    }

    if (stats.formationsCount > 3) {
        warnings.push(
            `Beaucoup de formations: ${stats.formationsCount}. Idéalement max 2-3.`
        );
    }

    if (stats.elevatorPitchLength > 300) {
        warnings.push(
            `Elevator pitch trop long: ${stats.elevatorPitchLength} caractères (max 250).`
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
