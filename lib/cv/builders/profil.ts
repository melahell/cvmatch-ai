/**
 * Builder pour le profil utilisateur
 * Extrait de ai-adapter.ts pour modularité
 * 
 * [AUDIT FIX CRITIQUE-3] : Propagation des infos de contact et photo depuis RAG
 * [CDC Phase 3.1] Refactoring architecture
 */

import type { AIWidgetsEnvelope, AIWidget } from "../ai-widgets";
import type { RendererResumeSchema } from "../renderer-schema";

/**
 * [AUDIT FIX CRITIQUE-3] : Construit le profil en enrichissant depuis le RAG
 */
export function buildProfil(
    payload: AIWidgetsEnvelope,
    headerWidgets: AIWidget[],
    ragProfile?: any
): RendererResumeSchema["profil"] {
    const base = payload.profil_summary || {};
    const job = payload.job_context || {};
    const ragProfil = ragProfile?.profil || {};
    const ragContact = ragProfil?.contact || {};

    // Chercher un éventuel bloc de résumé prioritaire
    const summaryWidget = headerWidgets.find((w) => w.type === "summary_block");
    const elevator_pitch = summaryWidget?.text || base.elevator_pitch || ragProfil.elevator_pitch;

    return {
        prenom: base.prenom || ragProfil.prenom || "",
        nom: base.nom || ragProfil.nom || "",
        titre_principal: base.titre_principal || ragProfil.titre_principal || (job.job_title || "").trim() || "Profil",
        // [AUDIT FIX CRITIQUE-3] : Enrichir les contacts depuis RAG
        email: ragContact.email || ragProfil.email || undefined,
        telephone: ragContact.telephone || ragProfil.telephone || undefined,
        localisation: base.localisation || ragProfil.localisation || undefined,
        linkedin: ragContact.linkedin || ragProfil.linkedin || undefined,
        github: ragContact.github || ragProfil.github || undefined,
        portfolio: ragContact.portfolio || ragProfil.portfolio || undefined,
        elevator_pitch: elevator_pitch,
        // [AUDIT FIX CRITIQUE-3] : Propager photo depuis RAG
        photo_url: ragProfil.photo_url || undefined,
    };
}
