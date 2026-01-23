/**
 * RAG Grounding - Vérification que les données sont traçables dans le RAG source
 * 
 * Fonctions utilitaires pour vérifier le grounding des données générées par l'IA
 * contre le profil RAG source.
 */

/**
 * Vérifie si un texte contient des chiffres et si ces chiffres sont présents dans le RAG
 */
export function checkNumbersGrounding(candidate: string, ragSourceText: string): {
    isGrounded: boolean;
    numbers: string[];
    missingNumbers: string[];
} {
    const numbers = candidate.match(/\d[\d\s.,]*\d|\d/g) || [];
    const sourceLower = ragSourceText.toLowerCase();
    const missingNumbers: string[] = [];

    for (const n of numbers) {
        const token = n.replace(/\s+/g, "");
        if (!token) continue;
        if (!sourceLower.includes(token.toLowerCase())) {
            missingNumbers.push(token);
        }
    }

    return {
        isGrounded: missingNumbers.length === 0,
        numbers,
        missingNumbers,
    };
}

/**
 * Vérifie si une compétence est présente dans le RAG
 */
export function checkSkillGrounding(
    skill: string,
    ragProfile: any
): {
    isGrounded: boolean;
    foundIn: string[];
} {
    const normalizedSkill = skill
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ");

    const foundIn: string[] = [];
    const ragText = JSON.stringify(ragProfile).toLowerCase();

    // Vérifier dans skill_map
    if (ragProfile?.skill_map && typeof ragProfile.skill_map === "object") {
        Object.keys(ragProfile.skill_map).forEach((key) => {
            const normalizedKey = key
                .toLowerCase()
                .trim()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\w\s]/g, "")
                .replace(/\s+/g, " ");
            if (normalizedKey === normalizedSkill) {
                foundIn.push("skill_map");
            }
        });
    }

    // Vérifier dans competences
    const competences = ragProfile?.competences || {};
    const checkArray = (arr: unknown[], source: string) => {
        if (!Array.isArray(arr)) return;
        for (const item of arr) {
            const itemAny = item as any;
            const itemStr = typeof item === "string" ? item : String(itemAny?.nom || itemAny?.name || itemAny?.skill || "");
            const normalizedItem = itemStr
                .toLowerCase()
                .trim()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\w\s]/g, "")
                .replace(/\s+/g, " ");
            if (normalizedItem === normalizedSkill) {
                foundIn.push(source);
            }
        }
    };

    checkArray(competences.techniques || [], "competences.techniques");
    checkArray(competences.soft_skills || [], "competences.soft_skills");
    checkArray(competences.langages_programmation || [], "competences.langages_programmation");
    checkArray(competences.frameworks || [], "competences.frameworks");
    checkArray(competences.outils || [], "competences.outils");
    checkArray(competences.cloud_devops || [], "competences.cloud_devops");

    if (competences.explicit) {
        checkArray(competences.explicit.techniques || [], "competences.explicit.techniques");
        checkArray(competences.explicit.soft_skills || [], "competences.explicit.soft_skills");
    }

    // Vérifier dans expériences
    const experiences = Array.isArray(ragProfile?.experiences) ? ragProfile.experiences : [];
    experiences.forEach((exp: any, idx: number) => {
        checkArray(exp.technologies || [], `experiences[${idx}].technologies`);
        checkArray(exp.outils || [], `experiences[${idx}].outils`);
        checkArray(exp.methodologies || [], `experiences[${idx}].methodologies`);
    });

    return {
        isGrounded: foundIn.length > 0,
        foundIn,
    };
}

/**
 * Vérifie si une expérience référencée existe dans le RAG
 */
export function checkExperienceGrounding(
    experienceId: string,
    ragProfile: any
): {
    isGrounded: boolean;
    experienceIndex?: number;
} {
    const experiences = Array.isArray(ragProfile?.experiences) ? ragProfile.experiences : [];
    
    // Vérifier format exp_0, exp_1, etc.
    const numericMatch = experienceId.match(/^exp_(\d+)$/);
    if (numericMatch) {
        const index = parseInt(numericMatch[1], 10);
        if (index >= 0 && index < experiences.length) {
            return {
                isGrounded: true,
                experienceIndex: index,
            };
        }
    }

    // Vérifier par ID personnalisé
    for (let i = 0; i < experiences.length; i++) {
        if ((experiences[i] as any).id === experienceId) {
            return {
                isGrounded: true,
                experienceIndex: i,
            };
        }
    }

    return {
        isGrounded: false,
    };
}

/**
 * Génère un rapport de grounding complet pour un widget
 */
export function generateGroundingReport(
    widget: {
        text: string;
        section: string;
        type: string;
        sources?: {
            rag_experience_id?: string;
            rag_realisation_id?: string;
        };
    },
    ragProfile: any
): {
    overall: boolean;
    numbers: ReturnType<typeof checkNumbersGrounding>;
    skill?: ReturnType<typeof checkSkillGrounding>;
    experience?: ReturnType<typeof checkExperienceGrounding>;
} {
    const ragSourceText = JSON.stringify(ragProfile);
    const numbers = checkNumbersGrounding(widget.text, ragSourceText);

    let skill: ReturnType<typeof checkSkillGrounding> | undefined;
    if (widget.section === "skills" && widget.type === "skill_item") {
        skill = checkSkillGrounding(widget.text, ragProfile);
    }

    let experience: ReturnType<typeof checkExperienceGrounding> | undefined;
    if (widget.sources?.rag_experience_id) {
        experience = checkExperienceGrounding(widget.sources.rag_experience_id, ragProfile);
    }

    const overall = numbers.isGrounded && (!skill || skill.isGrounded) && (!experience || experience.isGrounded);

    return {
        overall,
        numbers,
        skill,
        experience,
    };
}
