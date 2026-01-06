/**
 * Simple RAG Merge - Compatible with new types
 * Merges incoming RAG data with existing RAG data
 */

/**
 * Check if two experiences are similar (same company + overlapping dates)
 */
function areExperiencesSimilar(exp1: any, exp2: any): boolean {
    if (!exp1 || !exp2) return false;

    // Same company?
    const company1 = exp1.entreprise?.toLowerCase().trim();
    const company2 = exp2.entreprise?.toLowerCase().trim();
    if (company1 !== company2) return false;

    // Same or overlapping dates?
    const start1 = new Date(exp1.debut || "2000-01");
    const start2 = new Date(exp2.debut || "2000-01");
    const yearDiff = Math.abs(start1.getFullYear() - start2.getFullYear());

    return yearDiff <= 1; // Within 1 year = probably same experience
}

/**
 * Merge two experiences (combine realisations, technologies, clients)
 */
function mergeExperiences(existing: any, incoming: any): any {
    return {
        ...existing,
        ...incoming,
        // Merge realisations (keep unique descriptions)
        realisations: [
            ...(existing.realisations || []),
            ...(incoming.realisations || []).filter((newReal: any) =>
                !(existing.realisations || []).some((existReal: any) =>
                    existReal.description?.toLowerCase() === newReal.description?.toLowerCase()
                )
            )
        ],
        // Merge technologies
        technologies: [...new Set([
            ...(existing.technologies || []),
            ...(incoming.technologies || [])
        ])],
        // Merge clients
        clients_references: [...new Set([
            ...(existing.clients_references || []),
            ...(incoming.clients_references || [])
        ])]
    };
}

/**
 * Merge RAG data intelligently
 */
