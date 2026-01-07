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
 * Deduplicate an array of realisations using semantic similarity
 * This removes duplicates WITHIN a single array (not between two arrays)
 */
function deduplicateRealisations(realisations: any[]): any[] {
    if (!realisations || realisations.length === 0) return [];

    const result: any[] = [];

    for (const real of realisations) {
        const isDuplicate = result.some(r =>
            areSimilar(r.description || '', real.description || '', 0.85)
        );

        if (!isDuplicate) {
            result.push(real);
        }
    }

    return result;
}

/**
 * Deduplicate an array of strings using semantic similarity
 * This removes duplicates WITHIN a single array (not between two arrays)
 */
function deduplicateStrings(items: string[], threshold: number = 0.9): string[] {
    if (!items || items.length === 0) return [];

    const result: string[] = [];

    for (const item of items) {
        const isDuplicate = result.some(existing =>
            areSimilar(existing, item, threshold)
        );

        if (!isDuplicate) {
            result.push(item);
        }
    }

    return result;
}

/**
 * Deduplicate an array of objects with 'name' property using semantic similarity
 * This removes duplicates WITHIN a single array (not between two arrays)
 */
function deduplicateNamedObjects(items: any[], threshold: number = 0.9): any[] {
    if (!items || items.length === 0) return [];

    const result: any[] = [];

    for (const item of items) {
        const isDuplicate = result.some(existing =>
            areSimilar(existing.name || '', item.name || '', threshold)
        );

        if (!isDuplicate) {
            result.push(item);
        }
    }

    return result;
}

/**
 * Deduplicate formations (diplome + ecole matching)
 */
function deduplicateFormations(formations: any[]): any[] {
    if (!formations || formations.length === 0) return [];

    const result: any[] = [];

    for (const formation of formations) {
        const isDuplicate = result.some(existing => {
            const diplomeSimilar = areSimilar(existing.diplome || '', formation.diplome || '', 0.9);
            const ecoleSimilar = areSimilar(existing.ecole || '', formation.ecole || '', 0.8);
            return diplomeSimilar && ecoleSimilar;
        });

        if (!isDuplicate) {
            result.push(formation);
        }
    }

    return result;
}

/**
 * Deduplicate projects (by 'nom' field)
 */
