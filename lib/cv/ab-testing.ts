/**
 * A/B Testing System - Comparaison V1 vs V2 avec métriques
 *
 * [AMÉLIORATION P0-2] : Système complet d'A/B testing pour évaluer
 * automatiquement quel générateur produit les meilleurs CVs.
 *
 * Métriques trackées:
 * - Taux de téléchargement PDF
 * - Temps passé sur preview
 * - Feedback utilisateur (thumbs up/down)
 * - Score de complétion
 * - Erreurs et fallbacks
 */

import { createSupabaseAdminClient } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

// ============================================================================
// TYPES
// ============================================================================

export type GeneratorVariant = "v1" | "v2" | "v2_with_fallback";

export interface ABTestConfig {
    enabled: boolean;
    v1Weight: number;      // 0-100, pourcentage de trafic vers V1
    v2Weight: number;      // 0-100, pourcentage de trafic vers V2
    minimumSampleSize: number;
    significanceThreshold: number; // p-value threshold (ex: 0.05)
}

export interface ABTestAssignment {
    userId: string;
    variant: GeneratorVariant;
    assignedAt: string;
    experimentId: string;
}

export interface CVGenerationEvent {
    id?: string;
    userId: string;
    cvId: string;
    variant: GeneratorVariant;
    experimentId: string;
    timestamp: string;
    metrics: {
        generationTimeMs: number;
        widgetsCount?: number;
        groundingScore?: number;
        ragCompletenessScore?: number;
        hadFallback: boolean;
        errorOccurred: boolean;
    };
}

export interface CVInteractionEvent {
    id?: string;
    userId: string;
    cvId: string;
    variant: GeneratorVariant;
    experimentId: string;
    eventType: "preview_view" | "preview_time" | "pdf_download" | "feedback_positive" | "feedback_negative" | "edit_made";
    eventValue?: number; // Pour preview_time en secondes
    timestamp: string;
}

export interface ABTestResults {
    experimentId: string;
    startedAt: string;
    sampleSize: {
        v1: number;
        v2: number;
    };
    metrics: {
        v1: VariantMetrics;
        v2: VariantMetrics;
    };
    winner: GeneratorVariant | null;
    confidence: number;
    isSignificant: boolean;
}

export interface VariantMetrics {
    totalGenerations: number;
    avgGenerationTimeMs: number;
    avgGroundingScore: number;
    errorRate: number;
    fallbackRate: number;
    pdfDownloadRate: number;
    avgPreviewTimeSeconds: number;
    positiveReedbackRate: number;
    negativeReedbackRate: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: ABTestConfig = {
    enabled: true,
    v1Weight: 30,  // 30% vers V1
    v2Weight: 70,  // 70% vers V2
    minimumSampleSize: 100,
    significanceThreshold: 0.05,
};

const EXPERIMENT_TABLE = "ab_test_experiments";
const ASSIGNMENT_TABLE = "ab_test_assignments";
const GENERATION_EVENTS_TABLE = "ab_test_generation_events";
const INTERACTION_EVENTS_TABLE = "ab_test_interaction_events";

// ============================================================================
// EXPERIMENT MANAGEMENT
// ============================================================================

/**
 * Crée ou récupère l'expérience A/B active
 */
export async function getActiveExperiment(): Promise<{
    id: string;
    config: ABTestConfig;
    startedAt: string;
} | null> {
    const supabase = createSupabaseAdminClient();

    try {
        const { data, error } = await supabase
            .from(EXPERIMENT_TABLE)
            .select("*")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            id: data.id,
            config: data.config || DEFAULT_CONFIG,
            startedAt: data.created_at,
        };
    } catch (e) {
        return null;
    }
}

/**
 * Crée une nouvelle expérience A/B
 */