export function mergeRAGDataSimple(existing: any, incoming: any): any {
    if (!existing || Object.keys(existing).length === 0) {
        return incoming;
    }

    if (!incoming || Object.keys(incoming).length === 0) {
        return existing;
    }

    const merged: any = {
        // ===== PROFIL =====
        profil: {
            nom: incoming.profil?.nom || existing.profil?.nom,
            prenom: incoming.profil?.prenom || existing.profil?.prenom,
            titre_principal: incoming.profil?.titre_principal || existing.profil?.titre_principal,
            localisation: incoming.profil?.localisation || existing.profil?.localisation,
            // Keep the longer elevator pitch
            elevator_pitch: (incoming.profil?.elevator_pitch?.length || 0) > (existing.profil?.elevator_pitch?.length || 0)
                ? incoming.profil?.elevator_pitch
                : existing.profil?.elevator_pitch,
            contact: {
                ...(existing.profil?.contact || {}),
                ...(incoming.profil?.contact || {})
            },
            photo_url: incoming.profil?.photo_url || existing.profil?.photo_url
        },

        // ===== EXPERIENCES =====
        experiences: (() => {
            const existingExps = existing.experiences || [];
            const incomingExps = incoming.experiences || [];
            const result = [...existingExps];

            for (const newExp of incomingExps) {
                const similarIdx = result.findIndex(e => areExperiencesSimilar(e, newExp));

                if (similarIdx !== -1) {
                    // Merge with existing similar experience
                    result[similarIdx] = mergeExperiences(result[similarIdx], newExp);
                } else {
                    // Add as new experience
                    result.push(newExp);
                }
            }

            return result;
        })(),

        // ===== COMPETENCES =====
        competences: {
            explicit: {
                techniques: [...new Set([
                    ...(existing.competences?.explicit?.techniques || []),
                    ...(incoming.competences?.explicit?.techniques || [])
                ])],
                soft_skills: [...new Set([
                    ...(existing.competences?.explicit?.soft_skills || []),
                    ...(incoming.competences?.explicit?.soft_skills || [])
                ])]
            },
            inferred: {
                techniques: [
                    ...(existing.competences?.inferred?.techniques || []),
                    ...(incoming.competences?.inferred?.techniques || []).filter((newSkill: any) =>
                        !(existing.competences?.inferred?.techniques || []).some((existSkill: any) =>
                            existSkill.name?.toLowerCase() === newSkill.name?.toLowerCase()
                        )
                    )
                ],
                tools: [
                    ...(existing.competences?.inferred?.tools || []),
                    ...(incoming.competences?.inferred?.tools || []).filter((newSkill: any) =>
                        !(existing.competences?.inferred?.tools || []).some((existSkill: any) =>
                            existSkill.name?.toLowerCase() === newSkill.name?.toLowerCase()
                        )
                    )
                ],
                soft_skills: [
                    ...(existing.competences?.inferred?.soft_skills || []),
                    ...(incoming.competences?.inferred?.soft_skills || []).filter((newSkill: any) =>
                        !(existing.competences?.inferred?.soft_skills || []).some((existSkill: any) =>
                            existSkill.name?.toLowerCase() === newSkill.name?.toLowerCase()
                        )
                    )
                ]
            }
        },

        // ===== FORMATIONS =====
        formations: (() => {
            const existingForms = existing.formations || [];
            const incomingForms = incoming.formations || [];
            const result = [...existingForms];

            for (const newForm of incomingForms) {
                const exists = result.some(f =>
                    f.diplome?.toLowerCase() === newForm.diplome?.toLowerCase() &&
                    f.ecole?.toLowerCase() === newForm.ecole?.toLowerCase()
                );
                if (!exists) {
                    result.push(newForm);
                }
            }

            return result;
        })(),

        // ===== CERTIFICATIONS =====
        certifications: [...new Set([
            ...(existing.certifications || []),
            ...(incoming.certifications || [])
        ])],

        // ===== LANGUES =====
        langues: {
            ...(existing.langues || {}),
            ...(incoming.langues || {})
        },

        // ===== PROJETS =====
        projets: [
            ...(existing.projets || []),
            ...(incoming.projets || []).filter((newProj: any) =>
                !(existing.projets || []).some((existProj: any) =>
                    existProj.nom?.toLowerCase() === newProj.nom?.toLowerCase()
                )
            )
        ],

        // ===== REFERENCES (CLIENTS) =====
        references: {
            clients: (() => {
                const existingClients = existing.references?.clients || [];
                const incomingClients = incoming.references?.clients || [];
                const clientsMap = new Map();

                // Add existing
                for (const client of existingClients) {
                    const key = (typeof client === 'string' ? client : client.nom).toLowerCase();
                    clientsMap.set(key, client);
                }

                // Add incoming (merge sources if duplicate)
                for (const client of incomingClients) {
                    const nom = typeof client === 'string' ? client : client.nom;
                    const key = nom.toLowerCase();

                    if (clientsMap.has(key)) {
                        const existing = clientsMap.get(key);
                        if (typeof existing === 'object' && typeof client === 'object') {
                            clientsMap.set(key, {
                                ...existing,
                                sources: [...new Set([
                                    ...(existing.sources || []),
                                    ...(client.sources || [])
                                ])]
                            });
                        }
                    } else {
                        clientsMap.set(key, client);
                    }
                }

                return Array.from(clientsMap.values());
            })()
        },

        // Keep rejected_inferred list
        rejected_inferred: [...new Set([
            ...(existing.rejected_inferred || []),
            ...(incoming.rejected_inferred || [])
        ])]
    };

    return merged;
}

/**
 * Result with stats
 */
export interface MergeResult {
    merged: any;
    stats: {
        itemsAdded: number;
        itemsUpdated: number;
        itemsKept: number;
    };
    conflicts: any[];
}

/**
 * Merge with stats
 */
export function mergeRAGData(existing: any, incoming: any): MergeResult {
    const merged = mergeRAGDataSimple(existing, incoming);

    // Calculate stats
    const stats = {
        itemsAdded: (merged.experiences?.length || 0) - (existing.experiences?.length || 0),
        itemsUpdated: 0, // TODO: track updates
        itemsKept: existing.experiences?.length || 0
    };

    return {
        merged,
        stats,
        conflicts: [] // No conflicts in simple merge
    };
}
