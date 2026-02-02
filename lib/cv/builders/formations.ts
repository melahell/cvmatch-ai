/**
 * Builder pour les formations
 * Extrait de ai-adapter.ts pour modularité
 * 
 * [AUDIT FIX] : Enrichit les formations depuis le RAG si widgets insuffisants
 * [CDC Phase 3.1] Refactoring architecture
 */

import type { AIWidget } from "../ai-widgets";
import type { RendererResumeSchema } from "../renderer-schema";

/**
 * Construit les formations depuis les widgets et enrichit depuis le RAG
 */
export function buildFormations(
    educationWidgets: AIWidget[],
    ragProfile?: any
): RendererResumeSchema["formations"] {
    const formations: RendererResumeSchema["formations"] = [];

    // D'abord, construire depuis les widgets
    educationWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;

        // Heuristique minimale : "Diplôme - Établissement (Année)"
        let diplome = text;
        let etablissement = "";
        let annee: string | undefined;

        const yearMatch = text.match(/(19|20)\d{2}/);
        if (yearMatch) {
            annee = yearMatch[0];
        }

        const parts = text.split(" - ");
        if (parts.length >= 2) {
            diplome = parts[0].trim();
            etablissement = parts[1].trim();
        }

        formations.push({
            diplome: diplome || "Formation",
            etablissement: etablissement || "",
            annee,
        });
    });

    // [AUDIT FIX] : Si aucune formation depuis widgets, utiliser le RAG
    if (formations.length === 0 && ragProfile?.formations) {
        const ragFormations = Array.isArray(ragProfile.formations) ? ragProfile.formations : [];
        ragFormations.forEach((f: any) => {
            formations.push({
                diplome: f.titre || f.diplome || "Formation",
                etablissement: f.organisme || f.ecole || f.etablissement || "",
                annee: f.annee,
            });
        });
    }

    return formations;
}
