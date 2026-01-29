/**
 * Observability System - Logs structurés, métriques et tracing
 *
 * [AMÉLIORATION P1-5] : Système complet d'observabilité pour
 * monitorer la génération de CV en production.
 *
 * Features:
 * - Logs structurés avec contexte
 * - Métriques temps réel
 * - Traces distribuées
 * - Alertes sur seuils
 * - Dashboard API
 */

import { createSupabaseAdminClient } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

// ============================================================================
// TYPES
// ============================================================================

export type MetricType =
    | "counter"
    | "gauge"
    | "histogram"
    | "summary";

export type AlertSeverity = "info" | "warning" | "error" | "critical";

export interface Metric {
    name: string;
    type: MetricType;
    value: number;
    labels: Record<string, string>;
    timestamp: string;
}

export interface Trace {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    operationName: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    status: "ok" | "error";
    tags: Record<string, string | number | boolean>;
    logs: TraceLog[];
}

export interface TraceLog {
    timestamp: number;
    level: "debug" | "info" | "warn" | "error";
    message: string;
    data?: any;
}

export interface Alert {
    id: string;
    severity: AlertSeverity;
    title: string;
    message: string;
    metric?: string;
    threshold?: number;
    currentValue?: number;
    createdAt: string;
    acknowledgedAt?: string;
}

export interface CVGenerationMetrics {
    totalGenerations: number;
    successfulGenerations: number;
    failedGenerations: number;
    averageDurationMs: number;
    p50DurationMs: number;
    p95DurationMs: number;
    p99DurationMs: number;
    v1Count: number;
    v2Count: number;
    fallbackCount: number;
    cacheHitRate: number;
    averageGroundingScore: number;
    errorsByType: Record<string, number>;
}

// ============================================================================
// METRICS COLLECTOR
// ============================================================================

class MetricsCollector {
    private metrics: Metric[] = [];
    private histograms: Record<string, number[]> = {};
    private counters: Record<string, number> = {};
    private gauges: Record<string, number> = {};

    // Compteur
    increment(name: string, value: number = 1, labels: Record<string, string> = {}): void {
        const key = this.getKey(name, labels);
        this.counters[key] = (this.counters[key] || 0) + value;
        this.record({ name, type: "counter", value: this.counters[key], labels });
    }

    // Gauge
    set(name: string, value: number, labels: Record<string, string> = {}): void {
        const key = this.getKey(name, labels);
        this.gauges[key] = value;
        this.record({ name, type: "gauge", value, labels });
    }

    // Histogramme
    observe(name: string, value: number, labels: Record<string, string> = {}): void {
        const key = this.getKey(name, labels);
        if (!this.histograms[key]) {
            this.histograms[key] = [];
        }
        this.histograms[key].push(value);
        this.record({ name, type: "histogram", value, labels });
    }

    // Timer helper
    startTimer(name: string, labels: Record<string, string> = {}): () => number {
        const start = Date.now();
        return () => {
            const duration = Date.now() - start;
            this.observe(name, duration, labels);
            return duration;
        };
    }

    // Calculer les percentiles
    getPercentile(name: string, percentile: number, labels: Record<string, string> = {}): number {
        const key = this.getKey(name, labels);
        const values = this.histograms[key] || [];
        if (values.length === 0) return 0;

        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    // Obtenir toutes les métriques
    getMetrics(): Metric[] {
        return this.metrics.slice(-1000); // Dernières 1000 métriques
    }

    private getKey(name: string, labels: Record<string, string>): string {
        const labelStr = Object.entries(labels).sort().map(([k, v]) => `${k}=${v}`).join(",");
        return `${name}{${labelStr}}`;
    }

    private record(metric: Omit<Metric, "timestamp">): void {
        this.metrics.push({ ...metric, timestamp: new Date().toISOString() });
        if (this.metrics.length > 10000) {
            this.metrics = this.metrics.slice(-5000);
        }
    }
}

export const metrics = new MetricsCollector();

// ============================================================================
// TRACING
// ============================================================================

class TracingSystem {
    private traces: Map<string, Trace> = new Map();
    private activeSpans: Map<string, Trace> = new Map();

    startSpan(operationName: string, options?: {
        traceId?: string;
        parentSpanId?: string;
        tags?: Record<string, string | number | boolean>;
    }): Trace {
        const traceId = options?.traceId || this.generateId();
        const spanId = this.generateId();

        const span: Trace = {
            traceId,
            spanId,
            parentSpanId: options?.parentSpanId,
            operationName,
            startTime: Date.now(),
            status: "ok",
            tags: options?.tags || {},
            logs: [],
        };

        this.activeSpans.set(spanId, span);
        return span;
    }

    addLog(span: Trace, level: TraceLog["level"], message: string, data?: any): void {
        span.logs.push({
            timestamp: Date.now(),
            level,
            message,
            data,
        });
    }

    setTag(span: Trace, key: string, value: string | number | boolean): void {
        span.tags[key] = value;
    }

    setError(span: Trace, error: Error | string): void {
        span.status = "error";
        span.tags["error"] = true;
        span.tags["error.message"] = typeof error === "string" ? error : error.message;
        if (typeof error !== "string" && error.stack) {
            span.tags["error.stack"] = error.stack.substring(0, 500);
        }
    }

