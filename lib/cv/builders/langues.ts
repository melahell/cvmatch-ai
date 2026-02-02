/**
 * Builder pour les langues
 * Extrait de ai-adapter.ts pour modularité
 * 
 * [AUDIT FIX] : Enrichit les langues depuis le RAG si widgets insuffisants
 * [CDC Phase 3.1] Refactoring architecture
 */

import type { AIWidget } from "../ai-widgets";
import type { RendererResumeSchema } from "../renderer-schema";

/**
 * Construit les langues depuis les widgets et enrichit depuis le RAG
 */
export function buildLangues(
    languageWidgets: AIWidget[],
    ragProfile?: any
): RendererResumeSchema["langues"] {
    const langues: NonNullable<RendererResumeSchema["langues"]> = [];

    // D'abord, construire depuis les widgets
    languageWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;

        // Exemples attendus : "Français - Natif", "Anglais (Courant)"
        let langue = text;
        let niveau = "Professionnel";

        const separators = [" - ", ":", "("];
        for (const sep of separators) {
            const idx = text.indexOf(sep);
            if (idx !== -1) {
                langue = text.slice(0, idx).replace(/[()]/g, "").trim();
                niveau = text.slice(idx + sep.length).replace(/[()]/g, "").trim() || niveau;
                break;
            }
        }

        langues.push({ langue, niveau });
    });

    // [AUDIT FIX] : Si aucune langue depuis widgets, utiliser le RAG
    if (langues.length === 0 && ragProfile?.langues) {
        if (Array.isArray(ragProfile.langues)) {
            ragProfile.langues.forEach((l: any) => {
                langues.push({
                    langue: l.langue || l.name || "",
                    niveau: l.niveau || l.level || "Professionnel",
                });
            });
        } else if (typeof ragProfile.langues === "object") {
            Object.entries(ragProfile.langues).forEach(([langue, niveau]) => {
                langues.push({
                    langue,
                    niveau: String(niveau),
                });
            });
        }
    }

    return langues.length > 0 ? langues : undefined;
}
