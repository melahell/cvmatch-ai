/**
 * AI Schemas - Index
 * 
 * [CDC Sprint 2.3] Schemas Zod pour validation sorties Gemini
 */

// RAG Extraction
export {
    ragExtractionSchema,
    profilSchema,
    experienceSchema,
    formationSchema,
    langueSchema,
    competencesSchema,
} from "./rag-extraction.schema";

export type {
    RAGExtraction,
    RAGProfil,
    RAGExperience,
    RAGFormation,
    RAGLangue,
    RAGCompetences,
} from "./rag-extraction.schema";

// Widgets
export {
    aiWidgetSchema,
    aiWidgetsEnvelopeSchema,
    partialWidgetSchema,
    widgetArraySchema,
} from "./widgets.schema";

export type {
    AIWidget,
    AIWidgetsEnvelope,
    PartialWidget,
} from "./widgets.schema";

// Job Suggestions
export {
    jobSuggestionSchema,
    jobSuggestionsResponseSchema,
    jobSuggestionsArraySchema,
} from "./job-suggestions.schema";

export type {
    JobSuggestion,
    JobSuggestionsResponse,
} from "./job-suggestions.schema";
