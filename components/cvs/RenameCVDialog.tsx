"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";

interface RenameCVDialogProps {
    cvId: string;
    currentName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function RenameCVDialog({ cvId, currentName, open, onOpenChange, onSuccess }: RenameCVDialogProps) {
    const [newName, setNewName] = useState(currentName);
    const [saving, setSaving] = useState(false);

    const handleRename = async () => {
        if (!newName.trim()) {
            toast.error("Le nom ne peut pas être vide");
            return;
        }

        setSaving(true);
        try {
            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from("cv_generations")
                .update({ custom_name: newName.trim() })
                .eq("id", cvId);

            if (error) throw error;

            toast.success("CV renommé avec succès");
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            toast.error("Erreur: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Renommer le CV</DialogTitle>
                    <DialogDescription>
                        Donnez un nom personnalisé à votre CV pour mieux le retrouver
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nouveau nom</Label>
                        <Input
                            id="name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Ex: CV Tech Lead Startup"
                            onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleRename} disabled={saving}>
                        {saving ? "Enregistrement..." : "Renommer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
