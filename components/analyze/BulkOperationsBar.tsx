"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Archive, Tag } from "lucide-react";

interface BulkOperationsBarProps {
    selectedCount: number;
    onDelete?: () => void;
    onArchive?: () => void;
    onTag?: () => void;
    onClearSelection?: () => void;
}

export function BulkOperationsBar({
    selectedCount,
    onDelete,
    onArchive,
    onTag,
    onClearSelection
}: BulkOperationsBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-lg shadow-2xl px-4 py-3 flex items-center gap-4 z-50">
            <span className="font-medium">
                {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
            </span>
            <div className="h-4 w-px bg-slate-600" />
            {onTag && (
                <Button variant="ghost" size="sm" onClick={onTag} className="text-white hover:bg-slate-800">
                    <Tag className="w-4 h-4 mr-2" />
                    Tag
                </Button>
            )}
            {onArchive && (
                <Button variant="ghost" size="sm" onClick={onArchive} className="text-white hover:bg-slate-800">
                    <Archive className="w-4 h-4 mr-2" />
                    Archiver
                </Button>
            )}
            {onDelete && (
                <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-300 hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                </Button>
            )}
            {onClearSelection && (
                <Button variant="ghost" size="sm" onClick={onClearSelection} className="text-white hover:bg-slate-800">
                    Annuler
                </Button>
            )}
        </div>
    );
}
