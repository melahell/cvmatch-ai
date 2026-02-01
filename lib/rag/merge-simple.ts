/**
 * Simple RAG Merge - Compatible with new types
 * Merges incoming RAG data with existing RAG data
 * 
 * Enhanced with:
 * - Company name normalization (VW FS = Volkswagen Financial Services)
 * - Fuzzy position matching (60% similarity threshold)
 * - Date tolerance (±6 months)
 * - Fuzzy matching pour déduplication intelligente
 * - Respect strict de rejected_inferred
 */

import { normalizeCompanyName } from './normalize-company';
import { combinedSimilarity, areStringsSimilar } from './string-similarity';
import { 
    areExperiencesSimilar as fuzzyAreExperiencesSimilar,
    areSkillsSimilar,
    isSkillRejected,
    deduplicateBySimilarity
} from './fuzzy-matcher';

/**
 * Check if two experiences are similar (same company + overlapping dates + similar position)
 * 
 * Criteria (all must match):
 * 1. Same company after normalization (fuzzy matching avec seuil 85%)
 * 2. Start dates within 6 months (tolérance augmentée pour variations)
 * 3. Position similarity >= 70% (fuzzy matching amélioré)
 */
function areExperiencesSimilar(exp1: any, exp2: any): boolean {
    if (!exp1 || !exp2) return false;

    // Utiliser fuzzy matching amélioré
    return fuzzyAreExperiencesSimilar(exp1, exp2, 0.75, 0.7);
}

/**
 * Check if two realisations are similar using word-based matching
 * Uses Jaccard index (75% threshold) - stricter to preserve unique details
 * 
 * Example: "Gestion de 100 utilisateurs" vs "Gouvernance de 100 utilisateurs"
 * → Levenshtein: 67% (MISS)
 * → Jaccard: 75% (DETECTED)
 * 
 * Increased threshold from 55% to 75% to avoid losing unique realisations
 * that are only partially similar (e.g., different tools, methods, or contexts)
 */
function areRealisationsSimilar(real1: any, real2: any): boolean {
    const desc1 = real1?.description || "";
    const desc2 = real2?.description || "";

    if (!desc1 || !desc2) return false;

    // Exact match shortcut
    if (desc1.toLowerCase().trim() === desc2.toLowerCase().trim()) return true;

    // Use word-based similarity (Jaccard) - more robust for reformulations
    const stopWords = new Set(["de", "du", "des", "la", "le", "les", "et", "à", "pour", "en", "un", "une", "—", "-", "&"]);

    const tokenize = (s: string): Set<string> => {
        const words = s
            .toLowerCase()
            .replace(/[^\w\sàâäéèêëïîôùûüç0-9-]/g, " ")
            .split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.has(w));
        return new Set(words);
    };

    const set1 = tokenize(desc1);
    const set2 = tokenize(desc2);

    if (set1.size === 0 || set2.size === 0) return false;

    // Jaccard index: intersection / union
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    const jaccard = intersection.size / union.size;

    // 75% threshold (increased from 55%) - stricter to preserve unique realisations
    // Only merge if they are truly similar, not just partially related
    return jaccard >= 0.75;
}

/**
 * Merge two experiences (combine realisations, technologies, clients)
 * Uses 75% similarity threshold to avoid near-duplicate realisations
 */