function deduplicateProjets(projets: any[]): any[] {
    if (!projets || projets.length === 0) return [];

    const result: any[] = [];

    for (const projet of projets) {
        const isDuplicate = result.some(existing =>
            areSimilar(existing.nom || '', projet.nom || '', 0.9)
        );

        if (!isDuplicate) {
            result.push(projet);
        }
    }

    return result;
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
 * CRITICAL: Deduplicates BOTH existing and incoming arrays BEFORE merging
 */
function mergeExperiences(existing: any, incoming: any): any {
    // 1. Deduplicate EXISTING realisations internally (cleans polluted RAG)
    const deduplicatedExistingReals = deduplicateRealisations(existing.realisations || []);

    // 2. Deduplicate INCOMING realisations internally (cleans Gemini output)
    const deduplicatedIncomingReals = deduplicateRealisations(incoming.realisations || []);

    // 3. Merge the two cleaned lists
    const mergedRealisations = [...deduplicatedExistingReals];

    for (const newReal of deduplicatedIncomingReals) {
        const isDuplicate = deduplicatedExistingReals.some((existReal: any) =>
            areSimilar(existReal.description || '', newReal.description || '', 0.85)
        );

        if (!isDuplicate) {
            mergedRealisations.push(newReal);
        }
    }

    // Same for technologies
    const deduplicatedExistingTechs = deduplicateStrings(existing.technologies || [], 0.9);
    const deduplicatedIncomingTechs = deduplicateStrings(incoming.technologies || [], 0.9);
    const mergedTechnologies = [...deduplicatedExistingTechs];

    for (const tech of deduplicatedIncomingTechs) {
        const isDuplicate = deduplicatedExistingTechs.some((existTech: string) =>
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
                    // 1. Deduplicate existing internally
                    const deduplicatedExisting = deduplicateStrings(
                        existing.competences?.explicit?.techniques || [],
                        0.9
                    );

                    // 2. Deduplicate incoming internally
                    const deduplicatedIncoming = deduplicateStrings(
                        incoming.competences?.explicit?.techniques || [],
                        0.9
                    );

                    // 3. Merge the two cleaned lists
                    const result = [...deduplicatedExisting];

                    for (const tech of deduplicatedIncoming) {
                        const isDuplicate = deduplicatedExisting.some((existTech: string) =>
                            areSimilar(existTech, tech, 0.9)
                        );
                        if (!isDuplicate) {
                            result.push(tech);
                        }
                    }

                    return result;
                })(),
                soft_skills: (() => {
                    // 1. Deduplicate existing internally
                    const deduplicatedExisting = deduplicateStrings(
                        existing.competences?.explicit?.soft_skills || [],
                        0.9
                    );

                    // 2. Deduplicate incoming internally
                    const deduplicatedIncoming = deduplicateStrings(
                        incoming.competences?.explicit?.soft_skills || [],
                        0.9
                    );

                    // 3. Merge the two cleaned lists
                    const result = [...deduplicatedExisting];

                    for (const skill of deduplicatedIncoming) {
                        const isDuplicate = deduplicatedExisting.some((existSkill: string) =>
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
                    // 1. Deduplicate existing internally
                    const deduplicatedExisting = deduplicateNamedObjects(
                        existing.competences?.inferred?.techniques || [],
                        0.9
                    );

                    // 2. Deduplicate incoming internally
                    const deduplicatedIncoming = deduplicateNamedObjects(
                        incoming.competences?.inferred?.techniques || [],
                        0.9
                    );

                    // 3. Merge the two cleaned lists
                    const result = [...deduplicatedExisting];

                    for (const tech of deduplicatedIncoming) {
                        const isDuplicate = deduplicatedExisting.some((existTech: any) =>
                            areSimilar(existTech.name || '', tech.name || '', 0.9)
                        );
                        if (!isDuplicate) {
                            result.push(tech);
                        }
                    }

                    return result;
                })(),
                tools: (() => {
                    // 1. Deduplicate existing internally
                    const deduplicatedExisting = deduplicateNamedObjects(
                        existing.competences?.inferred?.tools || [],
                        0.9
                    );

                    // 2. Deduplicate incoming internally
                    const deduplicatedIncoming = deduplicateNamedObjects(
                        incoming.competences?.inferred?.tools || [],
                        0.9
                    );

                    // 3. Merge the two cleaned lists
                    const result = [...deduplicatedExisting];

                    for (const tool of deduplicatedIncoming) {
                        const isDuplicate = deduplicatedExisting.some((existTool: any) =>
                            areSimilar(existTool.name || '', tool.name || '', 0.9)
                        );
                        if (!isDuplicate) {
                            result.push(tool);
                        }
                    }

                    return result;
                })(),
                soft_skills: (() => {
                    // 1. Deduplicate existing internally
                    const deduplicatedExisting = deduplicateNamedObjects(
                        existing.competences?.inferred?.soft_skills || [],
                        0.9
                    );

                    // 2. Deduplicate incoming internally
                    const deduplicatedIncoming = deduplicateNamedObjects(
                        incoming.competences?.inferred?.soft_skills || [],
                        0.9
                    );

                    // 3. Merge the two cleaned lists
                    const result = [...deduplicatedExisting];

                    for (const skill of deduplicatedIncoming) {
                        const isDuplicate = deduplicatedExisting.some((existSkill: any) =>
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
            // 1. Deduplicate existing internally
            const deduplicatedExisting = deduplicateFormations(existing.formations || []);

            // 2. Deduplicate incoming internally
            const deduplicatedIncoming = deduplicateFormations(incoming.formations || []);

            // 3. Merge the two cleaned lists
            const result = [...deduplicatedExisting];

            for (const newForm of deduplicatedIncoming) {
                const isDuplicate = deduplicatedExisting.some((f: any) => {
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
            // 1. Deduplicate existing internally
            const deduplicatedExisting = deduplicateStrings(
                existing.certifications || [],
                0.9
            );

            // 2. Deduplicate incoming internally
            const deduplicatedIncoming = deduplicateStrings(
                incoming.certifications || [],
                0.9
            );

            // 3. Merge the two cleaned lists
            const result = [...deduplicatedExisting];

            for (const cert of deduplicatedIncoming) {
                const isDuplicate = deduplicatedExisting.some((existCert: string) =>
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
            // 1. Deduplicate existing internally
            const deduplicatedExisting = deduplicateProjets(existing.projets || []);

            // 2. Deduplicate incoming internally
            const deduplicatedIncoming = deduplicateProjets(incoming.projets || []);

            // 3. Merge the two cleaned lists
            const result = [...deduplicatedExisting];

            for (const proj of deduplicatedIncoming) {
                const isDuplicate = deduplicatedExisting.some((existProj: any) =>
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
