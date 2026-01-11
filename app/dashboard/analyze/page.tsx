"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
import { AnalysisHistory } from "@/components/analyze/AnalysisHistory";
import { ContextualLoader } from "@/components/loading/ContextualLoader";

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

// Phase 2 Item 3: Templates d'offres
const SAMPLE_JOBS = [
    {
        title: "Développeur Full-Stack React/Node",
        text: `Nous recherchons un développeur Full-Stack passionné pour rejoindre notre équipe.

Technologies requises :
- React, TypeScript
- Node.js, Express
- PostgreSQL, MongoDB
- Git, Docker

Expérience : 3-5 ans
Localisation : Paris (hybride 2j/semaine)
Salaire : 45-60K€`
    },
    {
        title: "Product Designer UI/UX",
        text: `Designer UI/UX expérimenté recherché pour créer des expériences utilisateur exceptionnelles.

Compétences :
- Figma, Sketch
- Design systems
- User research
- Prototypage

Expérience : 2-4 ans
Localisation : Remote
Salaire : 40-55K€`
    },
    {
        title: "Data Scientist Python",
        text: `Data Scientist pour analyser et modéliser nos données.

Stack :
- Python (Pandas, NumPy)
- Machine Learning (scikit-learn)
- SQL
- Jupyter

Expérience : 2-5 ans
Localisation : Lyon
Salaire : 42-58K€`
    }
];

