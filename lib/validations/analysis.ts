import { z } from 'zod';

// Strength Schema
export const strengthSchema = z.object({
    point: z.string().min(1, 'Point requis'),
    match_percent: z.number().min(0).max(100)
});

// Gap Schema
export const gapSchema = z.object({
    point: z.string().min(1, 'Point requis'),
    severity: z.enum(['Bloquant', 'Important', 'Mineur']),
    suggestion: z.string().min(1, 'Suggestion requise')
});

// Salary Range Schema
export const salaryRangeSchema = z.object({
    min: z.number().positive('Salaire minimum invalide'),
    max: z.number().positive('Salaire maximum invalide'),
    currency: z.string().default('EUR'),
    periode: z.string().default('annuel'),
    context: z.string().optional(),
    justification: z.string().optional()
}).refine(
    (data) => data.max >= data.min,
    { message: 'Le salaire maximum doit être supérieur au minimum', path: ['max'] }
);

// Salary Estimate Schema
export const salaryEstimateSchema = z.object({
    market_range: salaryRangeSchema.extend({
        context: z.string().min(1, 'Contexte requis')
    }),
    personalized_range: salaryRangeSchema.extend({
        justification: z.string().min(1, 'Justification requise')
    }),
    negotiation_tip: z.string().min(10, 'Conseil de négociation requis')
}).optional();

// Coaching Tips Schema
export const coachingTipsSchema = z.object({
    approach_strategy: z.string().min(20, 'Stratégie d\'approche trop courte'),
    key_selling_points: z.array(z.string().min(5)).min(3).max(5),
    preparation_checklist: z.array(z.string().min(5)).min(3).max(5),
    interview_focus: z.string().min(20, 'Focus entretien trop court')
}).optional();

// Match Report Schema
export const matchReportSchema = z.object({
    match_score: z.number().min(0).max(100),
    match_level: z.enum(['Excellent', 'Très bon', 'Bon', 'Moyen', 'Faible']),
    recommendation: z.string().min(1),
    strengths: z.array(strengthSchema).min(0),
    gaps: z.array(gapSchema).min(0),
    missing_keywords: z.array(z.string()).default([]),
    key_insight: z.string().min(10, 'Insight trop court'),
    salary_estimate: salaryEstimateSchema,
    coaching_tips: coachingTipsSchema
});

// Job Analysis Schema
export const jobAnalysisSchema = z.object({
    id: z.string().uuid('ID invalide'),
    user_id: z.string().min(1, 'User ID requis'),
    job_url: z.string().url().optional().or(z.literal('')),
    job_description: z.string().min(1, 'Description requise'),
    job_title: z.string().optional(),
    company: z.string().optional(),
    location: z.string().optional(),
    match_score: z.number().min(0).max(100),
    match_level: z.enum(['Excellent', 'Très bon', 'Bon', 'Moyen', 'Faible']),
    match_report: matchReportSchema,
    submitted_at: z.string().datetime().optional(),
    created_at: z.string().datetime().optional(),
    application_status: z.enum(['pending', 'applied', 'interviewing', 'rejected', 'offer']).default('pending'),
    cv_generated: z.boolean().optional(),
    cv_url: z.string().url().optional().or(z.literal(''))
});

// Partial schema for updates
export const jobAnalysisUpdateSchema = jobAnalysisSchema.partial();

// Types exports
export type Strength = z.infer<typeof strengthSchema>;
export type Gap = z.infer<typeof gapSchema>;
export type SalaryRange = z.infer<typeof salaryRangeSchema>;
export type SalaryEstimate = z.infer<typeof salaryEstimateSchema>;
export type CoachingTips = z.infer<typeof coachingTipsSchema>;
export type MatchReport = z.infer<typeof matchReportSchema>;
export type JobAnalysisValidated = z.infer<typeof jobAnalysisSchema>;
