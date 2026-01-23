"use client";

/**
 * DraggableCV - Wrapper avec DndContext pour CV interactif
 * 
 * Fournit le contexte drag & drop pour réorganiser :
 * - Expériences (ordre des expériences)
 * - Compétences (ordre des compétences)
 * - Bullets (réalisations dans chaque expérience)
 */

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { ReactNode } from "react";
import type { RendererResumeSchema } from "@/lib/cv/renderer-schema";

interface DraggableCVProps {
    cvData: RendererResumeSchema;
    onReorderExperiences?: (newOrder: number[]) => void;
    onReorderTechniques?: (newOrder: number[]) => void;
    onReorderSoftSkills?: (newOrder: number[]) => void;
    onReorderBullets?: (experienceIndex: number, newOrder: number[]) => void;
    children: ReactNode;
    className?: string;
}

export function DraggableCV({
    cvData,
    onReorderExperiences,
    onReorderTechniques,
    onReorderSoftSkills,
    onReorderBullets,
    children,
    className,
}: DraggableCVProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px de mouvement avant activation
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const activeId = String(active.id);
        const overId = String(over.id);

        // Détecter le type de drag (expérience, compétence, bullet)
        if (activeId.startsWith("exp-")) {
            // Réorganisation d'expériences
            const activeIndex = parseInt(activeId.replace("exp-", ""), 10);
            const overIndex = parseInt(overId.replace("exp-", ""), 10);

            if (!isNaN(activeIndex) && !isNaN(overIndex)) {
                const currentOrder = cvData.experiences.map((_, i) => i);
                const newOrder = arrayMove(currentOrder, activeIndex, overIndex);
                onReorderExperiences?.(newOrder);
            }
        } else if (activeId.startsWith("skill-tech-")) {
            // Réorganisation compétences techniques
            const activeIndex = parseInt(activeId.replace("skill-tech-", ""), 10);
            const overIndex = parseInt(overId.replace("skill-tech-", ""), 10);

            if (!isNaN(activeIndex) && !isNaN(overIndex)) {
                const currentOrder = cvData.competences.techniques.map((_, i) => i);
                const newOrder = arrayMove(currentOrder, activeIndex, overIndex);
                onReorderTechniques?.(newOrder);
            }
        } else if (activeId.startsWith("skill-soft-")) {
            // Réorganisation soft skills
            const activeIndex = parseInt(activeId.replace("skill-soft-", ""), 10);
            const overIndex = parseInt(overId.replace("skill-soft-", ""), 10);

            if (!isNaN(activeIndex) && !isNaN(overIndex) && cvData.competences.soft_skills) {
                const currentOrder = cvData.competences.soft_skills.map((_, i) => i);
                const newOrder = arrayMove(currentOrder, activeIndex, overIndex);
                onReorderSoftSkills?.(newOrder);
            }
        } else if (activeId.startsWith("bullet-")) {
            // Réorganisation bullets dans une expérience
            const match = activeId.match(/^bullet-exp-(\d+)-(\d+)$/);
            const overMatch = overId.match(/^bullet-exp-(\d+)-(\d+)$/);

            if (match && overMatch) {
                const expIndex = parseInt(match[1], 10);
                const activeBulletIndex = parseInt(match[2], 10);
                const overBulletIndex = parseInt(overMatch[2], 10);

                if (!isNaN(expIndex) && !isNaN(activeBulletIndex) && !isNaN(overBulletIndex)) {
                    const exp = cvData.experiences[expIndex];
                    if (exp) {
                        const currentOrder = exp.realisations.map((_, i) => i);
                        const newOrder = arrayMove(currentOrder, activeBulletIndex, overBulletIndex);
                        onReorderBullets?.(expIndex, newOrder);
                    }
                }
            }
        }
    };

    return (
        <div className={className}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                {children}
            </DndContext>
        </div>
    );
}
