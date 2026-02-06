/**
 * Client-Side Bridge pour conversion widgets → CVData
 * 
 * Cette version est identique à ai-adapter.ts mais optimisée pour usage côté client.
 * Elle peut être importée dans les composants React sans problème de SSR.
 * 
 * Inclut validation anti-hallucination avant conversion.
 * 
 * Usage:
 * ```ts
 * import { convertWidgetsToCV, convertWidgetsToCVWithValidation } from '@/lib/cv/client-bridge';
 * const cvData = convertWidgetsToCV(widgetsEnvelope, { minScore: 50 });
 * // Ou avec validation :
 * const { cvData, warnings } = convertWidgetsToCVWithValidation(widgetsEnvelope, ragProfile, { minScore: 50 });
 * ```
 */

import { convertAndSort, type ConvertOptions } from "./ai-adapter";
import { validateWidgetsEnvelope, type ValidationResult, type ValidationWarning } from "./widget-validator";
import { rescoreWidgetsWithAdvanced } from "./advanced-scoring";
import type { AIWidgetsEnvelope } from "./ai-widgets";
import type { RendererResumeSchema } from "./renderer-schema";
import type { JobOfferContext } from "./relevance-scoring";
import { logger } from "@/lib/utils/logger";

// Réexporter fonction de base (sans validation)
export { convertAndSort as convertWidgetsToCV, type ConvertOptions };

// Alias pour compatibilité
export { convertAndSort };

/**
 * Convertit widgets → CVData avec validation anti-hallucination
 * 
 * @param envelope - Envelope de widgets à convertir
 * @param ragProfile - Profil RAG source pour validation
 * @param options - Options de conversion
 * @returns CVData + warnings de validation
 */
export function convertWidgetsToCVWithValidation(
    envelope: AIWidgetsEnvelope,
    ragProfile: any,
    options?: ConvertOptions
): {
    cvData: RendererResumeSchema;
    validation: ValidationResult;
} {
    // 1. Valider widgets contre RAG source
    const validation = validateWidgetsEnvelope(envelope, ragProfile);

    // 2. Créer envelope avec widgets validés uniquement
    const validatedEnvelope: AIWidgetsEnvelope = {
        ...envelope,
        widgets: validation.validWidgets,
    };

    // 3. Convertir widgets validés
    const cvData = convertAndSort(validatedEnvelope, options);

    return {
        cvData,
        validation,
    };
}

/**
 * Convertit widgets → CVData avec scoring avancé + validation
 * 
 * Re-score les widgets avec scoring multi-critères avant conversion
 * pour améliorer la sélection du contenu.
 * 
 * @param envelope - Envelope de widgets à convertir
 * @param ragProfile - Profil RAG source pour validation et scoring
 * @param jobOffer - Contexte offre d'emploi pour scoring avancé
 * @param options - Options de conversion
 * @param useAdvancedScoring - Activer scoring avancé (défaut: true)
 * @returns CVData + warnings de validation
 */
export function convertWidgetsToCVWithAdvancedScoring(
    envelope: AIWidgetsEnvelope,
    ragProfile: any,
    jobOffer?: JobOfferContext | null,
    options?: ConvertOptions,
    useAdvancedScoring: boolean = true
): {
    cvData: RendererResumeSchema;
    validation: ValidationResult;
} {
    // DEBUG: Log entrée
    console.log("[convertWidgetsToCVWithAdvancedScoring] INPUT:", {
        nbWidgetsEnvelope: envelope.widgets.length,
        experienceWidgetsCount: envelope.widgets.filter(w => w.section === "experiences").length,
    });

    // 1. Valider widgets contre RAG source
    const validation = validateWidgetsEnvelope(envelope, ragProfile);

    // DEBUG: Log après validation
    console.log("[convertWidgetsToCVWithAdvancedScoring] POST-VALIDATION:", {
        nbValidWidgets: validation.validWidgets.length,
        experienceWidgetsValides: validation.validWidgets.filter(w => w.section === "experiences").length,
        stats: validation.stats,
    });

    // 2. Re-scorer avec scoring avancé si activé
    let widgetsToConvert = validation.validWidgets;
    if (useAdvancedScoring && jobOffer) {
        logger.debug("[client-bridge] Advanced scoring activé", {
            widgetsCount: validation.validWidgets.length,
            hasJobOffer: !!jobOffer,
            hasRAGProfile: !!ragProfile,
        });
        widgetsToConvert = rescoreWidgetsWithAdvanced(validation.validWidgets, {
            jobOffer,
            ragProfile,
        });
        // Logger quelques scores pour vérification
        const sampleScores = widgetsToConvert.slice(0, 3).map(w => ({
            id: w.id,
            originalScore: validation.validWidgets.find(ow => ow.id === w.id)?.relevance_score || 0,
            advancedScore: w.relevance_score,
        }));
        logger.debug("[client-bridge] Advanced scoring appliqué", { sampleScores });
    } else {
        logger.debug("[client-bridge] Advanced scoring désactivé", {
            useAdvancedScoring,
            hasJobOffer: !!jobOffer,
        });
    }

    // 3. Créer envelope avec widgets validés et re-scorés
    const processedEnvelope: AIWidgetsEnvelope = {
        ...envelope,
        widgets: widgetsToConvert,
    };

    // 4. Convertir widgets
    const cvData = convertAndSort(processedEnvelope, options);

    return {
        cvData,
        validation,
    };
}

// Export types
export type { ValidationResult, ValidationWarning };
