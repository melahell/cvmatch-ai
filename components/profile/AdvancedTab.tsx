"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface AdvancedTabProps {
    customNotes: string;
    onNotesChange: (notes: string) => void;
    onReset: () => Promise<void>;
}

export function AdvancedTab({ customNotes, onNotesChange, onReset }: AdvancedTabProps) {
    const [resetting, setResetting] = useState(false);

    const handleReset = async () => {
        if (!confirm("⚠️ ATTENTION : Ceci va supprimer TOUS vos documents et votre profil  RAG. Cette action est irréversible. Continuer ?")) {
            return;
        }

        setResetting(true);
        await onReset();
        setResetting(false);
    };

    return (
        <div className="space-y-6">
            {/* Custom Notes */}
            <Card>
                <CardHeader>
                    <CardTitle>Notes personnalisées</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={customNotes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        placeholder="Ajoutez des notes personnelles sur votre profil... Ces notes seront prises en compte lors de la génération de CVs."
                        rows={6}
                        className="w-full"
                    />
                    <p className="text-xs text-slate-600 mt-2">
                        💡 Ces notes ne seront pas affichées dans le CV mais influenceront le contenu généré
                    </p>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-5 h-5" />
                        Zone dangereuse
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-medium text-red-900 mb-2">Réinitialiser le profil RAG</h4>
                        <p className="text-sm text-red-700 mb-4">
                            Cette action supprimera :
                        </p>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1 mb-4">
                            <li>Tous vos documents uploadés</li>
                            <li>Toutes les données RAG extraites</li>
                            <li>Toutes les pondérations personnalisées</li>
                            <li>Toutes vos notes personnelles</li>
                        </ul>
                        <p className="text-sm text-red-700 mb-4">
                            ⚠️ <strong>Cette action est irréversible</strong> et ne peut pas être annulée.
                        </p>
                        <Button
                            variant="destructive"
                            onClick={handleReset}
                            disabled={resetting}
                        >
                            {resetting ? "Réinitialisation..." : "Réinitialiser tout le profil"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Info */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <p className="text-sm text-blue-900">
                        <strong>💡 Conseil :</strong> Si vous souhaitez simplement mettre à jour votre profil,
                        uploadez de nouveaux documents dans l'onglet "Documents" et régénérez le profil depuis
                        l'onglet "Vue d'ensemble". La réinitialisation complète n'est nécessaire que si vous
                        voulez repartir de zéro.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