    endSpan(span: Trace): void {
        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        this.activeSpans.delete(span.spanId);
        this.traces.set(span.spanId, span);

        // Nettoyer les vieilles traces
        if (this.traces.size > 1000) {
            const entries = Array.from(this.traces.entries());
            entries.slice(0, 500).forEach(([id]) => this.traces.delete(id));
        }

        // Logger la trace
        logger.debug(`[trace] ${span.operationName}`, {
            traceId: span.traceId,
            spanId: span.spanId,
            duration: span.duration,
            status: span.status,
        });
    }

    getTrace(traceId: string): Trace[] {
        return Array.from(this.traces.values()).filter(t => t.traceId === traceId);
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 15);
    }
}

export const tracing = new TracingSystem();

// ============================================================================
// ALERTING
// ============================================================================

class AlertingSystem {
    private alerts: Alert[] = [];
    private thresholds: Map<string, { value: number; severity: AlertSeverity; message: string }> = new Map();

    // Définir un seuil d'alerte
    setThreshold(metric: string, config: { value: number; severity: AlertSeverity; message: string }): void {
        this.thresholds.set(metric, config);
    }

    // Vérifier les seuils
    checkThreshold(metric: string, currentValue: number): Alert | null {
        const config = this.thresholds.get(metric);
        if (!config) return null;

        if (currentValue > config.value) {
            const alert: Alert = {
                id: `alert_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                severity: config.severity,
                title: `Seuil dépassé: ${metric}`,
                message: config.message,
                metric,
                threshold: config.value,
                currentValue,
                createdAt: new Date().toISOString(),
            };

            this.alerts.push(alert);
            logger.warn(`[alert] ${alert.title}`, { alert });

            return alert;
        }

        return null;
    }

    // Obtenir les alertes actives
    getActiveAlerts(): Alert[] {
        return this.alerts.filter(a => !a.acknowledgedAt);
    }

    // Acquitter une alerte
    acknowledgeAlert(alertId: string): void {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledgedAt = new Date().toISOString();
        }
    }
}

export const alerting = new AlertingSystem();

// Configuration des seuils par défaut
alerting.setThreshold("cv_generation_error_rate", {
    value: 0.1, // 10%
    severity: "error",
    message: "Le taux d'erreur de génération CV dépasse 10%",
});

alerting.setThreshold("cv_generation_duration_p95", {
    value: 60000, // 60s
    severity: "warning",
    message: "Le temps de génération P95 dépasse 60 secondes",
});

alerting.setThreshold("gemini_rate_limit_count", {
    value: 10,
    severity: "warning",
    message: "Plus de 10 rate limits Gemini en 1 heure",
});

// ============================================================================
// CV GENERATION SPECIFIC METRICS
// ============================================================================

export function trackCVGeneration(params: {
    userId: string;
    cvId?: string;
    variant?: "v1" | "v2";
    durationMs: number;
    success: boolean;
    groundingScore?: number;
    cacheHit?: boolean;
    fromCache?: boolean;  // Alias pour cacheHit
    hadFallback?: boolean;
    errorType?: string;
    // Nouveaux paramètres intégrés
    sector?: string;
    templateName?: string;
    widgetCount?: number;
    qualityScore?: number;
}): void {
    const variant = params.variant || "v2";
    const cacheHit = params.cacheHit ?? params.fromCache;

    const labels = {
        variant,
        success: String(params.success),
        sector: params.sector || "unknown",
    };

    // Compteurs
    metrics.increment("cv_generation_total", 1, labels);

    if (params.success) {
        metrics.increment("cv_generation_success", 1, { variant, sector: params.sector || "unknown" });
    } else {
        metrics.increment("cv_generation_error", 1, {
            variant,
            error_type: params.errorType || "unknown",
        });
    }

    // Durée
    metrics.observe("cv_generation_duration_ms", params.durationMs, { variant });

    // Cache
    if (cacheHit !== undefined) {
        metrics.increment("cv_generation_cache", 1, { hit: String(cacheHit) });
    }

    // Fallback
    if (params.hadFallback) {
        metrics.increment("cv_generation_fallback", 1);
    }

    // Grounding
    if (params.groundingScore !== undefined) {
        metrics.observe("cv_generation_grounding_score", params.groundingScore, { variant });
    }

    // Quality score (nouveau)
    if (params.qualityScore !== undefined) {
        metrics.observe("cv_generation_quality_score", params.qualityScore, { variant, sector: params.sector || "unknown" });
    }

    // Widget count (nouveau)
    if (params.widgetCount !== undefined) {
        metrics.observe("cv_generation_widget_count", params.widgetCount, { variant });
    }

    // Template usage (nouveau)
    if (params.templateName) {
        metrics.increment("cv_template_usage", 1, { template: params.templateName });
    }

    // Vérifier les seuils d'alerte
    const errorRate = getErrorRate();
    alerting.checkThreshold("cv_generation_error_rate", errorRate);

    const p95 = metrics.getPercentile("cv_generation_duration_ms", 95);
    alerting.checkThreshold("cv_generation_duration_p95", p95);
}

function getErrorRate(): number {
    const total = metrics.getMetrics().filter(m => m.name === "cv_generation_total").length;
    const errors = metrics.getMetrics().filter(m => m.name === "cv_generation_error").length;
    return total > 0 ? errors / total : 0;
}

// ============================================================================
// DASHBOARD API
// ============================================================================

export async function getCVGenerationDashboard(timeRange: "1h" | "24h" | "7d" = "24h"): Promise<{
    summary: CVGenerationMetrics;
    timeline: { timestamp: string; count: number; successRate: number }[];
    topErrors: { type: string; count: number }[];
    variantComparison: { v1: any; v2: any };
    alerts: Alert[];
}> {
    const allMetrics = metrics.getMetrics();

    // Filtrer par timeRange
    const now = Date.now();
    const ranges = { "1h": 3600000, "24h": 86400000, "7d": 604800000 };
    const rangeMs = ranges[timeRange];
    const filteredMetrics = allMetrics.filter(m =>
        new Date(m.timestamp).getTime() > now - rangeMs
    );

    // Calculer le résumé
    const totalGens = filteredMetrics.filter(m => m.name === "cv_generation_total").length;
    const successGens = filteredMetrics.filter(m => m.name === "cv_generation_success").length;
    const failedGens = filteredMetrics.filter(m => m.name === "cv_generation_error").length;
    const durations = filteredMetrics
        .filter(m => m.name === "cv_generation_duration_ms")
        .map(m => m.value);

    const v1Count = filteredMetrics.filter(m => m.labels.variant === "v1").length;
    const v2Count = filteredMetrics.filter(m => m.labels.variant === "v2").length;
    const fallbackCount = filteredMetrics.filter(m => m.name === "cv_generation_fallback").length;

    const cacheHits = filteredMetrics.filter(m => m.name === "cv_generation_cache" && m.labels.hit === "true").length;
    const cacheMisses = filteredMetrics.filter(m => m.name === "cv_generation_cache" && m.labels.hit === "false").length;

    const groundingScores = filteredMetrics
        .filter(m => m.name === "cv_generation_grounding_score")
        .map(m => m.value);

    const summary: CVGenerationMetrics = {
        totalGenerations: totalGens,
        successfulGenerations: successGens,
        failedGenerations: failedGens,
        averageDurationMs: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
        p50DurationMs: metrics.getPercentile("cv_generation_duration_ms", 50),
        p95DurationMs: metrics.getPercentile("cv_generation_duration_ms", 95),
        p99DurationMs: metrics.getPercentile("cv_generation_duration_ms", 99),
        v1Count,
        v2Count,
        fallbackCount,
        cacheHitRate: cacheHits + cacheMisses > 0 ? cacheHits / (cacheHits + cacheMisses) : 0,
        averageGroundingScore: groundingScores.length > 0 ? groundingScores.reduce((a, b) => a + b, 0) / groundingScores.length : 0,
        errorsByType: {},
    };

    // Timeline (agréger par heure)
    const timeline: { timestamp: string; count: number; successRate: number }[] = [];
    // TODO: Implémenter l'agrégation

    // Top erreurs
    const errorMetrics = filteredMetrics.filter(m => m.name === "cv_generation_error");
    const errorCounts: Record<string, number> = {};
    errorMetrics.forEach(m => {
        const type = m.labels.error_type || "unknown";
        errorCounts[type] = (errorCounts[type] || 0) + 1;
    });
    const topErrors = Object.entries(errorCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Comparaison V1/V2
    const v1Durations = filteredMetrics
        .filter(m => m.name === "cv_generation_duration_ms" && m.labels.variant === "v1")
        .map(m => m.value);
    const v2Durations = filteredMetrics
        .filter(m => m.name === "cv_generation_duration_ms" && m.labels.variant === "v2")
        .map(m => m.value);

    const variantComparison = {
        v1: {
            count: v1Count,
            avgDuration: v1Durations.length > 0 ? v1Durations.reduce((a, b) => a + b, 0) / v1Durations.length : 0,
        },
        v2: {
            count: v2Count,
            avgDuration: v2Durations.length > 0 ? v2Durations.reduce((a, b) => a + b, 0) / v2Durations.length : 0,
            fallbackRate: v2Count > 0 ? fallbackCount / v2Count : 0,
        },
    };

    return {
        summary,
        timeline,
        topErrors,
        variantComparison,
        alerts: alerting.getActiveAlerts(),
    };
}

// ============================================================================
// TRACE WRAPPER
// ============================================================================

/**
 * Wrapper pour tracer une opération
 */
export async function withTrace<T>(
    operationName: string,
    fn: (span: Trace) => Promise<T>,
    options?: { tags?: Record<string, string | number | boolean> }
): Promise<T> {
    const span = tracing.startSpan(operationName, { tags: options?.tags });

    try {
        const result = await fn(span);
        tracing.endSpan(span);
        return result;
    } catch (error: any) {
        tracing.setError(span, error);
        tracing.endSpan(span);
        throw error;
    }
}
