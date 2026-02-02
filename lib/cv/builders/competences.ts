/**
 * Builder pour les compétences
 * Extrait de ai-adapter.ts pour modularité
 * 
 * [CDC Phase 3.1] Refactoring architecture
 */

import type { AIWidget } from "../ai-widgets";
import type { RendererResumeSchema } from "../renderer-schema";
import { normalizeKey } from "./utils";

/**
 * Construit les compétences techniques et soft skills depuis les widgets
 * Enrichit avec les compétences tacites du RAG
 */
export function buildCompetences(
    skillsWidgets: AIWidget[],
    ragProfile?: any
): RendererResumeSchema["competences"] {
    const techniquesSet = new Set<string>();
    const softSkillsSet = new Set<string>();
    const rejectedKeys = new Set<string>(
        Array.isArray(ragProfile?.rejected_inferred)
            ? ragProfile.rejected_inferred.map(normalizeKey).filter(Boolean)
            : []
    );

    const shouldKeep = (name: string) => {
        const key = normalizeKey(name);
        if (!key) return false;
        if (rejectedKeys.has(key)) return false;
        return true;
    };

    skillsWidgets.forEach((widget) => {
        const text = widget.text.trim();
        if (!text) return;
        if (!shouldKeep(text)) return;

        const lower = text.toLowerCase();
        const isSoft =
            lower.includes("communication") ||
            lower.includes("management") ||
            lower.includes("leadership") ||
            lower.includes("soft") ||
            lower.includes("relationnel") ||
            lower.includes("team") ||
            lower.includes("collaboration");

        if (isSoft) {
            softSkillsSet.add(text);
        } else {
            techniquesSet.add(text);
        }
    });

    // Enrichir avec compétences tacites du RAG
    const contexte = ragProfile?.contexte_enrichi;
    const tacites = Array.isArray(contexte?.competences_tacites) ? contexte.competences_tacites : [];
    for (const item of tacites) {
        const nameRaw = typeof item === "string" ? item : item?.nom || item?.name;
        const name = String(nameRaw ?? "").trim();
        if (!name) continue;
        if (!shouldKeep(name)) continue;
        const confidence = typeof (item as any)?.confidence === "number" ? (item as any).confidence : undefined;
        const type = typeof (item as any)?.type === "string" ? String((item as any).type) : "";

        if (type === "soft_skill") {
            if (confidence !== undefined && confidence < 80) continue;
            softSkillsSet.add(name);
            continue;
        }

        if (confidence !== undefined && confidence < 70) continue;
        techniquesSet.add(name);
    }

    // Soft skills déduites
    const softDeduites = Array.isArray(contexte?.soft_skills_deduites) ? contexte.soft_skills_deduites : [];
    for (const item of softDeduites) {
        const name = typeof item === "string" ? item : item?.nom || item?.name;
        if (name && String(name).trim() && shouldKeep(String(name).trim())) {
            softSkillsSet.add(String(name).trim());
        }
    }

    return {
        techniques: Array.from(techniquesSet),
        soft_skills: Array.from(softSkillsSet),
    };
}
