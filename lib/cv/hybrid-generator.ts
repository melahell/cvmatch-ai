/**
 * GÉNÉRATEUR HYBRIDE CV
 *
 * Orchestre la génération CV en 2 modes :
 * - Mode Rapide : Algorithme adaptatif seul (<500ms, gratuit)
 * - Mode Optimisé : Gemini + Algorithme adaptatif (10-20s, premium)
 */

import { generateAdaptiveCV } from "./adaptive-algorithm";
import { ThemeId, RAGData, JobOffer, UserPreferences, AdaptedContent, CVGenerationMode } from "./types";
import { getCVOptimizationPrompt } from "../ai/prompts";
import { generateWithGemini } from "../ai/gemini";

export interface HybridGeneratorInput {
  rag_data: RAGData;
  job_offer?: JobOffer | null;
  theme_id: ThemeId;
  mode: CVGenerationMode;
  user_prefs?: UserPreferences;
}

export interface HybridGeneratorResult {
  success: boolean;
  adapted_content: AdaptedContent;
  mode_used: CVGenerationMode;
  metadata: {
    generation_time_ms: number;
    mode: CVGenerationMode;
    gemini_tokens_used?: number;
    optimizations_applied?: string[];
    quality_indicators: {
      detailed_experiences_count: number;
      total_experiences_count: number;
      total_achievements_count: number;
      avg_relevance_score: number;
    };
  };
  warnings: string[];
  error?: string;
}

/**
 * Générer CV selon le mode choisi
 */
export async function generateHybridCV(
  input: HybridGeneratorInput
): Promise<HybridGeneratorResult> {
  const startTime = Date.now();
  const { rag_data, job_offer, theme_id, mode, user_prefs = {} } = input;

  try {
    // Convertir undefined en null pour la compatibilité TypeScript
    const normalizedJobOffer = job_offer ?? null;

    if (mode === "rapid") {
      // MODE RAPIDE : Algorithme adaptatif seul
      return await generateRapidCV(rag_data, normalizedJobOffer, theme_id, user_prefs, startTime);
    } else {
      // MODE OPTIMISÉ : Gemini + Algorithme adaptatif
      return await generateOptimizedCV(rag_data, normalizedJobOffer, theme_id, user_prefs, startTime);
    }
  } catch (error: any) {
    // Si mode optimisé échoue, fallback vers rapid
    if (mode === "optimized") {
      console.warn("Optimized mode failed, falling back to rapid mode:", error);
      const normalizedJobOffer = job_offer ?? null;
      return await generateRapidCV(
        rag_data,
        normalizedJobOffer,
        theme_id,
        user_prefs,
        startTime,
        {
          fallback: true,
          fallback_reason: error.message
        }
      );
    }

    throw error;
  }
}

/**
 * MODE RAPIDE : Algorithme adaptatif seul
 */
async function generateRapidCV(
  ragData: RAGData,
  jobOffer: JobOffer | null,
  themeId: ThemeId,
  userPrefs: UserPreferences,
  startTime: number,
  options?: { fallback?: boolean; fallback_reason?: string }
): Promise<HybridGeneratorResult> {
  // Générer CV adapté directement
  const adaptedContent = generateAdaptiveCV(ragData, jobOffer || null, themeId, {
    include_photo: userPrefs.include_photo ?? true
  });

  const generationTime = Date.now() - startTime;

  // Calculer quality indicators
  const detailedCount = adaptedContent.sections.experiences.filter(
    (e: any) => e.format === "detailed"
  ).length;

  const totalAchievements = adaptedContent.sections.experiences.reduce(
    (sum: number, e: any) => sum + e.content.achievements.length,
    0
  );

  const avgRelevanceScore =
    adaptedContent.sections.experiences.length > 0
      ? adaptedContent.sections.experiences.reduce((sum: number, e: any) => sum + e.relevance_score, 0) /
      adaptedContent.sections.experiences.length
      : 0;

  const warnings = [...adaptedContent.warnings];

  if (options?.fallback) {
    warnings.unshift(
      `⚠️ Mode optimisé échoué (${options.fallback_reason}), fallback vers mode rapide`
    );
  }

  return {
    success: true,
    adapted_content: adaptedContent,
    mode_used: "rapid",
    metadata: {
      generation_time_ms: generationTime,
      mode: "rapid",
      quality_indicators: {
        detailed_experiences_count: detailedCount,
        total_experiences_count: adaptedContent.sections.experiences.length,
        total_achievements_count: totalAchievements,
        avg_relevance_score: avgRelevanceScore
      }
    },
    warnings
  };
}

