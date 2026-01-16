"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileText, Loader2, X, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";

interface ExportDataModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ExportDataModal({ isOpen, onClose }: ExportDataModalProps) {
    const { userId } = useAuth();
    const [exporting, setExporting] = useState(false);
    const [format, setFormat] = useState<"json" | "txt">("json");

    if (!isOpen) return null;

    const handleExport = async () => {
        if (!userId) {
            toast.error("Utilisateur non connecté");
            return;
        }

        setExporting(true);

        try {
            const supabase = createSupabaseClient();

            // Fetch all user data
            const [ragData, analyses, cvs, applications] = await Promise.all([
                supabase.from("rag_metadata").select("*").eq("user_id", userId).single(),
                supabase.from("job_analyses").select("*").eq("user_id", userId),
                supabase.from("generated_cvs").select("*").eq("user_id", userId),
                supabase.from("applications").select("*").eq("user_id", userId),
            ]);

            const exportData = {
                exported_at: new Date().toISOString(),
                user_id: userId,
                profile: ragData.data?.completeness_details || {},
                analyses: analyses.data || [],
                generated_cvs: cvs.data || [],
                applications: applications.data || [],
            };

            let blob: Blob;
            let filename: string;

            if (format === "json") {
                blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
                filename = `cvcrush_export_${new Date().toISOString().split('T')[0]}.json`;
            } else {
                // Convert to readable text format
                let text = `=== EXPORT CV CRUSH ===\n`;
                text += `Date: ${new Date().toLocaleString('fr-FR')}\n\n`;

                text += `--- PROFIL ---\n`;
                text += JSON.stringify(exportData.profile, null, 2) + "\n\n";

                text += `--- ANALYSES (${exportData.analyses.length}) ---\n`;
                exportData.analyses.forEach((a: any, i: number) => {
                    text += `${i + 1}. ${a.job_title || 'N/A'} - ${a.company || 'N/A'} (Score: ${a.match_score}%)\n`;
                });
                text += "\n";

                text += `--- CV GÉNÉRÉS (${exportData.generated_cvs.length}) ---\n`;
                exportData.generated_cvs.forEach((cv: any, i: number) => {
                    text += `${i + 1}. ${cv.title || 'CV'} - ${new Date(cv.created_at).toLocaleDateString('fr-FR')}\n`;
                });
                text += "\n";

                text += `--- CANDIDATURES (${exportData.applications.length}) ---\n`;
                exportData.applications.forEach((app: any, i: number) => {
                    text += `${i + 1}. ${app.company} - ${app.position} (${app.status})\n`;
                });

                blob = new Blob([text], { type: "text/plain" });
                filename = `cvcrush_export_${new Date().toISOString().split('T')[0]}.txt`;
            }

            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Export téléchargé avec succès !");
            onClose();
        } catch (error: any) {
            console.error("Export error:", error);
            toast.error("Erreur lors de l'export");
        } finally {
            setExporting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            Exporter mes données
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Téléchargez une copie de toutes vos données conformément au RGPD.
                    </p>

                    {/* Format Selection */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={() => setFormat("json")}
                            className={`p-4 rounded-lg border-2 transition-all ${format === "json"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                }`}
                        >
                            <FileJson className={`w-8 h-8 mx-auto mb-2 ${format === "json" ? "text-blue-600" : "text-slate-400"
                                }`} />
                            <p className={`font-medium ${format === "json" ? "text-blue-600" : "text-slate-700 dark:text-slate-300"
                                }`}>JSON</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Format technique</p>
                        </button>

                        <button
                            onClick={() => setFormat("txt")}
                            className={`p-4 rounded-lg border-2 transition-all ${format === "txt"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                }`}
                        >
                            <FileText className={`w-8 h-8 mx-auto mb-2 ${format === "txt" ? "text-blue-600" : "text-slate-400"
                                }`} />
                            <p className={`font-medium ${format === "txt" ? "text-blue-600" : "text-slate-700 dark:text-slate-300"
                                }`}>Texte</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Lisible</p>
                        </button>
                    </div>

                    {/* What's included */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Inclus dans l'export :
                        </p>
                        <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Profil complet
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Historique des analyses
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" /> CV générés
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Candidatures
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 dark:border-slate-700 dark:text-slate-300"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={exporting}
                            className="flex-1"
                        >
                            {exporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Export...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Télécharger
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
