"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag as TagIcon, X } from "lucide-react";

interface AnalysisTagsProps {
    tags: string[];
    onAddTag?: (tag: string) => void;
    onRemoveTag?: (tag: string) => void;
    editable?: boolean;
}

export function AnalysisTags({ tags, onAddTag, onRemoveTag, editable = false }: AnalysisTagsProps) {
    if (tags.length === 0 && !editable) return null;

    return (
        <div className="flex flex-wrap gap-2 items-center">
            <TagIcon className="w-4 h-4 text-slate-400" />
            {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    {editable && onRemoveTag && (
                        <button
                            onClick={() => onRemoveTag(tag)}
                            className="ml-1 hover:text-red-500"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </Badge>
            ))}
        </div>
    );
}
