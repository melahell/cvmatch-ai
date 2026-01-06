/**
 * RAG Merge Engine - Fusion Intelligente des Données
 * 
 * Principes :
 * 1. JAMAIS supprimer - Toujours enrichir
 * 2. Doublons = Fusion - Pas de remplacement
 * 3. Conflit = Enrichissement - Garder les deux infos
 * 4. Historique - Tracer chaque merge
 */

import {
    RAGComplete,
    Experience,
    Realisation,
    Competences,
    SkillExplicit,
    SkillInferred,
    Formation,
    Certification,
    Langue,
    ClientReference,
    ProjetMarquant,
    MergeHistoryEntry,
    generateId
} from '../../types/rag-complete';

// =============================================================================
// UTILITAIRES
// =============================================================================

/**
 * Calcule la similarité entre deux chaînes (0-1)
 * Utilise la distance de Levenshtein normalisée
 */
function stringSimilarity(a: string, b: string): number {
    if (!a || !b) return 0;
    const aLower = a.toLowerCase().trim();
    const bLower = b.toLowerCase().trim();
    if (aLower === bLower) return 1;

    // Levenshtein distance
    const matrix: number[][] = [];
    const aLen = aLower.length;
    const bLen = bLower.length;

    for (let i = 0; i <= bLen; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= aLen; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= bLen; i++) {
        for (let j = 1; j <= aLen; j++) {
            if (bLower.charAt(i - 1) === aLower.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    const distance = matrix[bLen][aLen];
    const maxLen = Math.max(aLen, bLen);
    return 1 - distance / maxLen;
}

/**
 * Vérifie si deux périodes se chevauchent
 */
function datesOverlap(exp1: Experience, exp2: Experience): boolean {
    const toDate = (s: string | null): Date | null => {
        if (!s) return null;
        const parts = s.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1] || '1') - 1);
    };

    const start1 = toDate(exp1.debut);
    const end1 = exp1.fin ? toDate(exp1.fin) : new Date();
    const start2 = toDate(exp2.debut);
    const end2 = exp2.fin ? toDate(exp2.fin) : new Date();

    if (!start1 || !start2) return false;

    // Chevauchement si (start1 <= end2) ET (start2 <= end1)
    return start1 <= (end2 || new Date()) && start2 <= (end1 || new Date());
}

/**
 * Dédoublonne un tableau de chaînes
 */
function deduplicateStrings(arr: string[]): string[] {
    return Array.from(new Set(arr.filter(Boolean)));
}

/**
 * Retourne le texte le plus long entre deux options
 */
function longestText(a: string | undefined, b: string | undefined): string {
    if (!a && !b) return '';
    if (!a) return b || '';
    if (!b) return a;
    return a.length >= b.length ? a : b;
}

// =============================================================================
// MERGE EXPERIENCES
// =============================================================================

/**
 * Fusionne deux listes d'expériences
 * - Match par similarité poste + entreprise + dates
 * - Enrichit les expériences existantes
 * - Ajoute les nouvelles
 */
