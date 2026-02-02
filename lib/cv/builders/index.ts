/**
 * CV Builders - Index
 * Re-exporte tous les builders pour import simplifié
 * 
 * [CDC Phase 3.1] Refactoring architecture complet
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
export { buildCompetences } from "./competences";
export { buildFormations } from "./formations";
export { buildLangues } from "./langues";

// Types réexportés pour convénience
export type { ConvertOptions } from "../ai-adapter";

// Note: buildExperiences, buildCertificationsAndReferences et buildProjects
// restent dans ai-adapter.ts car trop gros pour cette phase
// (261 + 176 + 63 lignes = 500 lignes à refactorer en phase 2)
