/**
 * Hook pour réorganisation interactive du CV (Drag & Drop)
 * 
 * Gère la réorganisation des sections et bullets avec sauvegarde automatique
 * dans localStorage pour persister l'ordre personnalisé.
 */

import { useState, useCallback, useEffect } from "react";
import type { RendererResumeSchema } from "@/lib/cv/renderer-schema";

interface ReorderState {
    experiences: RendererResumeSchema["experiences"];
    competences: {
        techniques: string[];
        soft_skills?: string[];
    };
    customOrder: {
        experiences: number[]; // Indices dans l'ordre original
        competences: {
            techniques: number[];
            soft_skills?: number[];
        };
    };
}

const REORDER_CACHE_PREFIX = "cv_reorder:";

/**
 * Sauvegarde l'ordre personnalisé dans localStorage
 */
function saveReorderToCache(analysisId: string, customOrder: ReorderState["customOrder"]): void {
    try {
        const key = `${REORDER_CACHE_PREFIX}${analysisId}`;
        localStorage.setItem(key, JSON.stringify(customOrder));
    } catch (error) {
        console.error("Erreur sauvegarde ordre:", error);
    }
}

/**
 * Récupère l'ordre personnalisé depuis localStorage
 */
function getReorderFromCache(analysisId: string): ReorderState["customOrder"] | null {
    try {
        const key = `${REORDER_CACHE_PREFIX}${analysisId}`;
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        return JSON.parse(cached);
    } catch (error) {
        console.error("Erreur récupération ordre:", error);
        return null;
    }
}

export function useCVReorder(
    cvData: RendererResumeSchema | null,
    analysisId: string
) {
    const [reorderedCV, setReorderedCV] = useState<RendererResumeSchema | null>(cvData);
    const [customOrder, setCustomOrder] = useState<ReorderState["customOrder"] | null>(null);

    // Charger ordre personnalisé au montage
    useEffect(() => {
        if (analysisId) {
            const cached = getReorderFromCache(analysisId);
            if (cached) {
                setCustomOrder(cached);
            }
        }
    }, [analysisId]);

    // Appliquer ordre personnalisé quand CV ou ordre change
    useEffect(() => {
        if (!cvData) {
            setReorderedCV(null);
            return;
        }

        if (!customOrder) {
            setReorderedCV(cvData);
            return;
        }

        // Réorganiser expériences
        const reorderedExperiences = customOrder.experiences
            .map((idx) => cvData.experiences[idx])
            .filter(Boolean);

        // Réorganiser compétences
        const reorderedTechniques = customOrder.competences.techniques
            .map((idx) => cvData.competences.techniques[idx])
            .filter(Boolean);

        const reorderedSoftSkills = customOrder.competences.soft_skills
            ? customOrder.competences.soft_skills
                  .map((idx) => cvData.competences.soft_skills?.[idx])
                  .filter((s): s is string => Boolean(s))
            : cvData.competences.soft_skills;

        setReorderedCV({
            ...cvData,
            experiences: reorderedExperiences.length > 0 ? reorderedExperiences : cvData.experiences,
            competences: {
                techniques: reorderedTechniques.length > 0 ? reorderedTechniques : cvData.competences.techniques,
                soft_skills: reorderedSoftSkills,
            },
        });
    }, [cvData, customOrder]);

    // Réorganiser expériences
    const reorderExperiences = useCallback(
        (newOrder: number[]) => {
            if (!cvData) return;

            const order: ReorderState["customOrder"] = {
                experiences: newOrder,
                competences: customOrder?.competences || {
                    techniques: cvData.competences.techniques.map((_, i) => i),
                    soft_skills: cvData.competences.soft_skills
                        ? cvData.competences.soft_skills.map((_, i) => i)
                        : undefined,
                },
            };

            setCustomOrder(order);
            saveReorderToCache(analysisId, order);
        },
        [cvData, analysisId, customOrder]
    );

    // Réorganiser compétences techniques
    const reorderTechniques = useCallback(
        (newOrder: number[]) => {
            if (!cvData) return;

            const order: ReorderState["customOrder"] = {
                experiences: customOrder?.experiences || cvData.experiences.map((_, i) => i),
                competences: {
                    techniques: newOrder,
                    soft_skills: customOrder?.competences.soft_skills,
                },
            };

            setCustomOrder(order);
            saveReorderToCache(analysisId, order);
        },
        [cvData, analysisId, customOrder]
    );

    // Réorganiser soft skills
    const reorderSoftSkills = useCallback(
        (newOrder: number[]) => {
            if (!cvData || !cvData.competences.soft_skills) return;

            const order: ReorderState["customOrder"] = {
                experiences: customOrder?.experiences || cvData.experiences.map((_, i) => i),
                competences: {
                    techniques: customOrder?.competences.techniques || cvData.competences.techniques.map((_, i) => i),
                    soft_skills: newOrder,
                },
            };

            setCustomOrder(order);
            saveReorderToCache(analysisId, order);
        },
        [cvData, analysisId, customOrder]
    );

    // Réorganiser bullets d'une expérience
    const reorderExperienceBullets = useCallback(
        (experienceIndex: number, newBulletOrder: number[]) => {
            if (!cvData || !cvData.experiences[experienceIndex]) return;

            const exp = cvData.experiences[experienceIndex];
            const reorderedBullets = newBulletOrder.map((idx) => exp.realisations[idx]).filter(Boolean);

            const updatedExperiences = [...cvData.experiences];
            updatedExperiences[experienceIndex] = {
                ...exp,
                realisations: reorderedBullets.length > 0 ? reorderedBullets : exp.realisations,
            };

            setReorderedCV({
                ...cvData,
                experiences: updatedExperiences,
            });
        },
        [cvData]
    );

    // Réinitialiser ordre (retour à l'ordre original)
    const resetOrder = useCallback(() => {
        setCustomOrder(null);
        if (analysisId) {
            const key = `${REORDER_CACHE_PREFIX}${analysisId}`;
            localStorage.removeItem(key);
        }
        setReorderedCV(cvData);
    }, [cvData, analysisId]);

    return {
        reorderedCV,
        customOrder,
        reorderExperiences,
        reorderTechniques,
        reorderSoftSkills,
        reorderExperienceBullets,
        resetOrder,
    };
}
