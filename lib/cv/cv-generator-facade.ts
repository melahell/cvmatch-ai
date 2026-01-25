/**
 * CV Generator Facade - Point d'entrée unifié pour la génération de CV
 *
 * [AUDIT FIX IMPORTANT-7] : Implémente un fallback automatique V2 → V1
 * Si V2 échoue ou produit un résultat de mauvaise qualité, bascule vers V1.
 */

import { logger } from "@/lib/utils/logger";

export interface GeneratorInput {
    userId: string;
    analysisId: string;
    template?: string;
    includePhoto?: boolean;
    matchContextSelection?: any;
}

export interface GeneratorResult {
    success: boolean;
    cvId?: string;
    cvData?: any;
    generatorUsed: "v1" | "v2";
    fallbackReason?: string;
    qualityMetrics?: {
        ragCompletenessScore?: number;
        groundingPercentage?: number;
        advancedScoringApplied?: boolean;
    };
    error?: string;
}

export interface GeneratorQualityThresholds {
    minGroundingPercentage: number;
    minWidgetsCount: number;
    minExperiencesCount: number;
}

const DEFAULT_QUALITY_THRESHOLDS: GeneratorQualityThresholds = {
    minGroundingPercentage: 70,
    minWidgetsCount: 10,
    minExperiencesCount: 1,
};

/**
 * [AUDIT FIX IMPORTANT-7] : Vérifie si le résultat V2 est de qualité suffisante
 */
function isV2ResultAcceptable(
    result: any,
    thresholds: GeneratorQualityThresholds
): { acceptable: boolean; reason?: string } {
    // Vérifier grounding
    const groundingPercentage = result?.qualityMetrics?.groundingPercentage || 0;
    if (groundingPercentage < thresholds.minGroundingPercentage) {
        return {
            acceptable: false,
            reason: `Grounding insuffisant: ${groundingPercentage}% < ${thresholds.minGroundingPercentage}%`,
        };
    }

    // Vérifier widgets
    const widgetsTotal = result?.widgetsTotal || 0;
    if (widgetsTotal < thresholds.minWidgetsCount) {
        return {
            acceptable: false,
            reason: `Widgets insuffisants: ${widgetsTotal} < ${thresholds.minWidgetsCount}`,
        };
    }

    // Vérifier expériences
    const experiencesCount = result?.cvData?.experiences?.length || 0;
    if (experiencesCount < thresholds.minExperiencesCount) {
        return {
            acceptable: false,
            reason: `Expériences insuffisantes: ${experiencesCount} < ${thresholds.minExperiencesCount}`,
        };
    }

    return { acceptable: true };
}

/**
 * [AUDIT FIX IMPORTANT-7] : Génère un CV avec fallback automatique V2 → V1
 *
 * Workflow:
 * 1. Essaie V2 (widgets + bridge)
 * 2. Si V2 échoue ou qualité insuffisante → fallback V1 (monolithique)
 * 3. Retourne le résultat avec indication du générateur utilisé
 */
