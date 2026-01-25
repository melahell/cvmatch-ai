/**
 * Semantic Analysis - Analyse sémantique avancée pour le matching CV/Offre
 *
 * [AMÉLIORATION P3-10] : Système d'analyse sémantique utilisant des embeddings
 * pour améliorer la pertinence du matching candidat/offre
 *
 * Features:
 * - Calcul de similarité sémantique (cosine similarity)
 * - Extraction de concepts clés
 * - Clustering de compétences similaires
 * - Détection de synonymes métier
 * - Gap analysis sémantique
 */

import { logger } from "@/lib/utils/logger";

// ============================================================================
// TYPES
// ============================================================================

export interface SemanticVector {
    text: string;
    embedding: number[];
    metadata?: Record<string, any>;
}

export interface SemanticMatch {
    sourceText: string;
    matchText: string;
    similarity: number;
    matchType: "exact" | "synonym" | "related" | "weak";
}

export interface SemanticGap {
    requirement: string;
    bestMatch: string | null;
    similarity: number;
    suggestions: string[];
    priority: "critical" | "important" | "nice_to_have";
}

export interface ConceptCluster {
    id: string;
    name: string;
    concepts: string[];
    centroid: number[];
    coherence: number;
}

export interface SemanticAnalysisResult {
    overallSimilarity: number;
    skillMatches: SemanticMatch[];
    experienceMatches: SemanticMatch[];
    gaps: SemanticGap[];
    clusters: ConceptCluster[];
    insights: string[];
}

// ============================================================================
// SYNONYM DICTIONARIES
// ============================================================================

/**
 * Dictionnaire de synonymes métier (français)
 */
const BUSINESS_SYNONYMS: Record<string, string[]> = {
    // Management
    "management": ["gestion", "direction", "pilotage", "encadrement", "supervision"],
    "équipe": ["team", "collaborateurs", "personnel", "effectifs"],
    "leadership": ["management", "direction", "animation"],

    // Tech
    "développement": ["dev", "programmation", "coding", "software engineering"],
    "cloud": ["aws", "azure", "gcp", "iaas", "paas", "saas"],
    "agile": ["scrum", "kanban", "lean", "sprint"],
    "ci/cd": ["devops", "intégration continue", "déploiement continu", "jenkins", "gitlab ci"],
    "api": ["rest", "graphql", "web services", "microservices"],

    // Data
    "data": ["données", "analytics", "bi", "business intelligence"],
    "machine learning": ["ml", "ia", "intelligence artificielle", "deep learning", "ai"],
    "big data": ["hadoop", "spark", "data lake", "data warehouse"],

    // Finance
    "finance": ["financier", "comptabilité", "trésorerie", "gestion financière"],
    "audit": ["contrôle", "vérification", "compliance", "conformité"],
    "risque": ["risk management", "gestion des risques", "risk assessment"],

    // Projet
    "projet": ["project", "initiative", "programme", "chantier"],
    "planification": ["planning", "roadmap", "scheduling"],
    "budget": ["coûts", "finances", "ressources financières"],

    // Soft skills
    "communication": ["présentation", "rédaction", "expression"],
    "autonomie": ["indépendance", "self-starter", "initiative"],
    "rigueur": ["précision", "méthodique", "organisé"],
};

/**
 * Dictionnaire de termes techniques équivalents
 */
const TECHNICAL_EQUIVALENTS: Record<string, string[]> = {
    // Langages
    "javascript": ["js", "ecmascript", "es6", "es2015"],
    "typescript": ["ts"],
    "python": ["py", "python3"],
    "java": ["jvm", "j2ee", "jakarta"],

    // Frameworks
    "react": ["reactjs", "react.js"],
    "angular": ["angularjs", "ng"],
    "vue": ["vuejs", "vue.js"],
    "node": ["nodejs", "node.js"],
    "spring": ["spring boot", "springboot"],

    // Databases
    "postgresql": ["postgres", "psql"],
    "mongodb": ["mongo"],
    "elasticsearch": ["elastic", "es"],
    "mysql": ["mariadb"],

    // Cloud
    "kubernetes": ["k8s", "kube"],
    "docker": ["containers", "conteneurs"],
    "terraform": ["iac", "infrastructure as code"],
};

