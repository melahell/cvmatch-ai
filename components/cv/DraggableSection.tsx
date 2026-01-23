"use client";

/**
 * DraggableSection - Section draggable (expérience, compétence, etc.)
 * 
 * Permet de réorganiser les sections principales du CV par drag & drop.
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DraggableSectionProps {
    id: string;
    children: ReactNode;
    className?: string;
    title?: string;
}

export function DraggableSection({ id, children, className, title }: DraggableSectionProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative group",
                isDragging && "z-50 shadow-lg",
                className
            )}
        >
            <div className="absolute left-0 top-0 h-full w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1"
                    aria-label={`Réorganiser ${title || "section"}`}
                >
                    <GripVertical className="w-4 h-4" />
                </button>
            </div>
            <div className={cn("pl-6", isDragging && "border-2 border-dashed border-indigo-300 rounded-md")}>
                {children}
            </div>
        </div>
    );
}
