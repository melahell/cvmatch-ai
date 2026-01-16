"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Trash2, Upload, Loader2 } from "lucide-react";
import { useState, useRef } from "react";

interface Document {
    id: string;
    filename: string;
    file_type: string;
    created_at: string;
    extraction_status: string;
}

interface DocumentsTabProps {
    documents: Document[];
    onDelete: (id: string) => Promise<void>;
    onUpload: (file: File) => Promise<void>;
    uploading?: boolean;
}

export function DocumentsTab({ documents, onDelete, onUpload, uploading }: DocumentsTabProps) {
    const [deleting, setDeleting] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDelete = async (docId: string) => {
        if (!confirm("Supprimer ce document ? Le profil RAG ne sera pas mis à jour automatiquement.")) return;
        setDeleting(docId);
        await onDelete(docId);
        setDeleting(null);
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
            {/* Upload Zone */}
            <Card className="border-dashed border-2 border-slate-300 bg-slate-50">
                <CardContent className="p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <h3 className="font-medium mb-2">Uploader un document</h3>
                    <p className="text-sm text-slate-500 mb-4">
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
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Upload en cours...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Choisir un fichier
                            </>
                        )}
                    </Button>
                    <p className="text-xs text-slate-400 mt-3">
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
                            <p className="text-slate-400">
                                Uploadez votre CV pour commencer
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <Card key={doc.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium truncate">{doc.filename}</div>
                                                <div className="text-xs text-slate-500">
                                                    {formatDate(doc.created_at)} • {doc.file_type}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={doc.extraction_status === "completed" ? "default" : "secondary"}
                                                className="shrink-0"
                                            >
                                                {doc.extraction_status === "completed" ? "Extrait" : "En cours"}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(doc.id)}
                                                disabled={deleting === doc.id}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                {deleting === doc.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
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