/**
 * MODE OPTIMISÉ : Gemini + Algorithme adaptatif
 */
async function generateOptimizedCV(
  ragData: RAGData,
  jobOffer: JobOffer | null,
  themeId: ThemeId,
  userPrefs: UserPreferences,
  startTime: number
): Promise<HybridGeneratorResult> {
  // ÉTAPE 1 : Optimisation Gemini du contenu
  const geminiStartTime = Date.now();

  const optimizationsApplied: string[] = [];
  let geminiTokensUsed = 0;

  try {
    // Construire le prompt Gemini
    const jobDescription = jobOffer?.description || "";
    const customNotes = userPrefs.custom_notes || "";

    const geminiPrompt = getCVOptimizationPrompt(ragData, jobDescription, customNotes);

    // Appeler Gemini
    const geminiText = await generateWithGemini({
      prompt: geminiPrompt
    });

    // Parser la réponse Gemini
    const optimizedRAGData = parseGeminiOptimization(geminiText, ragData);

    // Tracker les optimizations appliquées
    optimizationsApplied.push(...detectOptimizations(ragData, optimizedRAGData));

    // Note: Token count not available from current Gemini wrapper
    geminiTokensUsed = 0;

    const geminiTime = Date.now() - geminiStartTime;
    console.log(`[Hybrid] Gemini optimization completed in ${geminiTime}ms`);

    // ÉTAPE 2 : Passer le contenu optimisé à l'algorithme adaptatif
    const adaptedContent = generateAdaptiveCV(
      optimizedRAGData,
      jobOffer || null,
      themeId,
      {
        include_photo: userPrefs.include_photo ?? true
      }
    );

    const totalTime = Date.now() - startTime;

    // Calculer quality indicators
    const detailedCount = adaptedContent.sections.experiences.filter(
      (e: any) => e.format === "detailed"
    ).length;

    const totalAchievements = adaptedContent.sections.experiences.reduce(
      (sum: number, e: any) => sum + e.content.achievements.length,
      0
    );

    const avgRelevanceScore =
      adaptedContent.sections.experiences.length > 0
        ? adaptedContent.sections.experiences.reduce((sum: number, e: any) => sum + e.relevance_score, 0) /
        adaptedContent.sections.experiences.length
        : 0;

    return {
      success: true,
      adapted_content: adaptedContent,
      mode_used: "optimized",
      metadata: {
        generation_time_ms: totalTime,
        mode: "optimized",
        gemini_tokens_used: geminiTokensUsed,
        optimizations_applied: optimizationsApplied,
        quality_indicators: {
          detailed_experiences_count: detailedCount,
          total_experiences_count: adaptedContent.sections.experiences.length,
          total_achievements_count: totalAchievements,
          avg_relevance_score: avgRelevanceScore
        }
      },
      warnings: adaptedContent.warnings
    };
  } catch (error: any) {
    console.error("[Hybrid] Gemini optimization error:", error);
    throw new Error(`Gemini optimization failed: ${error.message}`);
  }
}

/**
 * Parser la réponse Gemini et merger avec RAG data
 */
function parseGeminiOptimization(geminiText: string, originalRAG: RAGData): RAGData {
  try {
    // Extraire JSON de la réponse Gemini
    const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("[Hybrid] No JSON found in Gemini response, using original RAG");
      return originalRAG;
    }

    const optimizedData = JSON.parse(jsonMatch[0]);

    // Merger avec les données originales (préserver structure)
    return {
      profil: {
        ...originalRAG.profil,
        elevator_pitch: optimizedData.profil?.elevator_pitch || originalRAG.profil.elevator_pitch
      },
      experiences: mergeExperiences(originalRAG.experiences, optimizedData.experiences || []),
      competences: originalRAG.competences, // On garde les compétences originales
      formations_certifications: originalRAG.formations_certifications,
      projets: originalRAG.projets
    };
  } catch (error) {
    console.error("[Hybrid] Failed to parse Gemini optimization:", error);
    return originalRAG; // Fallback vers données originales
  }
}

/**
 * Merger les expériences optimisées par Gemini avec les originales
 */
