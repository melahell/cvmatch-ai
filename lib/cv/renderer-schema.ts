/**
 * Schéma de rendu cible pour le moteur de CV.
 *
 * Au lieu d'introduire un nouveau format, on réutilise le type `CVData`
 * déjà utilisé par tous les templates (`components/cv/templates`).
 *
 * Le rôle du bridge (AIAdapter) sera donc de convertir AI_WIDGETS_SCHEMA
 * vers ce type unique `RendererResumeSchema`.
 */

import type { CVData } from "@/components/cv/templates";

export type RendererResumeSchema = CVData;

