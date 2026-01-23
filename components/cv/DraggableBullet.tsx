"use client";

/**
 * DraggableBullet - Bullet point draggable dans une expérience
 * 
 * Permet de réorganiser les réalisations (bullets) d'une expérience
 * par drag & drop.
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableBulletProps {
    id: string;
    text: string;
    index: number;
    className?: string;
}

export function DraggableBullet({ id, text, index, className }: DraggableBulletProps) {
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
                "flex items-start gap-2 p-2 rounded-md hover:bg-slate-50 transition-colors group",
                isDragging && "bg-slate-100 shadow-md",
                className
            )}
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Réorganiser: ${text.slice(0, 30)}...`}
            >
                <GripVertical className="w-4 h-4" />
            </button>
            <div className="flex-1 text-sm text-slate-700">
                <span className="text-slate-500 mr-2">{index + 1}.</span>
                {text}
            </div>
        </div>
    );
}