function mergeExperiences(existing: any, incoming: any): any {
    // Deduplicate realisations with 75% similarity
    const existingRealisations = existing.realisations || [];
    const incomingRealisations = incoming.realisations || [];

    const uniqueNewRealisations = incomingRealisations.filter((newReal: any) =>
        !existingRealisations.some((existReal: any) =>
            areRealisationsSimilar(existReal, newReal)
        )
    );

    // Prefer longer/more detailed company name and position
    const preferredCompanyName =
        (incoming.entreprise?.length || 0) > (existing.entreprise?.length || 0)
            ? incoming.entreprise
            : existing.entreprise;

    const preferredPosition =
        (incoming.poste?.length || 0) > (existing.poste?.length || 0)
            ? incoming.poste
            : existing.poste;

    return {
        ...existing,
        ...incoming,
        // Use preferred (longer) names
        entreprise: preferredCompanyName,
        poste: preferredPosition,
        // Merge realisations (unique by similarity)
        realisations: [...existingRealisations, ...uniqueNewRealisations],
        // Merge technologies (union)
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
        competences: (() => {
            // Get the rejected list to filter out rejected inferred skills
            const rejectedInferred = new Set(
                (existing.rejected_inferred || []).map((s: string) => s.toLowerCase())
            );

            // Filter function: exclude if skill was rejected by user
            const isNotRejected = (skill: any) => {
                const skillName = (skill?.name || skill || "").toLowerCase();
                return !rejectedInferred.has(skillName);
            };

            // Merge inferred skills: keep higher confidence, exclude rejected
            const mergeInferredSkills = (existingSkills: any[], incomingSkills: any[]) => {
                const skillMap = new Map<string, any>();

                // Add existing
                for (const skill of existingSkills) {
                    const key = skill.name?.toLowerCase();
                    if (key && isNotRejected(skill)) {
                        skillMap.set(key, skill);
                    }
                }

                // Merge incoming (prefer higher confidence)
                for (const skill of incomingSkills) {
                    const key = skill.name?.toLowerCase();
                    if (!key || !isNotRejected(skill)) continue;

                    const existing = skillMap.get(key);
                    if (!existing) {
                        skillMap.set(key, skill);
                    } else if ((skill.confidence || 0) > (existing.confidence || 0)) {
                        // Keep higher confidence, merge sources
                        skillMap.set(key, {
                            ...skill,
                            sources: [...new Set([...(existing.sources || []), ...(skill.sources || [])])]
                        });
                    }
                }

                return Array.from(skillMap.values());
            };

            // Dédupliquer compétences explicites avec fuzzy matching
            const deduplicateSkills = (skills: any[]): any[] => {
                return deduplicateBySimilarity(
                    skills,
                    (s) => typeof s === 'string' ? s.toLowerCase() : (s.name || s.nom || '').toLowerCase(),
                    (a, b) => {
                        const nameA = typeof a === 'string' ? a : (a.name || a.nom || '');
                        const nameB = typeof b === 'string' ? b : (b.name || b.nom || '');
                        return areSkillsSimilar(nameA, nameB, 0.75);
                    },
                    0.75
                );
            };

            return {
                explicit: {
                    techniques: deduplicateSkills([
                        ...(existing.competences?.explicit?.techniques || []),
                        ...(incoming.competences?.explicit?.techniques || [])
                    ]),
                    soft_skills: deduplicateSkills([
                        ...(existing.competences?.explicit?.soft_skills || []),
                        ...(incoming.competences?.explicit?.soft_skills || [])
                    ])
                },
                inferred: {
                    techniques: mergeInferredSkills(
                        existing.competences?.inferred?.techniques || [],
                        incoming.competences?.inferred?.techniques || []
                    ),
                    tools: mergeInferredSkills(
                        existing.competences?.inferred?.tools || [],
                        incoming.competences?.inferred?.tools || []
                    ),
                    soft_skills: mergeInferredSkills(
                        existing.competences?.inferred?.soft_skills || [],
                        incoming.competences?.inferred?.soft_skills || []
                    )
                }
            };
        })(),

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
        // [CDC-6] Merge intelligent des langues: garder le niveau le plus élevé (CECRL)
        langues: (() => {
            const existingLangages = existing.langues || {};
            const incomingLangages = incoming.langues || {};
            
            // Ordre des niveaux CECRL (du plus bas au plus haut)
            const CECRL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            
            // Mappings pour normaliser les niveaux courants
            const LEVEL_MAPPINGS: Record<string, string> = {
                'natif': 'C2',
                'native': 'C2',
                'maternelle': 'C2',
                'maternel': 'C2',
                'bilingue': 'C2',
                'bilingual': 'C2',
                'courant': 'C1',
                'fluent': 'C1',
                'professionnel': 'B2',
                'professional': 'B2',
                'avancé': 'B2',
                'advanced': 'B2',
                'intermédiaire': 'B1',
                'intermediate': 'B1',
                'moyen': 'B1',
                'débutant': 'A2',
                'beginner': 'A1',
                'notions': 'A1',
                'scolaire': 'A2',
            };

            const getNormalizedLevel = (level: string): string => {
                const lower = level.toLowerCase().trim();
                // Si c'est déjà un niveau CECRL, le retourner
                const upperLevel = level.toUpperCase().trim();
                if (CECRL_ORDER.includes(upperLevel)) return upperLevel;
                // Sinon, chercher dans les mappings
                return LEVEL_MAPPINGS[lower] || 'B1'; // B1 par défaut si inconnu
            };

            const compareLanguageLevels = (level1: string, level2: string): number => {
                const norm1 = getNormalizedLevel(level1);
                const norm2 = getNormalizedLevel(level2);
                return CECRL_ORDER.indexOf(norm1) - CECRL_ORDER.indexOf(norm2);
            };

            const result: Record<string, string> = {};

            // Ajouter existants
            for (const [lang, level] of Object.entries(existingLangages)) {
                if (typeof level === 'string') {
                    result[lang] = level;
                }
            }

            // Fusionner incoming en gardant le niveau le plus élevé
            for (const [lang, level] of Object.entries(incomingLangages)) {
                if (typeof level !== 'string') continue;
                
                // Chercher langue existante (case-insensitive)
                const existingKey = Object.keys(result).find(k => k.toLowerCase() === lang.toLowerCase());
                
                if (existingKey) {
                    // Comparer et garder le niveau le plus élevé
                    if (compareLanguageLevels(level, result[existingKey]) > 0) {
                        result[existingKey] = level;
                    }
                } else {
                    result[lang] = level;
                }
            }

            return result;
        })(),

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