export async function createExperiment(config?: Partial<ABTestConfig>): Promise<string> {
    const supabase = createSupabaseAdminClient();
    const experimentConfig = { ...DEFAULT_CONFIG, ...config };

    // Désactiver les expériences précédentes
    await supabase
        .from(EXPERIMENT_TABLE)
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("status", "active");

    // Créer la nouvelle
    const { data, error } = await supabase
        .from(EXPERIMENT_TABLE)
        .insert({
            config: experimentConfig,
            status: "active",
            created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

    if (error) {
        throw new Error(`Failed to create experiment: ${error.message}`);
    }

    logger.info("[ab-testing] Nouvelle expérience créée", { id: data.id, config: experimentConfig });
    return data.id;
}

// ============================================================================
// VARIANT ASSIGNMENT
// ============================================================================

/**
 * Assigne un utilisateur à une variante (sticky assignment)
 */
export async function assignVariant(userId: string): Promise<ABTestAssignment> {
    const supabase = createSupabaseAdminClient();

    // Récupérer l'expérience active
    const experiment = await getActiveExperiment();
    if (!experiment) {
        // Pas d'expérience active, utiliser V2 par défaut
        return {
            userId,
            variant: "v2",
            assignedAt: new Date().toISOString(),
            experimentId: "default",
        };
    }

    // Vérifier si l'utilisateur a déjà une assignation
    const { data: existingAssignment } = await supabase
        .from(ASSIGNMENT_TABLE)
        .select("*")
        .eq("user_id", userId)
        .eq("experiment_id", experiment.id)
        .single();

    if (existingAssignment) {
        return {
            userId,
            variant: existingAssignment.variant,
            assignedAt: existingAssignment.assigned_at,
            experimentId: experiment.id,
        };
    }

    // Nouvelle assignation basée sur les poids
    const random = Math.random() * 100;
    const variant: GeneratorVariant = random < experiment.config.v1Weight ? "v1" : "v2";

    // Sauvegarder l'assignation
    await supabase.from(ASSIGNMENT_TABLE).insert({
        user_id: userId,
        experiment_id: experiment.id,
        variant,
        assigned_at: new Date().toISOString(),
    });

    logger.debug("[ab-testing] Utilisateur assigné", { userId, variant, experimentId: experiment.id });

    return {
        userId,
        variant,
        assignedAt: new Date().toISOString(),
        experimentId: experiment.id,
    };
}

/**
 * Récupère l'assignation d'un utilisateur
 */
export async function getAssignment(userId: string): Promise<ABTestAssignment | null> {
    const supabase = createSupabaseAdminClient();
    const experiment = await getActiveExperiment();

    if (!experiment) return null;

    const { data } = await supabase
        .from(ASSIGNMENT_TABLE)
        .select("*")
        .eq("user_id", userId)
        .eq("experiment_id", experiment.id)
        .single();

    if (!data) return null;

    return {
        userId,
        variant: data.variant,
        assignedAt: data.assigned_at,
        experimentId: experiment.id,
    };
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Track un événement de génération CV
 */
export async function trackGeneration(event: Omit<CVGenerationEvent, "id" | "timestamp">): Promise<void> {
    const supabase = createSupabaseAdminClient();

    try {
        await supabase.from(GENERATION_EVENTS_TABLE).insert({
            user_id: event.userId,
            cv_id: event.cvId,
            variant: event.variant,
            experiment_id: event.experimentId,
            metrics: event.metrics,
            created_at: new Date().toISOString(),
        });
    } catch (e) {
        logger.warn("[ab-testing] Erreur tracking génération", { error: e });
    }
}

/**
 * Track un événement d'interaction utilisateur
 */
export async function trackInteraction(event: Omit<CVInteractionEvent, "id" | "timestamp">): Promise<void> {
    const supabase = createSupabaseAdminClient();

    try {
        await supabase.from(INTERACTION_EVENTS_TABLE).insert({
            user_id: event.userId,
            cv_id: event.cvId,
            variant: event.variant,
            experiment_id: event.experimentId,
            event_type: event.eventType,
            event_value: event.eventValue,
            created_at: new Date().toISOString(),
        });
    } catch (e) {
        logger.warn("[ab-testing] Erreur tracking interaction", { error: e });
    }
}

/**
 * Raccourci pour tracker un téléchargement PDF
 */
export async function trackPDFDownload(userId: string, cvId: string): Promise<void> {
    const assignment = await getAssignment(userId);
    if (!assignment) return;

    await trackInteraction({
        userId,
        cvId,
        variant: assignment.variant,
        experimentId: assignment.experimentId,
        eventType: "pdf_download",
    });
}

/**
 * Raccourci pour tracker un feedback
 */
export async function trackFeedback(userId: string, cvId: string, isPositive: boolean): Promise<void> {
    const assignment = await getAssignment(userId);
    if (!assignment) return;

    await trackInteraction({
        userId,
        cvId,
        variant: assignment.variant,
        experimentId: assignment.experimentId,
        eventType: isPositive ? "feedback_positive" : "feedback_negative",
    });
}

/**
 * Raccourci pour tracker le temps de preview
 */
export async function trackPreviewTime(userId: string, cvId: string, seconds: number): Promise<void> {
    const assignment = await getAssignment(userId);
    if (!assignment) return;

    await trackInteraction({
        userId,
        cvId,
        variant: assignment.variant,
        experimentId: assignment.experimentId,
        eventType: "preview_time",
        eventValue: seconds,
    });
}

// ============================================================================
// ANALYSIS
// ============================================================================

/**
 * Calcule les résultats de l'expérience A/B
 */
export async function getExperimentResults(experimentId?: string): Promise<ABTestResults | null> {
    const supabase = createSupabaseAdminClient();

    // Récupérer l'expérience
    let expId = experimentId;
    if (!expId) {
        const active = await getActiveExperiment();
        if (!active) return null;
        expId = active.id;
    }

    const { data: experiment } = await supabase
        .from(EXPERIMENT_TABLE)
        .select("*")
        .eq("id", expId)
        .single();

    if (!experiment) return null;

    // Récupérer les événements de génération
    const { data: genEvents } = await supabase
        .from(GENERATION_EVENTS_TABLE)
        .select("*")
        .eq("experiment_id", expId);

    // Récupérer les événements d'interaction
    const { data: intEvents } = await supabase
        .from(INTERACTION_EVENTS_TABLE)
        .select("*")
        .eq("experiment_id", expId);

    // Calculer les métriques par variante
    const v1Gens = (genEvents || []).filter(e => e.variant === "v1");
    const v2Gens = (genEvents || []).filter(e => e.variant === "v2");
    const v1Ints = (intEvents || []).filter(e => e.variant === "v1");
    const v2Ints = (intEvents || []).filter(e => e.variant === "v2");

    const calculateMetrics = (
        gens: any[],
        ints: any[]
    ): VariantMetrics => {
        const total = gens.length || 1;
        const avgGenTime = gens.reduce((sum, g) => sum + (g.metrics?.generationTimeMs || 0), 0) / total;
        const avgGrounding = gens.reduce((sum, g) => sum + (g.metrics?.groundingScore || 0), 0) / total;
        const errors = gens.filter(g => g.metrics?.errorOccurred).length;
        const fallbacks = gens.filter(g => g.metrics?.hadFallback).length;

        const downloads = ints.filter(i => i.event_type === "pdf_download").length;
        const previews = ints.filter(i => i.event_type === "preview_time");
        const avgPreview = previews.reduce((sum, p) => sum + (p.event_value || 0), 0) / (previews.length || 1);
        const positive = ints.filter(i => i.event_type === "feedback_positive").length;
        const negative = ints.filter(i => i.event_type === "feedback_negative").length;

        return {
            totalGenerations: gens.length,
            avgGenerationTimeMs: Math.round(avgGenTime),
            avgGroundingScore: Math.round(avgGrounding),
            errorRate: errors / total,
            fallbackRate: fallbacks / total,
            pdfDownloadRate: downloads / total,
            avgPreviewTimeSeconds: Math.round(avgPreview),
            positiveReedbackRate: positive / (positive + negative || 1),
            negativeReedbackRate: negative / (positive + negative || 1),
        };
    };

    const v1Metrics = calculateMetrics(v1Gens, v1Ints);
    const v2Metrics = calculateMetrics(v2Gens, v2Ints);

    // Déterminer le gagnant (basé sur score composite)
    const v1Score = calculateCompositeScore(v1Metrics);
    const v2Score = calculateCompositeScore(v2Metrics);

    const totalSamples = v1Gens.length + v2Gens.length;
    const minSamples = experiment.config?.minimumSampleSize || 100;
    const isSignificant = totalSamples >= minSamples;

    let winner: GeneratorVariant | null = null;
    let confidence = 0;

    if (isSignificant) {
        if (v2Score > v1Score * 1.05) {
            winner = "v2";
            confidence = Math.min(0.95, (v2Score - v1Score) / v1Score);
        } else if (v1Score > v2Score * 1.05) {
            winner = "v1";
            confidence = Math.min(0.95, (v1Score - v2Score) / v2Score);
        }
    }

    return {
        experimentId: expId,
        startedAt: experiment.created_at,
        sampleSize: {
            v1: v1Gens.length,
            v2: v2Gens.length,
        },
        metrics: {
            v1: v1Metrics,
            v2: v2Metrics,
        },
        winner,
        confidence,
        isSignificant,
    };
}

/**
 * Calcule un score composite pour une variante
 */
function calculateCompositeScore(metrics: VariantMetrics): number {
    // Pondérations
    const weights = {
        downloadRate: 30,
        feedbackRate: 25,
        groundingScore: 20,
        previewTime: 10,
        errorRate: -15,
    };

    let score = 0;
    score += metrics.pdfDownloadRate * weights.downloadRate;
    score += metrics.positiveReedbackRate * weights.feedbackRate;
    score += (metrics.avgGroundingScore / 100) * weights.groundingScore;
    score += Math.min(metrics.avgPreviewTimeSeconds / 60, 1) * weights.previewTime;
    score += metrics.errorRate * weights.errorRate;

    return score;
}

/**
 * Génère un rapport A/B testing
 */
export async function generateABTestReport(): Promise<string> {
    const results = await getExperimentResults();
    if (!results) return "Aucune expérience A/B active.";

    const report = `
# Rapport A/B Testing - Génération CV

## Expérience: ${results.experimentId}
Démarré le: ${results.startedAt}

## Taille d'échantillon
- V1: ${results.sampleSize.v1} générations
- V2: ${results.sampleSize.v2} générations
- Total: ${results.sampleSize.v1 + results.sampleSize.v2}
- Significatif: ${results.isSignificant ? "OUI" : "NON (besoin plus de données)"}

## Métriques V1
- Temps génération moyen: ${results.metrics.v1.avgGenerationTimeMs}ms
- Score grounding: ${results.metrics.v1.avgGroundingScore}%
- Taux d'erreur: ${(results.metrics.v1.errorRate * 100).toFixed(1)}%
- Taux téléchargement PDF: ${(results.metrics.v1.pdfDownloadRate * 100).toFixed(1)}%
- Feedback positif: ${(results.metrics.v1.positiveReedbackRate * 100).toFixed(1)}%

## Métriques V2
- Temps génération moyen: ${results.metrics.v2.avgGenerationTimeMs}ms
- Score grounding: ${results.metrics.v2.avgGroundingScore}%
- Taux d'erreur: ${(results.metrics.v2.errorRate * 100).toFixed(1)}%
- Taux fallback: ${(results.metrics.v2.fallbackRate * 100).toFixed(1)}%
- Taux téléchargement PDF: ${(results.metrics.v2.pdfDownloadRate * 100).toFixed(1)}%
- Feedback positif: ${(results.metrics.v2.positiveReedbackRate * 100).toFixed(1)}%

## Conclusion
${results.winner
    ? `**GAGNANT: ${results.winner.toUpperCase()}** (confiance: ${(results.confidence * 100).toFixed(0)}%)`
    : "Pas de gagnant clair - continuer l'expérience"
}
`;

    return report.trim();
}
