"use client";

import { useState } from "react";
import { Check, Archive as ArchiveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ArchiveToggleProps {
    showArchived: boolean;
    onToggle: () => void;
    archivedCount: number;
}

export function ArchiveToggle({ showArchived, onToggle, archivedCount }: ArchiveToggleProps) {
    return (
        <Button
            variant={showArchived ? "primary" : "outline"}
            size="sm"
            onClick={onToggle}
            className="gap-2"
        >
            {showArchived ? <Check className="w-4 h-4" /> : <ArchiveIcon className="w-4 h-4" />}
            {showArchived ? "Masquer" : "Afficher"} archivées ({archivedCount})
        </Button>
    );
}

// Helper function to archive jobs
export async function archiveJobs(jobIds: string[], archived: boolean = true) {
    try {
        const response = await fetch('/api/tracking/archive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobIds, archived }),
        });

        if (!response.ok) {
            throw new Error('Failed to archive');
        }

        const { count } = await response.json();
        toast.success(`${count} candidature(s) ${archived ? 'archivée(s)' : 'restaurée(s)'}`);
        return true;
    } catch (error) {
        toast.error("Erreur lors de l'archivage");
        return false;
    }
}
