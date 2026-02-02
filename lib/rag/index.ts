/**
 * RAG Module - Index
 * 
 * Exports centralisés pour le module RAG
 */

// Versioning
export {
    saveRAGVersion,
    listRAGVersions,
    getRAGVersion,
    getLatestRAGVersion,
    restoreRAGVersion,
    countRAGVersions,
    calculateRAGDiff,
    summarizeRAGDiff,
    diffRAGVersions,
} from "./versioning";

export type {
    RAGVersion,
    RAGVersionReason,
    SaveVersionOptions,
    VersionListOptions,
} from "./versioning";

// Merge & Deduplication
export { mergeRAGData, mergeRAGDataSimple } from "./merge-simple";
export type { MergeResult } from "./merge-simple";
export { 
    deduplicateRAG, 
    deduplicateExperiences,
    deduplicateCompetences,
    deduplicateFormations,
    deduplicateCertifications,
} from "./deduplicate";
export { mergeRAGUserUpdate } from "./merge-user-update";

// Formatting
export { formatRAGForPrompt } from "./format-rag-for-prompt";

// Quality
export { calculateQualityScore } from "./quality-scoring";

// Validation
export { validateRAGData, formatValidationReport } from "./validation";

// String similarity
export { 
    stringSimilarity,
    areStringsSimilar,
    wordSimilarity,
    combinedSimilarity,
    calculateStringSimilarity,
} from "./string-similarity";

// Fuzzy matching
export { 
    fuzzyMatchCompany,
    calculateStringSimilarity as fuzzyStringSimilarity,
    areSkillsSimilar,
    fuzzyAreExperiencesSimilar,
    deduplicateBySimilarity,
    isSkillRejected,
} from "./fuzzy-matcher";

// Company normalization
export { normalizeCompanyName, areSameCompany } from "./normalize-company";

// Client consolidation
export { consolidateClients, getAllClientNames, groupClientsBySector } from "./consolidate-clients";

// Profile enrichment
export { 
    enrichProfile,
    deduplicateSoftSkills,
    filterRejectedTacitSkills,
} from "./profile-enrichment";
export type { ProfileEnrichment } from "./profile-enrichment";

// Preserve user fields
export { preserveUserFieldsOnRegeneration } from "./preserve-user-fields";
