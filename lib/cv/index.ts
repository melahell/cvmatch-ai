/**
 * [CDC-20] Point d'entrée centralisé pour lib/cv
 * Organise les exports par catégorie
 */

// === CORE TYPES ===
export type { RendererResumeSchema } from "./renderer-schema";
export type { AIWidget, AIWidgetsEnvelope, AIWidgetSourceRef } from "./ai-widgets";
export { aiWidgetSchema, aiWidgetsEnvelopeSchema, validateAIWidgetsEnvelope } from "./ai-widgets";

// === SCORING ===
export { calculateAdvancedScore, rescoreWidgetsWithAdvanced } from "./advanced-scoring";
export type { AdvancedScoreWeights } from "./advanced-scoring";
export { calculateRelevanceScore } from "./relevance-scoring";
export type { JobOfferContext } from "./relevance-scoring";

// === TRANSFORMERS ===
export { convertAndSort } from "./ai-adapter";
export type { ConvertOptions } from "./client-bridge";

// === UTILITIES ===
export { sanitizeText, safeString } from "./sanitize-text";

// === EXPORT ===
export { exportCVToWord } from "./export-word";
export { exportCVToMarkdown } from "./export-markdown";

// === JSON RESUME (Interopérabilité) ===
export { 
    convertToJSONResume, 
    convertFromJSONResume, 
    exportToJSONResumeString,
    isValidJSONResume,
} from "./json-resume-converter";
export type { 
    JSONResume, 
    JSONResumeBasics, 
    JSONResumeWork,
    JSONResumeEducation,
    JSONResumeSkill,
    ConversionOptions,
} from "./json-resume-converter";

// === CACHE ===
export { getSmartCachedWidgets, saveToSmartCache, invalidateUserCache } from "./smart-widget-cache";

// === VALIDATION ===
export { validateCVContent, autoCompressCV, fitCVToTemplate } from "./validator";
export { buildCVLossReport } from "./loss-report";

// === AUTO-FIT ===
export { 
    autoFitToOnePage, 
    autoFitToPages, 
    estimateCVHeight, 
    estimatePages,
} from "./auto-fit";
export type { AutoFitOptions, FitResult } from "./auto-fit";

// === REACTIVE RESUME ===
export { convertToRRSchema } from "./reactive-resume-converter";
export type { 
    RRResumeData, 
    RRConversionOptions,
    RRTemplateName,
} from "./reactive-resume-converter";