export function mergeExperiences(
    existing: Experience[],
    incoming: Experience[],
    sourceDoc: string
): { merged: Experience[]; added: number; enriched: number } {
    const result = [...existing];
    let added = 0;
    let enriched = 0;

    for (const newExp of incoming) {
        // Chercher une expérience similaire
        const matchIndex = result.findIndex(e =>
            stringSimilarity(e.poste, newExp.poste) > 0.75 &&
            stringSimilarity(e.entreprise, newExp.entreprise) > 0.75 &&
            datesOverlap(e, newExp)
        );

        if (matchIndex >= 0) {
            // MERGE: Enrichir l'expérience existante
            const match = result[matchIndex];

            // Fusionner les réalisations
            match.realisations = mergeRealisations(match.realisations, newExp.realisations);

            // Accumuler technologies, outils, méthodologies
            match.technologies = deduplicateStrings([...match.technologies, ...newExp.technologies]);
            match.outils = deduplicateStrings([...(match.outils || []), ...(newExp.outils || [])]);
            match.methodologies = deduplicateStrings([...(match.methodologies || []), ...(newExp.methodologies || [])]);

            // Accumuler clients
            match.clients_references = deduplicateStrings([
                ...(match.clients_references || []),
                ...(newExp.clients_references || [])
            ]);

            // Contexte: garder le plus détaillé
            match.contexte = longestText(match.contexte, newExp.contexte);

            // Enrichir les infos manquantes
            if (!match.type_entreprise && newExp.type_entreprise) match.type_entreprise = newExp.type_entreprise;
            if (!match.secteur && newExp.secteur) match.secteur = newExp.secteur;
            if (!match.lieu && newExp.lieu) match.lieu = newExp.lieu;
            if (!match.type_contrat && newExp.type_contrat) match.type_contrat = newExp.type_contrat;
            if (!match.equipe_size && newExp.equipe_size) match.equipe_size = newExp.equipe_size;
            if (!match.budget_gere && newExp.budget_gere) match.budget_gere = newExp.budget_gere;

            // Mettre à jour métadonnées
            match.sources = deduplicateStrings([...match.sources, sourceDoc]);
            match.last_updated = new Date().toISOString();
            match.merge_count = (match.merge_count || 0) + 1;

            result[matchIndex] = match;
            enriched++;
        } else {
            // NEW: Ajouter comme nouvelle expérience
            const newItem: Experience = {
                ...newExp,
                id: generateId('exp'),
                sources: [sourceDoc],
                last_updated: new Date().toISOString(),
                merge_count: 0
            };
            result.push(newItem);
            added++;
        }
    }

    // Trier par date (plus récent en premier)
    result.sort((a, b) => {
        const dateA = new Date(a.debut);
        const dateB = new Date(b.debut);
        return dateB.getTime() - dateA.getTime();
    });

    return { merged: result, added, enriched };
}

/**
 * Fusionne les réalisations en évitant les doublons
 */
function mergeRealisations(existing: Realisation[], incoming: Realisation[]): Realisation[] {
    const result = [...existing];

    for (const newReal of incoming) {
        // Chercher une réalisation similaire (>80% similarité)
        const similar = result.find(r =>
            stringSimilarity(r.description, newReal.description) > 0.8
        );

        if (similar) {
            // Enrichir avec l'impact si manquant
            if (!similar.impact && newReal.impact) {
                similar.impact = newReal.impact;
            }
            // Enrichir avec quantification si manquante
            if (!similar.quantification && newReal.quantification) {
                similar.quantification = newReal.quantification;
            }
            // Accumuler les sources
            similar.sources = deduplicateStrings([...similar.sources, ...newReal.sources]);
        } else {
            // Nouvelle réalisation
            result.push({
                ...newReal,
                id: newReal.id || generateId('real'),
                sources: newReal.sources || []
            });
        }
    }

    return result;
}

// =============================================================================
// MERGE COMPÉTENCES
// =============================================================================

/**
 * Fusionne les compétences
 */
export function mergeCompetences(existing: Competences, incoming: Competences): Competences {
    return {
        explicit: {
            techniques: mergeSkillsExplicit(
                existing.explicit.techniques || [],
                incoming.explicit.techniques || []
            ),
            soft_skills: deduplicateStrings([
                ...(existing.explicit.soft_skills || []),
                ...(incoming.explicit.soft_skills || [])
            ]),
            methodologies: deduplicateStrings([
                ...(existing.explicit.methodologies || []),
                ...(incoming.explicit.methodologies || [])
            ]),
            langages_programmation: deduplicateStrings([
                ...(existing.explicit.langages_programmation || []),
                ...(incoming.explicit.langages_programmation || [])
            ]),
            frameworks: deduplicateStrings([
                ...(existing.explicit.frameworks || []),
                ...(incoming.explicit.frameworks || [])
            ]),
            outils: deduplicateStrings([
                ...(existing.explicit.outils || []),
                ...(incoming.explicit.outils || [])
            ]),
            cloud_devops: deduplicateStrings([
                ...(existing.explicit.cloud_devops || []),
                ...(incoming.explicit.cloud_devops || [])
            ])
        },
        inferred: {
            techniques: mergeSkillsInferred(
                existing.inferred.techniques || [],
                incoming.inferred.techniques || []
            ),
            tools: mergeSkillsInferred(
                existing.inferred.tools || [],
                incoming.inferred.tools || []
            ),
            soft_skills: mergeSkillsInferred(
                existing.inferred.soft_skills || [],
                incoming.inferred.soft_skills || []
            )
        },
        par_domaine: mergeParDomaine(
            existing.par_domaine || {},
            incoming.par_domaine || {}
        )
    };
}

