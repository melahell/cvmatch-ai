/**
 * CV Builders - Index
 * Re-exporte tous les builders pour import simplifié
 * 
 * [CDC Phase 3.2] Refactoring architecture complet
 */

// Helpers partagés
export {
    normalizeKey,
    normalizeClientName,
    isBadClientName,
    cleanClientList,
    findRAGExperience,
    formatDate,
    clampScore,
    extractWidgetText,
} from "./utils";

// Builders individuels
export { buildProfil } from "./profil";
export { buildExperiences } from "./experiences";
export { buildCompetences } from "./competences";
export { buildFormations } from "./formations";
export { buildLangues } from "./langues";
export { buildCertificationsAndReferences } from "./certifications";
export { buildProjects } from "./projects";

// Types réexportés pour convénience
export type { ConvertOptions } from "../ai-adapter";