function mergeExperiences(
  originalExps: any[],
  optimizedExps: any[]
): any[] {
  if (!optimizedExps || optimizedExps.length === 0) {
    return originalExps;
  }

  return originalExps.map((origExp, index) => {
    const optimizedExp = optimizedExps[index];
    if (!optimizedExp) {
      return origExp;
    }

    return {
      ...origExp,
      // Merger les réalisations (Gemini optimise les descriptions)
      realisations:
        optimizedExp.realisations?.map((optReal: any, idx: number) => ({
          description: optReal.description || origExp.realisations?.[idx]?.description || "",
          impact_score: origExp.realisations?.[idx]?.impact_score || 50
        })) || origExp.realisations,
      // Garder le contexte original (structure spatiale gérée par algorithme)
      contexte: optimizedExp.contexte || origExp.contexte
    };
  });
}

/**
 * Détecter les optimizations appliquées par Gemini
 */
function detectOptimizations(original: RAGData, optimized: RAGData): string[] {
  const optimizations: string[] = [];

  // Vérifier elevator pitch
  if (
    optimized.profil.elevator_pitch &&
    optimized.profil.elevator_pitch !== original.profil.elevator_pitch
  ) {
    optimizations.push("Reformulation elevator pitch professionnel");
  }

  // Vérifier quantifications dans achievements
  let quantificationCount = 0;
  optimized.experiences.forEach((exp, i) => {
    exp.realisations?.forEach((real: any, j: number) => {
      const origReal = original.experiences[i]?.realisations?.[j]?.description || "";
      if (hasMoreQuantification(real.description, origReal)) {
        quantificationCount++;
      }
    });
  });

  if (quantificationCount > 0) {
    optimizations.push(
      `Ajout de ${quantificationCount} quantification(s) dans les réalisations`
    );
  }

  // Vérifier mots-clés ATS (si on peut détecter)
  const hasATSKeywords = detectATSKeywords(optimized);
  if (hasATSKeywords) {
    optimizations.push("Injection mots-clés ATS pertinents");
  }

  // Vérifier adaptation tonalité
  const toneAdaptation = detectToneAdaptation(optimized);
  if (toneAdaptation) {
    optimizations.push(`Adaptation tonalité ${toneAdaptation}`);
  }

  return optimizations.length > 0
    ? optimizations
    : ["Optimisation AI du contenu appliquée"];
}

/**
 * Vérifier si une réalisation a plus de quantifications
 */
function hasMoreQuantification(optimized: string, original: string): boolean {
  const countQuantifications = (text: string): number => {
    const patterns = [
      /\d+%/g,
      /\d+\s*(k|K|M|millions?)/g,
      /\d+\s*€/g,
      /\d+\s*\$/g,
      /\d+x/g
    ];
    return patterns.reduce((count, pattern) => {
      const matches = text.match(pattern);
      return count + (matches?.length || 0);
    }, 0);
  };

  return countQuantifications(optimized) > countQuantifications(original);
}

/**
 * Détecter présence mots-clés ATS
 */
function detectATSKeywords(data: RAGData): boolean {
  // Liste simplifiée de mots-clés ATS courants
  const atsKeywords = [
    "microservices",
    "kubernetes",
    "docker",
    "ci/cd",
    "agile",
    "scrum",
    "leadership",
    "management",
    "architecture"
  ];

  const allText = JSON.stringify(data).toLowerCase();
  return atsKeywords.some((keyword) => allText.includes(keyword));
}

/**
 * Détecter adaptation tonalité
 */
function detectToneAdaptation(data: RAGData): string | null {
  const pitch = data.profil.elevator_pitch?.toLowerCase() || "";

  if (pitch.includes("stratégique") || pitch.includes("expertise")) {
    return "formel/executive";
  }

  if (pitch.includes("passionné") || pitch.includes("innovant")) {
    return "dynamique/startup";
  }

  return null;
}

/**
 * Générer plusieurs variantes (rapid + optimized)
 */
export async function generateMultiModeVariants(
  input: Omit<HybridGeneratorInput, "mode">
): Promise<{
  rapid: HybridGeneratorResult;
  optimized: HybridGeneratorResult;
}> {
  const [rapid, optimized] = await Promise.all([
    generateHybridCV({ ...input, mode: "rapid" }),
    generateHybridCV({ ...input, mode: "optimized" })
  ]);

  return { rapid, optimized };
}
