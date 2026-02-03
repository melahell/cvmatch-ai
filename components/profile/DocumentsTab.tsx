"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Trash2, Upload, Loader2, Eye, Download } from "lucide-react";
import { useState, useRef } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";
import ContextualLoader from "@/components/loading/ContextualLoader";

interface Document {
    id: string;
    filename: string;
    file_type: string;
    created_at: string;
    extraction_status: string;
    storage_path?: string;
}

interface DocumentsTabProps {
    documents: Document[];
    onDelete: (id: string) => Promise<void | boolean>;
    onUpload: (file: File) => Promise<void>;
    uploading?: boolean;
}

export function DocumentsTab({ documents, onDelete, onUpload, uploading }: DocumentsTabProps) {
    const [deleting, setDeleting] = useState<string | null>(null);
    const [viewing, setViewing] = useState<string | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDelete = async (docId: string) => {
        if (!confirm("Supprimer ce document ? Le profil RAG ne sera pas mis à jour automatiquement.")) return;
        setDeleting(docId);
        await onDelete(docId);
        setDeleting(null);
    };

    const handleView = async (doc: Document) => {
        if (!doc.storage_path) {
            toast.error("Chemin de stockage non disponible");
            return;
        }

        setViewing(doc.id);
        try {
            const supabase = createSupabaseClient();
            const { data, error } = await supabase.storage
                .from('documents')
                .createSignedUrl(doc.storage_path, 3600); // 1 heure

            if (error || !data?.signedUrl) {
                toast.error("Impossible d'ouvrir le document");
                return;
            }

            window.open(data.signedUrl, '_blank');
        } catch (e) {
            toast.error("Erreur lors de l'ouverture du document");
        } finally {
            setViewing(null);
        }
    };

    const handleDownload = async (doc: Document) => {
        if (!doc.storage_path) {
            toast.error("Chemin de stockage non disponible");
            return;
        }

        setDownloading(doc.id);
        try {
            const supabase = createSupabaseClient();
            const { data, error } = await supabase.storage
                .from('documents')
                .createSignedUrl(doc.storage_path, 3600); // 1 heure

            if (error || !data?.signedUrl) {
                toast.error("Impossible de télécharger le document");
                return;
            }

            const a = document.createElement('a');
            a.href = data.signedUrl;
            a.download = doc.filename;
            a.click();
            toast.success("Téléchargement démarré");
        } catch (e) {
            toast.error("Erreur lors du téléchargement");
        } finally {
            setDownloading(null);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await onUpload(file);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="space-y-6">
            {uploading && <ContextualLoader context="importing-docs" isOverlay />}
            {/* Upload Zone */}
            <Card className="border-dashed border-2 border-slate-300 bg-slate-50">
                <CardContent className="p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                    <h3 className="font-medium mb-2">Uploader un document</h3>
                    <p className="text-sm text-slate-600 mb-4">
                        CV, lettre de motivation, certificats... (PDF, DOCX, TXT)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" />
                                Upload en cours...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Choisir un fichier
                            </>
                        )}
                    </Button>
                    <p className="text-xs text-slate-600 mt-3">
                        💡 Après upload, régénérez le profil dans l'onglet "Vue d'ensemble"
                    </p>
                </CardContent>
            </Card>

            {/* Documents List */}
            <div>
                <h3 className="text-lg font-medium mb-4">
                    Documents ({documents.length})
                </h3>
                {documents.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-medium text-slate-600 mb-2">Aucun document</h3>
                            <p className="text-slate-600">
                                Uploadez votre CV pour commencer
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2 max-w-4xl">
                        {documents.map((doc) => (
                            <Card key={doc.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium truncate" title={doc.filename}>
                                                    {doc.filename}
                                                </div>
                                                <div className="text-xs text-slate-600">
                                                    {formatDate(doc.created_at)} • {doc.file_type}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge
                                                variant={doc.extraction_status === "completed" ? "success" : "neutral"}
                                                className="shrink-0"
                                            >
                                                {doc.extraction_status === "completed" ? "Extrait" : "En cours"}
                                            </Badge>
                                            {doc.storage_path && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleView(doc)}
                                                        disabled={viewing === doc.id}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Voir le document"
                                                    >
                                                        {viewing === doc.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownload(doc)}
                                                        disabled={downloading === doc.id}
                                                        className="text-slate-600 hover:text-slate-800"
                                                        title="Télécharger le document"
                                                    >
                                                        {downloading === doc.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" />
                                                        ) : (
                                                            <Download className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(doc.id)}
                                                disabled={deleting === doc.id}
                                                className="text-red-500 hover:text-red-700"
                                                title="Supprimer le document"
                                            >
                                                {deleting === doc.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
