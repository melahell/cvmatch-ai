"use client";

import { X, Trash2, Archive, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDropdown } from "./StatusDropdown";

interface BulkToolbarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onDeleteAll: () => void;
    onArchiveAll: () => void;
    onChangeStatusAll: (status: string) => void;
}

export function BulkToolbar({
    selectedCount,
    onClearSelection,
    onDeleteAll,
    onArchiveAll,
    onChangeStatusAll,
}: BulkToolbarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-900 text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-4">
                {/* Count */}
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="font-semibold">{selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}</span>
                </div>

                <div className="w-px h-6 bg-slate-700" />

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <StatusDropdown
                        currentStatus="pending"
                        onStatusChange={onChangeStatusAll}

                        size="sm"
                    />

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-slate-800 hover:text-white gap-2"
                        onClick={onArchiveAll}
                    >
                        <Archive className="w-4 h-4" />
                        <span className="hidden sm:inline">Archiver</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:bg-red-950 hover:text-red-300 gap-2"
                        onClick={onDeleteAll}
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Supprimer</span>
                    </Button>
                </div>

                <div className="w-px h-6 bg-slate-700" />

                {/* Close */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:bg-slate-800 hover:text-white"
                    onClick={onClearSelection}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
