/**
 * Schema Zod pour widgets AI
 * 
 * [CDC Sprint 2.3] Validation stricte des sorties IA
 */

import { z } from "zod";

// ============================================================================
// WIDGET SCHEMA
// ============================================================================

export const aiWidgetSchema = z.object({
    widget_id: z.string(),
    section: z.enum([
        "experience",
        "skill",
        "formation",
        "langue",
        "certification",
        "project",
        "client_reference",
        "accroche",
    ]),
    content: z.record(z.unknown()),
    relevance_score: z.number().min(0).max(100).optional(),
    sources: z.array(z.string()).optional(),
    metadata: z.object({
        generated_at: z.string().optional(),
        model: z.string().optional(),
    }).passthrough().optional(),
}).passthrough();

export const aiWidgetsEnvelopeSchema = z.object({
    widgets: z.array(aiWidgetSchema),
    metadata: z.object({
        total_widgets: z.number().optional(),
        generated_at: z.string().optional(),
        job_context: z.object({
            job_title: z.string().optional(),
            company: z.string().optional(),
        }).passthrough().optional(),
    }).passthrough().optional(),
}).passthrough();

// ============================================================================
// PARTIAL SCHEMAS (for streaming/incremental)
// ============================================================================

export const partialWidgetSchema = aiWidgetSchema.partial();

export const widgetArraySchema = z.array(aiWidgetSchema);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AIWidget = z.infer<typeof aiWidgetSchema>;
export type AIWidgetsEnvelope = z.infer<typeof aiWidgetsEnvelopeSchema>;
export type PartialWidget = z.infer<typeof partialWidgetSchema>;
