/**
 * Builder pour les projets
 * Extrait de ai-adapter.ts pour modularité
 * 
 * [CDC-21] Construit les projets depuis les widgets et le RAG
 * [CDC Phase 3.2] Refactoring architecture
 */

import type { AIWidget } from "../ai-widgets";
import type { RendererResumeSchema } from "../renderer-schema";

/**
 * [CDC-21] Construit les projets depuis les widgets et le RAG
 * Évite la perte de données des projets dans le pipeline
 */
export function buildProjects(
    projectWidgets: AIWidget[],
    ragProfile?: any
): RendererResumeSchema["projects"] {
    const projects: NonNullable<RendererResumeSchema["projects"]> = [];

    // D'abord, construire depuis les widgets
    projectWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;

        // Heuristique : "Nom du projet - Description"
        let nom = text;
        let description = "";
        let technologies: string[] = [];
        let lien: string | undefined;

        // Chercher un lien URL dans le texte
        const urlMatch = text.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
            lien = urlMatch[0];
        }

        // Séparer nom et description
        const separatorIndex = text.indexOf(" - ");
        if (separatorIndex !== -1) {
            nom = text.slice(0, separatorIndex).trim();
            description = text.slice(separatorIndex + 3).trim();
        }

        // Extraire les technologies si mentionnées entre parenthèses ou crochets
        const techMatch = text.match(/\[([^\]]+)\]|\(([^)]+)\)/);
        if (techMatch) {
            const techStr = techMatch[1] || techMatch[2];
            technologies = techStr.split(/[,;]/).map(t => t.trim()).filter(Boolean);
        }

        projects.push({
            nom: nom || "Projet",
            description: description || text,
            technologies: technologies.length > 0 ? technologies : undefined,
            lien,
        });
    });

    // [AUDIT FIX] : Si aucun projet depuis widgets, utiliser le RAG
    if (projects.length === 0 && ragProfile?.projets) {
        const ragProjets = Array.isArray(ragProfile.projets) ? ragProfile.projets : [];
        ragProjets.forEach((p: any) => {
            projects.push({
                nom: p.nom || p.titre || p.name || "Projet",
                description: p.description || "",
                technologies: Array.isArray(p.technologies) ? p.technologies : undefined,
                lien: p.lien || p.url || p.link || undefined,
            });
        });
    }

    return projects.length > 0 ? projects : undefined;
}