// ============================================================================
// EMBEDDING SIMULATION
// ============================================================================

/**
 * Simule un embedding basé sur les n-grams et les synonymes
 * Note: En production, utiliser un vrai modèle d'embedding (sentence-transformers, OpenAI, etc.)
 */
export function generateSimulatedEmbedding(text: string): number[] {
    const normalized = text.toLowerCase().trim();
    const words = normalized.split(/\s+/);
    const EMBEDDING_DIM = 128;

    // Générer un vecteur pseudo-sémantique basé sur les caractéristiques du texte
    const embedding = new Array(EMBEDDING_DIM).fill(0);

    // Caractéristiques basées sur les mots
    words.forEach((word, idx) => {
        const hash = simpleHash(word);
        for (let i = 0; i < 8; i++) {
            const dimIdx = (hash + i * 17) % EMBEDDING_DIM;
            embedding[dimIdx] += 1 / (idx + 1); // Pondération par position
        }

        // Ajouter les synonymes
        for (const [key, synonyms] of Object.entries(BUSINESS_SYNONYMS)) {
            if (synonyms.includes(word) || key === word) {
                const synHash = simpleHash(key);
                for (let i = 0; i < 4; i++) {
                    const dimIdx = (synHash + i * 23) % EMBEDDING_DIM;
                    embedding[dimIdx] += 0.5;
                }
            }
        }

        // Ajouter les équivalents techniques
        for (const [key, equivalents] of Object.entries(TECHNICAL_EQUIVALENTS)) {
            if (equivalents.includes(word) || key === word) {
                const techHash = simpleHash(key);
                for (let i = 0; i < 4; i++) {
                    const dimIdx = (techHash + i * 31) % EMBEDDING_DIM;
                    embedding[dimIdx] += 0.7;
                }
            }
        }
    });

    // Caractéristiques basées sur les n-grams
    for (let n = 2; n <= 3; n++) {
        for (let i = 0; i <= words.length - n; i++) {
            const ngram = words.slice(i, i + n).join(" ");
            const ngramHash = simpleHash(ngram);
            const dimIdx = ngramHash % EMBEDDING_DIM;
            embedding[dimIdx] += 0.3;
        }
    }

    // Normaliser le vecteur
    return normalizeVector(embedding);
}

/**
 * Hash simple pour générer des indices reproductibles
 */
function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

/**
 * Normalise un vecteur (L2 normalization)
 */
function normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (magnitude === 0) return vector;
    return vector.map(v => v / magnitude);
}

// ============================================================================
// SIMILARITY CALCULATIONS
// ============================================================================

/**
 * Calcule la similarité cosinus entre deux vecteurs
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
        throw new Error("Vectors must have the same dimension");
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        norm1 += vec1[i] * vec1[i];
        norm2 += vec2[i] * vec2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
}

/**
 * Calcule la similarité sémantique entre deux textes
 */
export function calculateSemanticSimilarity(text1: string, text2: string): number {
    const embedding1 = generateSimulatedEmbedding(text1);
    const embedding2 = generateSimulatedEmbedding(text2);
    return cosineSimilarity(embedding1, embedding2);
}

/**
 * Détermine le type de match basé sur la similarité
 */
export function classifyMatchType(similarity: number): SemanticMatch["matchType"] {
    if (similarity >= 0.95) return "exact";
    if (similarity >= 0.75) return "synonym";
    if (similarity >= 0.50) return "related";
    return "weak";
}

// ============================================================================
// SEMANTIC MATCHING
// ============================================================================

/**
 * Trouve les meilleures correspondances sémantiques
 */