function mergeSkillsExplicit(existing: SkillExplicit[], incoming: SkillExplicit[]): SkillExplicit[] {
    const result = [...existing];

    for (const skill of incoming) {
        const matchIndex = result.findIndex(s =>
            stringSimilarity(s.nom, skill.nom) > 0.9
        );

        if (matchIndex >= 0) {
            // Enrichir: garder le niveau le plus élevé
            const levels: Record<string, number> = { debutant: 1, intermediaire: 2, avance: 3, expert: 4 };
            const existingLevel = levels[result[matchIndex].niveau || 'intermediaire'] || 2;
            const newLevel = levels[skill.niveau || 'intermediaire'] || 2;

            if (newLevel > existingLevel) {
                result[matchIndex].niveau = skill.niveau;
            }

            // Enrichir les années Si présentes
            if (skill.annees_experience && (!result[matchIndex].annees_experience || skill.annees_experience > result[matchIndex].annees_experience!)) {
                result[matchIndex].annees_experience = skill.annees_experience;
            }

            // Marquer certifié si l'un des deux l'est
            if (skill.certifie) result[matchIndex].certifie = true;
        } else {
            result.push(skill);
        }
    }

    return result;
}

function mergeSkillsInferred(existing: SkillInferred[], incoming: SkillInferred[]): SkillInferred[] {
    const result = [...existing];

    for (const skill of incoming) {
        const matchIndex = result.findIndex(s =>
            stringSimilarity(s.name, skill.name) > 0.9
        );

        if (matchIndex >= 0) {
            // Garder la confidence la plus élevée
            if (skill.confidence > result[matchIndex].confidence) {
                result[matchIndex].confidence = skill.confidence;
                result[matchIndex].reasoning = skill.reasoning;
            }
            // Accumuler les sources
            result[matchIndex].sources = deduplicateStrings([
                ...result[matchIndex].sources,
                ...skill.sources
            ]);
        } else {
            result.push(skill);
        }
    }

    return result;
}

function mergeParDomaine(
    existing: Record<string, string[]>,
    incoming: Record<string, string[]>
): Record<string, string[]> {
    const result = { ...existing };

    for (const [domain, skills] of Object.entries(incoming)) {
        if (result[domain]) {
            result[domain] = deduplicateStrings([...result[domain], ...skills]);
        } else {
            result[domain] = skills;
        }
    }

    return result;
}

// =============================================================================
// MERGE FORMATIONS & CERTIFICATIONS
// =============================================================================

export function mergeFormations(existing: Formation[], incoming: Formation[], sourceDoc: string): Formation[] {
    const result = [...existing];

    for (const formation of incoming) {
        const match = result.find(f =>
            stringSimilarity(f.titre, formation.titre) > 0.8 &&
            stringSimilarity(f.organisme, formation.organisme) > 0.8
        );

        if (match) {
            // Enrichir
            if (!match.mention && formation.mention) match.mention = formation.mention;
            if (!match.specialite && formation.specialite) match.specialite = formation.specialite;
            if (!match.details && formation.details) match.details = formation.details;
            match.sources = deduplicateStrings([...match.sources, sourceDoc]);
        } else {
            result.push({
                ...formation,
                id: generateId('form'),
                sources: [sourceDoc]
            });
        }
    }

    return result;
}

