/**
 * CV Builders - Index
 * 
 * [CDC Sprint 2.6] Réorganisation ai-adapter.ts
 * 
 * Note: Les builders restent dans ai-adapter.ts pour éviter les problèmes
 * de dépendances circulaires. Ce fichier documente la structure cible
 * pour une refactorisation future plus profonde.
 * 
 * Structure actuelle (dans ai-adapter.ts):
 * - buildProfil() - Construit le profil depuis widgets + RAG
 * - buildExperiences() - Construit les expériences
 * - buildCompetences() - Construit les compétences
 * - buildFormations() - Construit les formations
 * - buildLangues() - Construit les langues
 * - buildCertificationsAndReferences() - Construit certifs + clients
 * - buildProjects() - Construit les projets
 * 
 * Structure cible (refactorisation future):
 * - builders/profil.ts
 * - builders/experiences.ts
 * - builders/competences.ts
 * - builders/formations.ts
 * - builders/langues.ts
 * - builders/certifications.ts
 * - builders/projects.ts
 */

// Re-export depuis ai-adapter pour compatibilité
export { convertAndSort } from "../ai-adapter";
export type { ConvertOptions } from "../ai-adapter";
