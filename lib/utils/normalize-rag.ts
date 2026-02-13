// [CDC-22] Helper pour extraire les dates de façon uniforme
// Supporte: date_debut/date_fin, debut/fin, start_date/end_date
import { coerceBoolean } from "@/lib/utils/coerce-boolean";

export function getExperienceDates(exp: any): { start: string | null; end: string | null; isCurrent: boolean } {
    const start = exp?.date_debut ?? exp?.debut ?? exp?.start_date ?? exp?.startDate ?? exp?.dateDebut ?? null;
    const end = exp?.date_fin ?? exp?.fin ?? exp?.end_date ?? exp?.endDate ?? exp?.dateFin ?? null;
    // IMPORTANT: ne pas utiliser Boolean() directement (ex: "false" -> true)
    const isCurrent = coerceBoolean(exp?.actuel ?? exp?.current ?? exp?.is_current) === true;
    return { start, end, isCurrent };
}

// [CDC-22] Configuration des poids de scoring centralisée
export const SCORING_WEIGHTS = {
    relevance: 0.35,    // Pertinence par rapport à l'offre
    recency: 0.25,      // Récence de l'expérience
    impact: 0.20,       // Impact quantifié
    seniority: 0.10,    // Alignement niveau/séniorité
    ats: 0.10,          // Compatibilité ATS (mots-clés)
} as const;

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
            projets: data.projets || [],
            certifications: data.certifications || [],
            references: data.references || {},
            contexte_enrichi: data.contexte_enrichi
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
        const getStart = (exp: any) =>
            exp?.date_debut ?? exp?.debut ?? exp?.start_date ?? exp?.startDate ?? exp?.dateDebut ?? exp?.date_start ?? "";
        const getEnd = (exp: any) =>
            exp?.date_fin ?? exp?.fin ?? exp?.end_date ?? exp?.endDate ?? exp?.dateFin ?? exp?.date_end ?? "";

        const withIds = normalized.experiences.map((exp: any, idx: number) => {
            const poste = stableKey(exp?.poste);
            const entreprise = stableKey(exp?.entreprise);
            const debut = stableKey(getStart(exp));
            const isCurrent = coerceBoolean(exp?.actuel ?? exp?.current ?? exp?.is_current) === true;
            const fin = stableKey(getEnd(exp) ?? (isCurrent ? "present" : ""));
            const base = `${poste}|${entreprise}|${debut}|${fin}`;
            const expId = exp?.id || `exp_${stableHash(base)}`;

            const realisations = Array.isArray(exp?.realisations)
                ? exp.realisations.map((r: any, rIdx: number) => {
                    const desc = stableKey(typeof r === "string" ? r : r?.description);
                    const impact = stableKey(typeof r === "string" ? "" : r?.impact);
                    const realBase = `${expId}|${desc}|${impact}|${rIdx}`;
                    if (typeof r === "string") {
                        return {
                            id: `real_${stableHash(realBase)}`,
                            description: r,
                        };
                    }
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
            const debut = stableKey(getStart(exp));
            const isCurrent = coerceBoolean(exp?.actuel ?? exp?.current ?? exp?.is_current) === true;
            const fin = stableKey(getEnd(exp) ?? (isCurrent ? "present" : ""));
            const baseKey = `${poste}|${entreprise}|${debut}|${fin}`;
            const hasTime = Boolean(debut) || Boolean(fin);
            const realSig = Array.isArray(exp?.realisations)
                ? exp.realisations
                      .map((r: any) => stableKey(typeof r === "string" ? r : r?.description))
                      .filter(Boolean)
                      .sort()
                      .join("|")
                : "";
            const key = hasTime ? baseKey : `${poste}|${entreprise}|no_dates|${stableHash(realSig)}`;

            const existing = mergedByKey.get(key);
            if (!existing) {
                mergedByKey.set(key, exp);
                continue;
            }

            const existingReals = Array.isArray(existing.realisations) ? existing.realisations : [];
            const incomingReals = Array.isArray(exp.realisations) ? exp.realisations : [];
            const realKeySet = new Set(existingReals.map((r: any) => stableKey(typeof r === "string" ? r : r?.description)));
            const mergedReals = [
                ...existingReals,
                ...incomingReals.filter((r: any) => {
                    const k = stableKey(typeof r === "string" ? r : r?.description);
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