export function findSemanticMatches(
    sourceTexts: string[],
    targetTexts: string[],
    threshold: number = 0.4
): SemanticMatch[] {
    const matches: SemanticMatch[] = [];

    // Pré-calculer les embeddings
    const sourceEmbeddings = sourceTexts.map(text => ({
        text,
        embedding: generateSimulatedEmbedding(text),
    }));

    const targetEmbeddings = targetTexts.map(text => ({
        text,
        embedding: generateSimulatedEmbedding(text),
    }));

    // Trouver les meilleures correspondances
    for (const source of sourceEmbeddings) {
        let bestMatch: { text: string; similarity: number } | null = null;

        for (const target of targetEmbeddings) {
            const similarity = cosineSimilarity(source.embedding, target.embedding);

            if (similarity >= threshold) {
                if (!bestMatch || similarity > bestMatch.similarity) {
                    bestMatch = { text: target.text, similarity };
                }
            }
        }

        if (bestMatch) {
            matches.push({
                sourceText: source.text,
                matchText: bestMatch.text,
                similarity: bestMatch.similarity,
                matchType: classifyMatchType(bestMatch.similarity),
            });
        }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
}

// ============================================================================
// GAP ANALYSIS
// ============================================================================

/**
 * Analyse les gaps sémantiques entre les requirements et les compétences
 */
export function analyzeSemanticGaps(
    requirements: string[],
    candidateSkills: string[],
    threshold: number = 0.5
): SemanticGap[] {
    const gaps: SemanticGap[] = [];

    const candidateEmbeddings = candidateSkills.map(skill => ({
        text: skill,
        embedding: generateSimulatedEmbedding(skill),
    }));

    for (const requirement of requirements) {
        const reqEmbedding = generateSimulatedEmbedding(requirement);

        let bestMatch: { text: string; similarity: number } | null = null;
        const relatedSkills: { text: string; similarity: number }[] = [];

        for (const candidate of candidateEmbeddings) {
            const similarity = cosineSimilarity(reqEmbedding, candidate.embedding);

            if (!bestMatch || similarity > bestMatch.similarity) {
                bestMatch = { text: candidate.text, similarity };
            }

            if (similarity >= 0.3 && similarity < threshold) {
                relatedSkills.push({ text: candidate.text, similarity });
            }
        }

        // Déterminer si c'est un gap
        if (!bestMatch || bestMatch.similarity < threshold) {
            // Déterminer la priorité basée sur des mots-clés
            let priority: SemanticGap["priority"] = "nice_to_have";
            const reqLower = requirement.toLowerCase();

            if (reqLower.includes("obligatoire") || reqLower.includes("requis") || reqLower.includes("indispensable")) {
                priority = "critical";
            } else if (reqLower.includes("souhaité") || reqLower.includes("idéalement") || reqLower.includes("apprécié")) {
                priority = "important";
            }

            // Générer des suggestions
            const suggestions = relatedSkills
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 3)
                .map(s => `${s.text} (${Math.round(s.similarity * 100)}% similaire)`);

            gaps.push({
                requirement,
                bestMatch: bestMatch?.text || null,
                similarity: bestMatch?.similarity || 0,
                suggestions,
                priority,
            });
        }
    }

    // Trier par priorité
    const priorityOrder = { critical: 0, important: 1, nice_to_have: 2 };
    return gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// ============================================================================
// CONCEPT CLUSTERING
// ============================================================================

/**
 * Regroupe les concepts similaires en clusters
 */
export function clusterConcepts(
    concepts: string[],
    numClusters: number = 5
): ConceptCluster[] {
    if (concepts.length === 0) return [];

    // Générer les embeddings
    const conceptVectors = concepts.map(concept => ({
        text: concept,
        embedding: generateSimulatedEmbedding(concept),
    }));

    // K-means simplifié
    const clusters = kMeansClustering(conceptVectors, Math.min(numClusters, concepts.length));

    return clusters.map((cluster, idx) => {
        // Calculer le centroïd
        const centroid = cluster.reduce(
            (acc, item) => acc.map((v, i) => v + item.embedding[i] / cluster.length),
            new Array(cluster[0].embedding.length).fill(0)
        );

        // Calculer la cohérence (similarité moyenne intra-cluster)
        let coherence = 1;
        if (cluster.length > 1) {
            const similarities: number[] = [];
            for (let i = 0; i < cluster.length; i++) {
                for (let j = i + 1; j < cluster.length; j++) {
                    similarities.push(cosineSimilarity(cluster[i].embedding, cluster[j].embedding));
                }
            }
            coherence = similarities.reduce((a, b) => a + b, 0) / similarities.length;
        }

        // Nommer le cluster basé sur le concept le plus central
        let mostCentralIdx = 0;
        let maxSimilarity = 0;
        cluster.forEach((item, i) => {
            const sim = cosineSimilarity(item.embedding, centroid);
            if (sim > maxSimilarity) {
                maxSimilarity = sim;
                mostCentralIdx = i;
            }
        });

        return {
            id: `cluster_${idx}`,
            name: cluster[mostCentralIdx].text,
            concepts: cluster.map(c => c.text),
            centroid,
            coherence,
        };
    });
}

/**
 * Algorithme K-means simplifié
 */
function kMeansClustering(
    items: { text: string; embedding: number[] }[],
    k: number,
    maxIterations: number = 10
): { text: string; embedding: number[] }[][] {
    if (items.length <= k) {
        return items.map(item => [item]);
    }

    // Initialisation aléatoire des centroïds
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    let centroids = shuffled.slice(0, k).map(item => [...item.embedding]);

    let clusters: { text: string; embedding: number[] }[][] = [];

    for (let iter = 0; iter < maxIterations; iter++) {
        // Assigner chaque item au cluster le plus proche
        clusters = Array.from({ length: k }, () => []);

        for (const item of items) {
            let bestCluster = 0;
            let bestSimilarity = -1;

            for (let c = 0; c < k; c++) {
                const similarity = cosineSimilarity(item.embedding, centroids[c]);
                if (similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    bestCluster = c;
                }
            }

            clusters[bestCluster].push(item);
        }

        // Recalculer les centroïds
        const newCentroids = clusters.map((cluster, idx) => {
            if (cluster.length === 0) return centroids[idx];

            return cluster.reduce(
                (acc, item) => acc.map((v, i) => v + item.embedding[i] / cluster.length),
                new Array(items[0].embedding.length).fill(0)
            );
        });

        centroids = newCentroids;
    }

    // Filtrer les clusters vides
    return clusters.filter(c => c.length > 0);
}

// ============================================================================
// FULL SEMANTIC ANALYSIS
// ============================================================================

/**
 * Effectue une analyse sémantique complète CV vs Offre
 */
export function performSemanticAnalysis(
    candidateProfile: {
        skills: string[];
        experiences: string[];
        summary?: string;
    },
    jobOffer: {
        requirements: string[];
        description: string;
        keywords: string[];
    }
): SemanticAnalysisResult {
    logger.info("[semantic-analysis] Démarrage analyse sémantique");

    // 1. Calculer la similarité globale
    const candidateText = [
        ...candidateProfile.skills,
        ...candidateProfile.experiences,
        candidateProfile.summary || "",
    ].join(" ");

    const jobText = [
        ...jobOffer.requirements,
        jobOffer.description,
        ...jobOffer.keywords,
    ].join(" ");

    const overallSimilarity = calculateSemanticSimilarity(candidateText, jobText);

    // 2. Matcher les compétences
    const skillMatches = findSemanticMatches(
        candidateProfile.skills,
        [...jobOffer.requirements, ...jobOffer.keywords],
        0.4
    );

    // 3. Matcher les expériences
    const experienceMatches = findSemanticMatches(
        candidateProfile.experiences,
        [jobOffer.description],
        0.3
    );

    // 4. Analyser les gaps
    const gaps = analyzeSemanticGaps(
        jobOffer.requirements,
        candidateProfile.skills,
        0.5
    );

    // 5. Clustering des compétences
    const allConcepts = [...candidateProfile.skills, ...jobOffer.keywords];
    const clusters = clusterConcepts(allConcepts, 6);

    // 6. Générer les insights
    const insights = generateInsights(skillMatches, gaps, overallSimilarity);

    logger.info("[semantic-analysis] Analyse terminée", {
        overallSimilarity,
        skillMatchCount: skillMatches.length,
        gapCount: gaps.length,
        clusterCount: clusters.length,
    });

    return {
        overallSimilarity,
        skillMatches,
        experienceMatches,
        gaps,
        clusters,
        insights,
    };
}

/**
 * Génère des insights basés sur l'analyse
 */
function generateInsights(
    skillMatches: SemanticMatch[],
    gaps: SemanticGap[],
    overallSimilarity: number
): string[] {
    const insights: string[] = [];

    // Insight sur la similarité globale
    if (overallSimilarity >= 0.7) {
        insights.push("Excellente correspondance globale avec l'offre");
    } else if (overallSimilarity >= 0.5) {
        insights.push("Bonne correspondance avec l'offre, quelques ajustements possibles");
    } else {
        insights.push("Correspondance partielle, considérer des formations complémentaires");
    }

    // Insight sur les compétences
    const exactMatches = skillMatches.filter(m => m.matchType === "exact");
    const synonymMatches = skillMatches.filter(m => m.matchType === "synonym");

    if (exactMatches.length > 0) {
        insights.push(`${exactMatches.length} compétence(s) correspondent exactement aux besoins`);
    }

    if (synonymMatches.length > 0) {
        insights.push(`${synonymMatches.length} compétence(s) équivalentes détectées (synonymes métier)`);
    }

    // Insight sur les gaps
    const criticalGaps = gaps.filter(g => g.priority === "critical");
    const importantGaps = gaps.filter(g => g.priority === "important");

    if (criticalGaps.length > 0) {
        insights.push(`⚠️ ${criticalGaps.length} compétence(s) critique(s) manquante(s)`);
    }

    if (importantGaps.length > 0) {
        insights.push(`${importantGaps.length} compétence(s) souhaitée(s) à développer`);
    }

    if (gaps.length === 0) {
        insights.push("✓ Toutes les compétences requises sont couvertes");
    }

    return insights;
}

// ============================================================================
// EXPORTS HELPERS
// ============================================================================

/**
 * Trouve les synonymes métier d'un terme
 */
export function findBusinessSynonyms(term: string): string[] {
    const termLower = term.toLowerCase();

    // Chercher dans les synonymes
    for (const [key, synonyms] of Object.entries(BUSINESS_SYNONYMS)) {
        if (key === termLower || synonyms.includes(termLower)) {
            return [key, ...synonyms].filter(s => s !== termLower);
        }
    }

    // Chercher dans les équivalents techniques
    for (const [key, equivalents] of Object.entries(TECHNICAL_EQUIVALENTS)) {
        if (key === termLower || equivalents.includes(termLower)) {
            return [key, ...equivalents].filter(s => s !== termLower);
        }
    }

    return [];
}

/**
 * Suggère des améliorations de formulation pour le CV
 */
export function suggestFormulationImprovements(
    cvText: string,
    jobKeywords: string[]
): Array<{ original: string; suggestion: string; reason: string }> {
    const suggestions: Array<{ original: string; suggestion: string; reason: string }> = [];

    for (const keyword of jobKeywords) {
        const synonyms = findBusinessSynonyms(keyword);
        const keywordLower = keyword.toLowerCase();

        // Vérifier si un synonyme est utilisé au lieu du mot-clé de l'offre
        for (const synonym of synonyms) {
            if (cvText.toLowerCase().includes(synonym) && !cvText.toLowerCase().includes(keywordLower)) {
                suggestions.push({
                    original: synonym,
                    suggestion: keyword,
                    reason: `Utiliser "${keyword}" (terme de l'offre) plutôt que "${synonym}" pour optimiser l'ATS`,
                });
            }
        }
    }

    return suggestions;
}
