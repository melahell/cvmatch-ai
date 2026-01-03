"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Upload, Link2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Mode = "url" | "text" | "file";

// Validation utilities - Phase 0 Items 2 & 3
const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.txt'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const validateJobFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(ext)) {
        return `Format non supporté. Utilisez : ${ALLOWED_FILE_TYPES.join(', ')}`;
    }

    if (file.size > MAX_FILE_SIZE) {
        return `Fichier trop volumineux (maximum 5MB)`;
    }

    return null;
};

const validateUrl = (urlString: string): boolean => {
    if (!urlString) return false;
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

export default function AnalyzePage() {
    const router = useRouter();
    const { userId } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<Mode>("text");
    const [url, setUrl] = useState("");
    const [text, setText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;

        // Phase 0 Item 2: File validation
        const validationError = validateJobFile(f);
        if (validationError) {
            toast.error(validationError);
            e.target.value = ''; // Reset input
            return;
        }

        setFile(f);
    };

    const handleAnalyze = async () => {
        if (mode === "url" && !url) return;
        if (mode === "text" && !text) return;
        if (mode === "file" && !file) return;
        if (!userId) return;

        setLoading(true);
        try {
            let jobText = text;

            // If file mode, convert file to base64 and send for extraction
            if (mode === "file" && file) {
                const reader = new FileReader();
                const base64 = await new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });

                // Send to API with file data
                const res = await fetch("/api/match/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        fileData: base64,
                        fileName: file.name,
                        fileType: file.type
                    }),
                });

                const data = await res.json();
                if (!res.ok) {
                    alert(`⚠️ ${data.error}`);
                    return;
                }
                router.push(`/dashboard/analyze/${data.analysis_id}`);
                return;
            }

            const res = await fetch("/api/match/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    jobUrl: mode === "url" ? url : undefined,
                    jobText: mode === "text" ? text : undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Phase 0 Item 4: Improved error handling
                if (res.status === 401) {
                    toast.error('Session expirée. Reconnectez-vous.');
                    router.push('/login');
                    return;
                }

                if (res.status === 413) {
                    toast.error('Fichier trop volumineux');
                    return;
                }

                if (res.status === 429) {
                    toast.error('Trop de requêtes. Réessayez dans 1 minute.');
                    return;
                }

                toast.error(data.error || 'Erreur lors de l\'analyse');
                return;
            }

            router.push(`/dashboard/analyze/${data.analysis_id}`);

        } catch (error: any) {
            console.error("Analyze error:", error);
            // Phase 0 Item 4: Network error handling
            if (error instanceof TypeError) {
                toast.error('Erreur de connexion. Vérifiez votre internet.');
            } else {
                toast.error('Erreur inattendue. Réessayez.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isReady = (mode === "url" && url) || (mode === "text" && text) || (mode === "file" && file);

    return (
        <DashboardLayout>
            <div className="container mx-auto max-w-2xl py-10 px-4">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Nouvelle Analyse 🎯</h1>
                    <p className="text-slate-500">
                        Compare ton profil avec une offre d'emploi
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        {/* Mode Selector */}
                        <div className="flex justify-center bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setMode("url")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "url" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                <Link2 className="w-4 h-4" /> URL
                            </button>
                            <button
                                onClick={() => setMode("text")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "text" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                <FileText className="w-4 h-4" /> Texte
                            </button>
                            <button
                                onClick={() => setMode("file")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "file" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                <Upload className="w-4 h-4" /> Fichier
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {mode === "url" && (
                            <div className="space-y-2">
                                <Label htmlFor="url">URL de l'offre</Label>
                                <Input
                                    id="url"
                                    type="url"
                                    placeholder="https://example.com/job-posting"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    disabled={loading}
                                    onBlur={() => {
                                        if (url && !validateUrl(url)) {
                                            toast.error('URL invalide (doit commencer par http:// ou https://)');
                                        }
                                    }}
                                />
                                <p className="text-xs text-amber-600">
                                    ⚠️ Certains sites bloquent la lecture. Si erreur, utilisez Texte ou Fichier.
                                </p>
                            </div>
                        )}

                        {mode === "text" && (
                            <div className="space-y-2">
                                <Label htmlFor="text">Texte de l'offre</Label>
                                <Textarea
                                    id="text"
                                    rows={8}
                                    className="min-h-[200px]"
                                    placeholder="Collez-collez ici la description complète du poste..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    disabled={loading}
                                />
                                <p className="text-xs text-slate-400">
                                    💡 Méthode la plus fiable
                                </p>
                            </div>
                        )}

                        {mode === "file" && (
                            <div className="space-y-2">
                                <Label>PDF ou Screenshot de l'offre</Label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file ? "border-green-500 bg-green-50" : "border-slate-300 hover:border-blue-400"
                                        }`}
                                >
                                    {file ? (
                                        <div className="space-y-2">
                                            <div className="text-green-600 font-medium">✅ {file.name}</div>
                                            <div className="text-xs text-slate-400">Cliquez pour changer</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Upload className="w-10 h-10 mx-auto text-slate-400" />
                                            <div className="text-slate-600">Cliquez pour uploader</div>
                                            <div className="text-xs text-slate-400">PDF, PNG, JPG acceptés</div>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                            onClick={handleAnalyze}
                            disabled={loading || !isReady}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyse en cours...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" /> Analyser le Match
                                </>
                            )}
                        </Button>

                    </CardContent>
                </Card>

                <div className="mt-6 text-center text-sm text-slate-400">
                    L'IA compare ton profil RAG avec les critères de cette offre.
                </div>
            </div>
        </DashboardLayout>
    );
}
