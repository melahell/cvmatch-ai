import { z } from 'zod';

/**
 * Validation Schema for Match Analysis
 * Used to validate AI-generated analysis before saving to DB
 */

// Base schema without refine (for extending)
const salaryRangeBaseSchema = z.object({
    min: z.number().positive('Salaire minimum doit être positif'),
    max: z.number().positive('Salaire maximum doit être positif'),
    currency: z.string().default('EUR'),
    periode: z.string().default('annuel'),
    context: z.string().optional(),
    justification: z.string().optional()
});

// Add refine validation
export const salaryRangeSchema = salaryRangeBaseSchema.refine(
    (data) => data.max >= data.min,
    { message: 'Max salary must be >= min salary', path: ['max'] }
);

export const salaryEstimateSchema = z.object({
    market_range: salaryRangeBaseSchema.extend({
        context: z.string().min(10, 'Context requis')
    }).refine(
        (data) => data.max >= data.min,
        { message: 'Max salary must be >= min salary', path: ['max'] }
    ),
    personalized_range: salaryRangeBaseSchema.extend({
        justification: z.string().min(20, 'Justification requise')
    }).refine(
        (data) => data.max >= data.min,
        { message: 'Max salary must be >= min salary', path: ['max'] }
    ),
    negotiation_tip: z.string().min(20, 'Conseil trop court')
}).optional();

export const coachingTipsSchema = z.object({
    approach_strategy: z.string().min(50, 'Stratégie trop courte'),
    key_selling_points: z.array(z.string().min(10)).min(3).max(5),
    preparation_checklist: z.array(z.string().min(10)).min(3).max(5),
    interview_focus: z.string().min(30, 'Focus trop court')
}).optional();

export const strengthSchema = z.object({
    point: z.string().min(5),
    match_percent: z.number().min(0).max(100)
});

export const gapSchema = z.object({
    point: z.string().min(5),
    severity: z.enum(['Bloquant', 'Important', 'Mineur']),
    suggestion: z.string().min(10)
});

export const matchAnalysisResponseSchema = z.object({
    job_title: z.string().min(3, 'Job title requis'),
    company: z.string().optional(),
    location: z.string().optional(),
    match_score: z.number().min(0).max(100),
    match_level: z.enum(['Excellent', 'Très bon', 'Bon', 'Moyen', 'Faible']),
    recommendation: z.string().min(3),
    strengths: z.array(strengthSchema).min(1, 'Au moins 1 point fort requis'),
    gaps: z.array(gapSchema),
    missing_keywords: z.array(z.string()).default([]),
    key_insight: z.string().min(20, 'Insight trop court'),
    salary_estimate: salaryEstimateSchema,
    coaching_tips: coachingTipsSchema
});

export type MatchAnalysisResponse = z.infer<typeof matchAnalysisResponseSchema>;

/**
 * Validate match analysis with detailed error reporting
 */
export function validateMatchAnalysis(data: unknown): {
    success: boolean;
    data?: MatchAnalysisResponse;
    error?: string;
    details?: z.ZodError;
} {
    const result = matchAnalysisResponseSchema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    // Format errors for logging
    const errorMessage = result.error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ');

    return {
        success: false,
        error: errorMessage,
        details: result.error
    };
}

/**
 * Add defaults for optional enriched fields if missing
 */
export function addMatchAnalysisDefaults(data: Partial<MatchAnalysisResponse>): MatchAnalysisResponse {
    return {
        ...data,
        missing_keywords: data.missing_keywords || [],
        // Don't add defaults for salary/coaching - let them be undefined if not provided
    } as MatchAnalysisResponse;
}