export default function AnalyzePage() {
    const router = useRouter();
    const { userId } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<Mode>("text");

    // Phase 1 Item 6: Separate state per mode for memory
    const [urlValue, setUrlValue] = useState("");
    const [textValue, setTextValue] = useState("");
    const [fileValue, setFileValue] = useState<File | null>(null);

    // Active values
    const [url, setUrl] = useState("");
    const [text, setText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Phase 1 Item 10: File preview
    const [filePreview, setFilePreview] = useState<string>('');

    // Phase 1 Item 6: Tab memory - save when switching
    const handleModeChange = (newMode: Mode) => {
        // Save current
        if (mode === 'url') setUrlValue(url);
        if (mode === 'text') setTextValue(text);
        if (mode === 'file') setFileValue(file);

        // Load new
        setMode(newMode);
        if (newMode === 'url') setUrl(urlValue);
        if (newMode === 'text') setText(textValue);
        if (newMode === 'file') {
            setFile(fileValue);
            if (fileValue) generatePreview(fileValue);
        }
    };

    // Phase 1 Item 7: Auto-detect clipboard
    useEffect(() => {
        if (mode !== 'url') return;

        navigator.clipboard.readText().then(clipText => {
            if (validateUrl(clipText) && !url) {
                toast.info('URL détectée dans le presse-papier', {
                    duration: 5000,
                    action: {
                        label: 'Coller',
                        onClick: () => setUrl(clipText)
                    }
                });
            }
        }).catch(() => {
            return;
        });
    }, [mode, url]);

    // Phase 1 Item 10: Generate file preview
    const generatePreview = async (f: File) => {
        if (f.type === 'text/plain') {
            const content = await f.text();
            setFilePreview(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
        } else {
            setFilePreview(`📄 ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        await generatePreview(f);
    };

    // Phase 1 Item 8: Clean pasted text
    const cleanText = (text: string): string => {
        return text
            .replace(/\r\n/g, '\n') // Normalize line breaks
            .replace(/\n{3,}/g, '\n\n') // Max 2 line breaks
            .replace(/[ \t]+/g, ' ') // Multiple spaces → 1
            .trim();
    };

    const handleAnalyze = useCallback(async () => {
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
    }, [file, mode, router, text, url, userId]);

    // Phase 1 Item 3: Can analyze logic
    const canAnalyze = useMemo(() => {
        if (loading) return false;
        if (mode === 'text') return text.length >= 50;
        if (mode === 'url') return url && validateUrl(url);
        if (mode === 'file') return !!file;
        return false;
    }, [mode, text, url, file, loading]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (canAnalyze && !loading) {
                    handleAnalyze();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [canAnalyze, handleAnalyze, loading]);

    const isReady = (mode === "url" && url) || (mode === "text" && text) || (mode === "file" && file);

    // Show contextual loader during analysis
    if (loading) {
        return (
            <ContextualLoader
                context="analyzing-job"
            />
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto max-w-2xl py-2 sm:py-6 md:py-8 px-2 sm:px-4 pb-20 sm:pb-6">
                <div className="mb-2 sm:mb-6 text-center">
                    <h1 className="text-base sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">Nouvelle Analyse 🎯</h1>
                    <p className="text-xs text-slate-500 hidden sm:block">
                        {/* Phase 1 Item 5: Simplified message */}
                        Compare ton profil avec cette offre d'emploi
                    </p>
                </div>

                {/* Phase 1 Item 4: Recommended method badge - HIDDEN ON MOBILE */}
                <div className="hidden sm:block mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                        💡 <strong>Méthode recommandée</strong> : Copier-coller le texte de l'offre pour les meilleurs résultats
                    </p>
                </div>


                {/* Phase 2 Item 3: Templates - HIDDEN ON MOBILE */}
                <div className="hidden sm:block mb-4">
                    <p className="text-xs sm:text-sm text-slate-600 mb-2">Ou essayez avec un exemple :</p>
                    <div className="flex gap-2 flex-wrap">
                        {SAMPLE_JOBS.map(job => (
                            <Button
                                key={job.title}
                                variant="outline"
                                size="sm"
                                className="text-xs sm:text-sm"
                                onClick={() => {
                                    setMode('text');
                                    setText(job.text);
                                }}
                                disabled={loading}
                            >
                                {job.title}
                            </Button>
                        ))}
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                        {/* Phase 1 Item 1: Mode Selector with icons + disabled state */}
                        <div className="flex justify-center bg-slate-100 p-0.5 sm:p-1 rounded-lg">
                            <button
                                onClick={() => handleModeChange("url")}
                                disabled={loading}
                                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 ${mode === "url" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                <Link2 className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">URL</span><span className="sm:hidden">URL</span>
                            </button>
                            <button
                                onClick={() => handleModeChange("text")}
                                disabled={loading}
                                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 ${mode === "text" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> Texte
                                <span className="hidden sm:inline ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">Recommandé</span>
                            </button>
                            <button
                                onClick={() => handleModeChange("file")}
                                disabled={loading}
                                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 ${mode === "file" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                <Upload className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Fichier</span><span className="sm:hidden">PDF</span>
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-6 p-3 sm:p-6">

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
                                {/* Phase 1 Item 2: Enlarged textarea with resize */}
                                <Textarea
                                    id="text"
                                    rows={6}
                                    className="min-h-[120px] sm:min-h-[300px] resize-y text-sm"
                                    placeholder="Collez la description du poste..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    disabled={loading}
                                />
                                {/* Character count + cleanup button */}
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-400">
                                        {text.length} caractères {text.length >= 50 ? '✓' : '(minimum 50)'}
                                    </p>
                                    {/* Phase 1 Item 8: Cleanup button */}
                                    {text && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setText(cleanText(text))}
                                            disabled={loading}
                                        >
                                            ✨ Nettoyer le texte
                                        </Button>
                                    )}
                                </div>
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
                                        accept=".pdf,.doc,.docx,.txt"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={loading}
                                    />
                                </div>
                                {/* Phase 1 Item 10: File preview */}
                                {file && filePreview && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded border">
                                        <p className="text-sm font-medium mb-2">Aperçu :</p>
                                        <pre className="text-xs text-slate-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                            {filePreview}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            onClick={handleAnalyze}
                            disabled={!canAnalyze}
                            className="w-full sm:w-auto sm:px-8"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Analyse en cours...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Analyser le Match
                                </>
                            )}
                        </Button>
                        {/* Phase 1 Item 9: Keyboard shortcut hint */}
                        <p className="text-xs text-center text-slate-400 mt-2">
                            Raccourci : Ctrl+Enter (ou Cmd+Enter sur Mac)
                        </p>

                    </CardContent>
                </Card>

                {/* Phase 2 Item 1: Historique des analyses */}
                {userId && (
                    <div className="mt-4 sm:mt-12">
                        <h2 className="text-base sm:text-xl font-bold mb-2 sm:mb-4">Historique</h2>
                        <AnalysisHistory userId={userId} />
                    </div>
                )}

                <div className="mt-6 text-center text-sm text-slate-400">
                    L'IA compare ton profil RAG avec les critères de cette offre.
                </div>
            </div>
        </DashboardLayout>
    );
}
