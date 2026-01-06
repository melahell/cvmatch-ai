/**
 * Simple RAG Merge - Compatible with new types
 * Merges incoming RAG data with existing RAG data
 *
 * Uses semantic similarity instead of exact string matching to avoid duplicates.
 */

/**
 * Calculate Jaccard similarity between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const normalize = (s: string) => s.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2);

    const words1 = new Set(normalize(str1));
    const words2 = new Set(normalize(str2));

    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}

/**
 * Check if two strings are semantically similar (>80% Jaccard similarity)
 */
function areSimilar(str1: string, str2: string, threshold: number = 0.8): boolean {
    return calculateSimilarity(str1, str2) >= threshold;
}

/**
 * Check if two experiences are similar (same company + similar job title + overlapping dates)
 */
function areExperiencesSimilar(exp1: any, exp2: any): boolean {
    if (!exp1 || !exp2) return false;

    // Same company?
    const company1 = exp1.entreprise?.toLowerCase().trim();
    const company2 = exp2.entreprise?.toLowerCase().trim();
    if (company1 !== company2) return false;

    // Similar job title (>70% similarity)
    const titleSimilarity = calculateSimilarity(exp1.poste || '', exp2.poste || '');
    if (titleSimilarity < 0.7) return false;

    // Same or overlapping dates?
    const start1 = new Date(exp1.debut || "2000-01");
    const start2 = new Date(exp2.debut || "2000-01");
    const yearDiff = Math.abs(start1.getFullYear() - start2.getFullYear());

    return yearDiff <= 1; // Within 1 year = probably same experience
}

/**
 * Merge two experiences (combine realisations, technologies, clients)
 * Uses semantic similarity to avoid duplicating similar realisations
 */
function mergeExperiences(existing: any, incoming: any): any {
    // Deduplicate realisations using similarity
    const existingReals = existing.realisations || [];
    const incomingReals = incoming.realisations || [];

    const mergedRealisations = [...existingReals];

    for (const newReal of incomingReals) {
        const isDuplicate = existingReals.some((existReal: any) =>
            areSimilar(existReal.description || '', newReal.description || '', 0.85)
        );

        if (!isDuplicate) {
            mergedRealisations.push(newReal);
        }
    }

    // Deduplicate technologies using similarity
    const existingTechs = existing.technologies || [];
    const incomingTechs = incoming.technologies || [];
    const mergedTechnologies = [...existingTechs];

    for (const tech of incomingTechs) {
        const isDuplicate = existingTechs.some((existTech: string) =>
            areSimilar(existTech, tech, 0.9)
        );
        if (!isDuplicate) {
            mergedTechnologies.push(tech);
        }
    }

    return {
        ...existing,
        ...incoming,
        realisations: mergedRealisations,
        technologies: mergedTechnologies,
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
                techniques: (() => {
                    const existingTechs = existing.competences?.explicit?.techniques || [];
                    const incomingTechs = incoming.competences?.explicit?.techniques || [];
                    const result = [...existingTechs];

                    for (const tech of incomingTechs) {
                        const isDuplicate = existingTechs.some((existTech: string) =>
                            areSimilar(existTech, tech, 0.9)
                        );
                        if (!isDuplicate) {
                            result.push(tech);
                        }
                    }

                    return result;
                })(),
                soft_skills: (() => {
                    const existingSkills = existing.competences?.explicit?.soft_skills || [];
                    const incomingSkills = incoming.competences?.explicit?.soft_skills || [];
                    const result = [...existingSkills];

                    for (const skill of incomingSkills) {
                        const isDuplicate = existingSkills.some((existSkill: string) =>
                            areSimilar(existSkill, skill, 0.9)
                        );
                        if (!isDuplicate) {
                            result.push(skill);
                        }
                    }

                    return result;
                })()
            },
            inferred: {
                techniques: (() => {
                    const existingTechs = existing.competences?.inferred?.techniques || [];
                    const incomingTechs = incoming.competences?.inferred?.techniques || [];
                    const result = [...existingTechs];

                    for (const tech of incomingTechs) {
                        const isDuplicate = existingTechs.some((existTech: any) =>
                            areSimilar(existTech.name || '', tech.name || '', 0.9)
                        );
                        if (!isDuplicate) {
                            result.push(tech);
                        }
                    }

                    return result;
                })(),
                tools: (() => {
                    const existingTools = existing.competences?.inferred?.tools || [];
                    const incomingTools = incoming.competences?.inferred?.tools || [];
                    const result = [...existingTools];

                    for (const tool of incomingTools) {
                        const isDuplicate = existingTools.some((existTool: any) =>
                            areSimilar(existTool.name || '', tool.name || '', 0.9)
                        );
                        if (!isDuplicate) {
                            result.push(tool);
                        }
                    }

                    return result;
                })(),
                soft_skills: (() => {
                    const existingSkills = existing.competences?.inferred?.soft_skills || [];
                    const incomingSkills = incoming.competences?.inferred?.soft_skills || [];
                    const result = [...existingSkills];

                    for (const skill of incomingSkills) {
                        const isDuplicate = existingSkills.some((existSkill: any) =>
                            areSimilar(existSkill.name || '', skill.name || '', 0.9)
                        );
                        if (!isDuplicate) {
                            result.push(skill);
                        }
                    }

                    return result;
                })()
            }
        },

        // ===== FORMATIONS =====
        formations: (() => {
            const existingForms = existing.formations || [];
            const incomingForms = incoming.formations || [];
            const result = [...existingForms];

            for (const newForm of incomingForms) {
                const isDuplicate = result.some((f: any) => {
                    const diplomeSimilar = areSimilar(f.diplome || '', newForm.diplome || '', 0.9);
                    const ecoleSimilar = areSimilar(f.ecole || '', newForm.ecole || '', 0.8);
                    return diplomeSimilar && ecoleSimilar;
                });

                if (!isDuplicate) {
                    result.push(newForm);
                }
            }

            return result;
        })(),

        // ===== CERTIFICATIONS =====
        certifications: (() => {
            const existingCerts = existing.certifications || [];
            const incomingCerts = incoming.certifications || [];
            const result = [...existingCerts];

            for (const cert of incomingCerts) {
                const isDuplicate = existingCerts.some((existCert: string) =>
                    areSimilar(existCert, cert, 0.9)
                );
                if (!isDuplicate) {
                    result.push(cert);
                }
            }

            return result;
        })(),

        // ===== LANGUES =====
        langues: {
            ...(existing.langues || {}),
            ...(incoming.langues || {})
        },

        // ===== PROJETS =====
        projets: (() => {
            const existingProjs = existing.projets || [];
            const incomingProjs = incoming.projets || [];
            const result = [...existingProjs];

            for (const proj of incomingProjs) {
                const isDuplicate = existingProjs.some((existProj: any) =>
                    areSimilar(existProj.nom || '', proj.nom || '', 0.9)
                );
                if (!isDuplicate) {
                    result.push(proj);
                }
            }

            return result;
        })(),

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
