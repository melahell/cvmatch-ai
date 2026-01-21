// Helper pour normaliser les données RAG (flat vs nested structure)
export function normalizeRAGData(data: any): any {
    if (!data) return null;

    let normalized = data;

    // Si structure flat (nom, prenom, etc. à la racine), convertit en nested
    if (data.nom || data.prenom) {
        normalized = {
            profil: {
                nom: data.nom,
                prenom: data.prenom,
                titre_principal: data.titre_principal,
                localisation: data.localisation,
                elevator_pitch: data.elevator_pitch,
                photo_url: data.photo_url,
                contact: data.contact
            },
            experiences: data.experiences || [],
            competences: data.competences || { techniques: [], soft_skills: [] },
            formations: data.formations || [],
            langues: data.langues || {},
            projets: data.projets || []
        };
    }

    // Ensure competences structure matches types
    if (normalized.competences) {
        if (!normalized.competences.explicit) {
            normalized.competences.explicit = { techniques: [], soft_skills: [] };
        }

        // Handle flat 'techniques' if present
        if (normalized.competences.techniques && Array.isArray(normalized.competences.techniques)) {
            normalized.competences.explicit.techniques = [
                ...(normalized.competences.explicit.techniques || []),
                ...normalized.competences.techniques
            ];
            delete normalized.competences.techniques;
        }

        // Convert string[] techniques to SkillExplicit[]
        if (Array.isArray(normalized.competences.explicit.techniques) && 
            normalized.competences.explicit.techniques.length > 0 && 
            typeof normalized.competences.explicit.techniques[0] === 'string') {
            normalized.competences.explicit.techniques = normalized.competences.explicit.techniques.map((t: string) => ({
                nom: t
            }));
        }
    }

    // Ensure IDs on experiences
    if (normalized.experiences && Array.isArray(normalized.experiences)) {
        normalized.experiences = normalized.experiences.map((exp: any, idx: number) => ({
            ...exp,
            id: exp.id || `exp_${Date.now()}_${idx}`,
            realisations: Array.isArray(exp.realisations) ? exp.realisations.map((r: any, rIdx: number) => ({
                ...r,
                id: r.id || `real_${Date.now()}_${idx}_${rIdx}`
            })) : []
        }));
    }

    return normalized;
}
