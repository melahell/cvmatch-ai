"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: "À faire", bg: "bg-slate-100", text: "text-slate-700" },
    applied: { label: "Postulé", bg: "bg-blue-100", text: "text-blue-700" },
    interviewing: { label: "Entretien", bg: "bg-purple-100", text: "text-purple-700" },
    rejected: { label: "Refusé", bg: "bg-red-100", text: "text-red-700" },
    offer: { label: "Offre reçue", bg: "bg-green-100", text: "text-green-700" },
};

interface StatusDropdownProps {
    currentStatus: string;
    onStatusChange: (newStatus: string) => void;
    size?: "sm" | "md";
}

export function StatusDropdown({ currentStatus, onStatusChange, size = "md" }: StatusDropdownProps) {
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [selectValue, setSelectValue] = useState(currentStatus);

    const currentConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setSelectValue(currentStatus); // Reset visual immediately
        setPendingStatus(newValue); // Open confirmation
    };

    const confirmChange = () => {
        if (pendingStatus) {
            onStatusChange(pendingStatus);
            setSelectValue(pendingStatus);
            setPendingStatus(null);
        }
    };

    const cancelChange = () => {
        setSelectValue(currentStatus);
        setPendingStatus(null);
    };

    return (
        <>
            <select
                className={`font-medium border-0 rounded-lg cursor-pointer ${size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1.5"
                    } ${currentConfig.bg} ${currentConfig.text}`}
                value={selectValue}
                onChange={handleSelectChange}
            >
                <option value="pending">À faire</option>
                <option value="applied">Postulé</option>
                <option value="interviewing">Entretien</option>
                <option value="rejected">Refusé</option>
                <option value="offer">Offre reçue</option>
            </select>

            <AlertDialog open={!!pendingStatus} onOpenChange={(open) => !open && cancelChange()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer le changement de statut</AlertDialogTitle>
                        <AlertDialogDescription>
                            Voulez-vous vraiment changer le statut de{" "}
                            <span className="font-semibold">&quot;{STATUS_CONFIG[currentStatus]?.label}&quot;</span> à{" "}
                            <span className="font-semibold">&quot;{pendingStatus ? STATUS_CONFIG[pendingStatus]?.label : ""}&quot;</span> ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelChange}>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmChange}>Confirmer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