export function mergeCertifications(existing: Certification[], incoming: Certification[], sourceDoc: string): Certification[] {
    const result = [...existing];

    for (const cert of incoming) {
        const match = result.find(c =>
            stringSimilarity(c.nom, cert.nom) > 0.85
        );

        if (!match) {
            result.push({
                ...cert,
                id: generateId('cert'),
                sources: [sourceDoc]
            });
        } else {
            // Enrichir si info manquante
            if (!match.numero && cert.numero) match.numero = cert.numero;
            if (!match.url_verification && cert.url_verification) match.url_verification = cert.url_verification;
            match.sources = deduplicateStrings([...match.sources, sourceDoc]);
        }
    }

    return result;
}

// =============================================================================
// MERGE LANGUES
// =============================================================================

export function mergeLangues(existing: Langue[], incoming: Langue[]): Langue[] {
    const result = [...existing];

    for (const langue of incoming) {
        const match = result.find(l =>
            stringSimilarity(l.langue, langue.langue) > 0.9
        );

        if (match) {
            // Garder le niveau le plus détaillé
            if (langue.niveau_cecrl && !match.niveau_cecrl) {
                match.niveau_cecrl = langue.niveau_cecrl;
            }
            if (langue.certifications) {
                match.certifications = deduplicateStrings([
                    ...(match.certifications || []),
                    ...langue.certifications
                ]);
            }
        } else {
            result.push(langue);
        }
    }

    return result;
}

// =============================================================================
// MERGE CLIENTS / RÉFÉRENCES
// =============================================================================

export function mergeClients(existing: ClientReference[], incoming: ClientReference[]): ClientReference[] {
    const result = [...existing];

    for (const client of incoming) {
        const match = result.find(c =>
            stringSimilarity(c.nom, client.nom) > 0.85
        );

        if (match) {
            // Accumuler les années
            match.annees = deduplicateStrings([...match.annees, ...client.annees]);
            // Enrichir
            if (!match.contexte && client.contexte) match.contexte = client.contexte;
        } else {
            result.push(client);
        }
    }

    return result;
}

export function mergeProjets(existing: ProjetMarquant[], incoming: ProjetMarquant[], sourceDoc: string): ProjetMarquant[] {
    const result = [...existing];

    for (const projet of incoming) {
        const match = result.find(p =>
            stringSimilarity(p.nom, projet.nom) > 0.8
        );

        if (match) {
            // Enrichir description
            match.description = longestText(match.description, projet.description);
            match.resultats = longestText(match.resultats, projet.resultats);
            match.technologies = deduplicateStrings([...match.technologies, ...projet.technologies]);
            match.sources = deduplicateStrings([...match.sources, sourceDoc]);
        } else {
            result.push({
                ...projet,
                id: generateId('proj'),
                sources: [sourceDoc]
            });
        }
    }

    return result;
}

// =============================================================================
// FONCTION PRINCIPALE - MERGE RAG COMPLET
// =============================================================================

export interface MergeResult {
    rag: RAGComplete;
    stats: {
        experiences_added: number;
        experiences_enriched: number;
        skills_added: number;
        clients_added: number;
        formations_added: number;
    };
}

/**
 * Fusionne les nouvelles données RAG avec les existantes
 * Principe : TOUJOURS enrichir, JAMAIS supprimer
 */
