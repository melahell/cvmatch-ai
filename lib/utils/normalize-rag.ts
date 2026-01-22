// Helper pour normaliser les données RAG (flat vs nested structure)
export function normalizeRAGData(data: any): any {
    if (!data) return null;

    let normalized = data;

    const stableHash = (input: string): string => {
        let h = 5381;
        for (let i = 0; i < input.length; i++) {
            h = ((h << 5) + h) ^ input.charCodeAt(i);
        }
        return (h >>> 0).toString(36);
    };

    const stableKey = (value: unknown) =>
        String(value ?? "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ")
            .replace(/[^\p{L}\p{N}\s\-_.]/gu, "");

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
        const withIds = normalized.experiences.map((exp: any, idx: number) => {
            const poste = stableKey(exp?.poste);
            const entreprise = stableKey(exp?.entreprise);
            const debut = stableKey(exp?.debut);
            const fin = stableKey(exp?.fin ?? (exp?.actuel ? "present" : ""));
            const base = `${poste}|${entreprise}|${debut}|${fin}`;
            const expId = exp?.id || `exp_${stableHash(base)}`;

            const realisations = Array.isArray(exp?.realisations)
                ? exp.realisations.map((r: any, rIdx: number) => {
                    const desc = stableKey(r?.description);
                    const impact = stableKey(r?.impact);
                    const realBase = `${expId}|${desc}|${impact}|${rIdx}`;
                    return {
                        ...r,
                        id: r?.id || `real_${stableHash(realBase)}`,
                    };
                })
                : [];

            return {
                ...exp,
                id: expId,
                realisations,
            };
        });

        const mergedByKey = new Map<string, any>();
        for (const exp of withIds) {
            const poste = stableKey(exp?.poste);
            const entreprise = stableKey(exp?.entreprise);
            const debut = stableKey(exp?.debut);
            const fin = stableKey(exp?.fin ?? (exp?.actuel ? "present" : ""));
            const key = `${poste}|${entreprise}|${debut}|${fin}`;

            const existing = mergedByKey.get(key);
            if (!existing) {
                mergedByKey.set(key, exp);
                continue;
            }

            const existingReals = Array.isArray(existing.realisations) ? existing.realisations : [];
            const incomingReals = Array.isArray(exp.realisations) ? exp.realisations : [];
            const realKeySet = new Set(existingReals.map((r: any) => stableKey(r?.description)));
            const mergedReals = [
                ...existingReals,
                ...incomingReals.filter((r: any) => {
                    const k = stableKey(r?.description);
                    if (!k) return false;
                    if (realKeySet.has(k)) return false;
                    realKeySet.add(k);
                    return true;
                }),
            ];

            mergedByKey.set(key, {
                ...existing,
                ...exp,
                entreprise: (String(existing.entreprise || "").length >= String(exp.entreprise || "").length)
                    ? existing.entreprise
                    : exp.entreprise,
                poste: (String(existing.poste || "").length >= String(exp.poste || "").length)
                    ? existing.poste
                    : exp.poste,
                technologies: [...new Set([...(existing.technologies || []), ...(exp.technologies || [])])],
                clients_references: [...new Set([...(existing.clients_references || []), ...(exp.clients_references || [])])],
                realisations: mergedReals,
            });
        }

        normalized.experiences = Array.from(mergedByKey.values());
    }

    return normalized;
}