export async function generateCVWithFallback(
    input: GeneratorInput,
    options?: {
        preferV1?: boolean;
        thresholds?: Partial<GeneratorQualityThresholds>;
        apiBaseUrl?: string;
        authHeaders?: Record<string, string>;
    }
): Promise<GeneratorResult> {
    const thresholds: GeneratorQualityThresholds = {
        ...DEFAULT_QUALITY_THRESHOLDS,
        ...(options?.thresholds || {}),
    };

    const apiBaseUrl = options?.apiBaseUrl || "";
    const authHeaders = options?.authHeaders || {};

    // Si préférence explicite pour V1, l'utiliser directement
    if (options?.preferV1) {
        logger.info("[cv-generator-facade] Préférence V1 explicite, utilisation directe");
        return generateWithV1(input, apiBaseUrl, authHeaders);
    }

    // Essayer V2 d'abord
    logger.info("[cv-generator-facade] Tentative génération V2");

    try {
        const v2Result = await generateWithV2(input, apiBaseUrl, authHeaders);

        if (v2Result.success) {
            // Vérifier la qualité du résultat V2
            const qualityCheck = isV2ResultAcceptable(v2Result, thresholds);

            if (qualityCheck.acceptable) {
                logger.info("[cv-generator-facade] V2 réussi avec qualité acceptable", {
                    groundingPercentage: v2Result.qualityMetrics?.groundingPercentage,
                });
                return {
                    ...v2Result,
                    generatorUsed: "v2",
                };
            }

            // Qualité insuffisante → fallback V1
            logger.warn("[cv-generator-facade] V2 qualité insuffisante, fallback V1", {
                reason: qualityCheck.reason,
            });

            const v1Result = await generateWithV1(input, apiBaseUrl, authHeaders);
            return {
                ...v1Result,
                generatorUsed: "v1",
                fallbackReason: `V2 qualité insuffisante: ${qualityCheck.reason}`,
            };
        }

        // V2 a échoué → fallback V1
        logger.warn("[cv-generator-facade] V2 échec, fallback V1", {
            error: v2Result.error,
        });

        const v1Result = await generateWithV1(input, apiBaseUrl, authHeaders);
        return {
            ...v1Result,
            generatorUsed: "v1",
            fallbackReason: `V2 erreur: ${v2Result.error}`,
        };

    } catch (error: any) {
        logger.error("[cv-generator-facade] V2 exception, fallback V1", { error });

        try {
            const v1Result = await generateWithV1(input, apiBaseUrl, authHeaders);
            return {
                ...v1Result,
                generatorUsed: "v1",
                fallbackReason: `V2 exception: ${error.message}`,
            };
        } catch (v1Error: any) {
            // Les deux ont échoué
            logger.error("[cv-generator-facade] V1 et V2 ont échoué", { v1Error, v2Error: error });
            return {
                success: false,
                generatorUsed: "v1",
                error: `V2: ${error.message}, V1: ${v1Error.message}`,
            };
        }
    }
}

/**
 * Appelle l'API V2
 */
async function generateWithV2(
    input: GeneratorInput,
    apiBaseUrl: string,
    authHeaders: Record<string, string>
): Promise<GeneratorResult> {
    const response = await fetch(`${apiBaseUrl}/api/cv/generate-v2`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders,
        },
        body: JSON.stringify({
            analysisId: input.analysisId,
            template: input.template,
            includePhoto: input.includePhoto,
            matchContextSelection: input.matchContextSelection,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        return {
            success: false,
            generatorUsed: "v2",
            error: data.error || `HTTP ${response.status}`,
        };
    }

    return {
        success: true,
        cvId: data.cvId,
        cvData: data.cvData,
        generatorUsed: "v2",
        qualityMetrics: data.qualityMetrics,
    };
}

/**
 * Appelle l'API V1
 */
async function generateWithV1(
    input: GeneratorInput,
    apiBaseUrl: string,
    authHeaders: Record<string, string>
): Promise<GeneratorResult> {
    const response = await fetch(`${apiBaseUrl}/api/cv/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders,
        },
        body: JSON.stringify({
            analysisId: input.analysisId,
            template: input.template,
            includePhoto: input.includePhoto,
            matchContextSelection: input.matchContextSelection,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        return {
            success: false,
            generatorUsed: "v1",
            error: data.error || `HTTP ${response.status}`,
        };
    }

    return {
        success: true,
        cvId: data.cvId,
        cvData: data.cvData,
        generatorUsed: "v1",
    };
}

/**
 * Hook React pour utiliser le générateur avec fallback
 * (Exemple d'utilisation côté client)
 */
export function createCVGeneratorClient(authToken: string, apiBaseUrl: string = "") {
    return {
        generate: async (input: Omit<GeneratorInput, "userId">) => {
            return generateCVWithFallback(
                { ...input, userId: "" }, // userId sera extrait du token côté serveur
                {
                    apiBaseUrl,
                    authHeaders: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
        },
    };
}