export function mergeRAGData(
    existing: any,
    incoming: any,
    sourceDocument: string = "unknown"
): any {
    const now = new Date().toISOString();

    // Stats de merge
    const stats = {
        experiences_added: 0,
        experiences_enriched: 0,
        skills_added: 0,
        clients_added: 0,
        formations_added: 0
    };

    // === PROFIL ===
    const mergedProfil = {
        ...existing.profil,
        // Titres alternatifs: accumuler
        titres_alternatifs: deduplicateStrings([
            ...(existing.profil.titres_alternatifs || []),
            ...(incoming.profil.titres_alternatifs || []),
            // Si nouveau titre différent, l'ancien devient alternatif
            existing.profil.titre_principal !== incoming.profil.titre_principal
                ? existing.profil.titre_principal
                : ''
        ].filter(Boolean)),
        // Titre principal: prendre le plus récent s'il y en a un
        titre_principal: incoming.profil.titre_principal || existing.profil.titre_principal,
        // Contact: enrichir
        contact: {
            ...existing.profil.contact,
            ...Object.fromEntries(
                Object.entries(incoming.profil.contact).filter(([_, v]) => v)
            )
        },
        // Pitch: garder le plus long
        elevator_pitch: longestText(existing.profil.elevator_pitch, incoming.profil.elevator_pitch),
        // Enrichir les autres champs manquants
        localisation: incoming.profil.localisation || existing.profil.localisation,
        disponibilite: incoming.profil.disponibilite || existing.profil.disponibilite,
        teletravail: incoming.profil.teletravail || existing.profil.teletravail,
        tjm: incoming.profil.tjm || existing.profil.tjm
    };

    // === EXPÉRIENCES ===
    const expResult = mergeExperiences(existing.experiences, incoming.experiences, sourceDocument);
    stats.experiences_added = expResult.added;
    stats.experiences_enriched = expResult.enriched;

    // === COMPÉTENCES ===
    const existingSkillCount = (existing.competences.explicit.techniques?.length || 0);
    const mergedCompetences = mergeCompetences(existing.competences, incoming.competences);
    stats.skills_added = (mergedCompetences.explicit.techniques?.length || 0) - existingSkillCount;

    // === FORMATIONS ===
    const existingFormCount = existing.formations.length;
    const mergedFormations = mergeFormations(existing.formations, incoming.formations, sourceDocument);
    stats.formations_added = mergedFormations.length - existingFormCount;

    // === CERTIFICATIONS ===
    const mergedCertifications = mergeCertifications(
        existing.certifications || [],
        incoming.certifications || [],
        sourceDocument
    );

    // === LANGUES ===
    const mergedLangues = mergeLangues(existing.langues, incoming.langues);

    // === RÉFÉRENCES ===
    const existingClientCount = existing.references.clients.length;
    const mergedClients = mergeClients(existing.references.clients, incoming.references.clients);
    stats.clients_added = mergedClients.length - existingClientCount;

    const mergedProjets = mergeProjets(
        existing.references.projets_marquants,
        incoming.references.projets_marquants,
        sourceDocument
    );

    // === MÉTADONNÉES ===
    const mergeEntry: MergeHistoryEntry = {
        date: now,
        source: sourceDocument,
        action: 'merge',
        fields_updated: Object.entries(stats)
            .filter(([_, v]) => v > 0)
            .map(([k]) => k),
        experiences_added: stats.experiences_added,
        experiences_merged: stats.experiences_enriched
    };

    const mergedMetadata = {
        ...existing.metadata,
        last_updated: now,
        last_merge_at: now,
        sources_count: existing.metadata.sources_count + 1,
        documents_sources: deduplicateStrings([
            ...existing.metadata.documents_sources,
            sourceDocument
        ]),
        merge_history: [...existing.metadata.merge_history, mergeEntry]
    };

    // Recalculer complétude
    const result: RAGComplete = {
        profil: mergedProfil,
        experiences: expResult.merged,
        competences: mergedCompetences,
        formations: mergedFormations,
        certifications: mergedCertifications,
        langues: mergedLangues,
        references: {
            clients: mergedClients,
            projets_marquants: mergedProjets,
            publications: existing.references.publications,
            interventions: existing.references.interventions
        },
        infos_additionnelles: existing.infos_additionnelles,
        metadata: mergedMetadata
    };

    return { rag: result, stats };
}
