"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Upload, Link2, FileText, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseAuthHeader } from "@/lib/supabase";
import { toast } from "sonner";
import { AnalysisHistory } from "@/components/analyze/AnalysisHistory";
import { ContextualLoader } from "@/components/loading/ContextualLoader";

// Validation utilities
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

// Templates d'offres
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

    // Unified state - all inputs visible
    const [url, setUrl] = useState("");
    const [text, setText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Drag & drop global state
    const [isDragging, setIsDragging] = useState(false);

    // File preview
    const [filePreview, setFilePreview] = useState<string>('');

    // Validation states
    const isTextValid = text.length >= 50;
    const isUrlValid = url ? validateUrl(url) : false;
    const isFileValid = !!file;

    // Auto-detect active input (priority: text > url > file)
    const activeInput = useMemo(() => {
        if (isTextValid) return 'text';
        if (isUrlValid) return 'url';
        if (isFileValid) return 'file';
        return null;
    }, [isTextValid, isUrlValid, isFileValid]);

    const canAnalyze = !loading && activeInput !== null;

    // Generate file preview
    const generatePreview = async (f: File) => {
        if (f.type === 'text/plain') {
            const content = await f.text();
            setFilePreview(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
        } else {
            setFilePreview(`📄 ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
        }
    };

    // Handle file selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;

        const validationError = validateJobFile(f);
        if (validationError) {
            toast.error(validationError);
            e.target.value = '';
            return;
        }

        setFile(f);
        await generatePreview(f);
        toast.success(`Fichier "${f.name}" ajouté`);
    };

    // Handle file drop
    const handleFileDrop = useCallback(async (f: File) => {
        const validationError = validateJobFile(f);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setFile(f);
        await generatePreview(f);
        toast.success(`Fichier "${f.name}" ajouté`);
    }, []);

    // Global drag & drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set to false if leaving the container entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            handleFileDrop(droppedFile);
        }
    }, [handleFileDrop]);

    // Smart paste handler - detects URL vs text
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const pastedText = e.clipboardData?.getData('text');
            if (!pastedText) return;

            // If pasting in a focused input, let it handle naturally
            const activeElement = document.activeElement;
            if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
                return;
            }

            // Smart detection
            if (validateUrl(pastedText)) {
                e.preventDefault();
                setUrl(pastedText);
                toast.success('URL détectée et collée');
            } else if (pastedText.length >= 20) {
                e.preventDefault();
                setText(prev => prev + pastedText);
                toast.success('Texte collé');
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    // Keyboard shortcut (Cmd/Ctrl + Enter)
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
    }, [loading, canAnalyze]);

    // Clean pasted text
    const cleanText = (text: string): string => {
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .trim();
    };

    // Clear file
    const clearFile = () => {
        setFile(null);
        setFilePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = async () => {
        if (!canAnalyze || !userId) return;

        setLoading(true);
        try {
            // Priority: text > url > file
            if (activeInput === 'file' && file) {
                const reader = new FileReader();
                const base64 = await new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });

                const authHeader = await getSupabaseAuthHeader();

                const res = await fetch("/api/match/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...authHeader },
                    body: JSON.stringify({
                        fileData: base64,
                        fileName: file.name,
                        fileType: file.type
                    }),
                });

                const data = await res.json();
                if (!res.ok) {
                    if (res.status === 401) {
                        toast.error('Session expirée. Reconnectez-vous.');
                        router.push('/login');
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
                return;
            }

            const authHeader = await getSupabaseAuthHeader();
            const res = await fetch("/api/match/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeader },
                body: JSON.stringify({
                    jobUrl: activeInput === 'url' ? url : undefined,
                    jobText: activeInput === 'text' ? text : undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error('Session expirée. Reconnectez-vous.');
                    router.push('/login');
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
            if (error instanceof TypeError) {
                toast.error('Erreur de connexion. Vérifiez votre internet.');
            } else {
                toast.error('Erreur inattendue. Réessayez.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Show contextual loader during analysis
    if (loading) {
        return <ContextualLoader context="analyzing-job" />;
    }

    return (
        <DashboardLayout>
            <div
                className={`container mx-auto max-w-2xl py-2 sm:py-6 md:py-8 px-2 sm:px-4 pb-20 sm:pb-6 min-h-screen transition-all ${isDragging ? 'bg-purple-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Drag overlay */}
                {isDragging && (
                    <div className="fixed inset-0 bg-purple-500/20 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
                        <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-dashed border-purple-500">
                            <Upload className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                            <p className="text-xl font-semibold text-purple-700">Déposez votre fichier ici</p>
                            <p className="text-sm text-slate-500 mt-2">PDF, DOC, DOCX ou TXT</p>
                        </div>
                    </div>
                )}

                <div className="mb-2 sm:mb-6 text-center">
                    <h1 className="text-base sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">Nouvelle Analyse 🎯</h1>
                    <p className="text-xs text-slate-600 hidden sm:block">
                        Compare ton profil avec cette offre d'emploi
                    </p>
                </div>

                {/* Templates - Desktop only */}
                <div className="hidden sm:block mb-4">
                    <p className="text-xs sm:text-sm text-slate-600 mb-2">Essayez avec un exemple :</p>
                    <div className="flex gap-2 flex-wrap">
                        {SAMPLE_JOBS.map(job => (
                            <Button
                                key={job.title}
                                variant="outline"
                                size="sm"
                                className="text-xs sm:text-sm"
                                onClick={() => setText(job.text)}
                                disabled={loading}
                            >
                                {job.title}
                            </Button>
                        ))}
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="space-y-6 p-4 sm:p-6">

                        {/* SECTION 1: TEXTE (Recommandé - Plus grand) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="text" className="flex items-center gap-2 text-base font-semibold">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                    Texte de l'offre
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">
                                        Recommandé
                                    </span>
                                </Label>
                                {isTextValid && (
                                    <span className="flex items-center gap-1 text-green-600 text-sm">
                                        <Check className="w-4 h-4" /> Prêt
                                    </span>
                                )}
                            </div>
                            <Textarea
                                id="text"
                                rows={8}
                                className={`min-h-[200px] sm:min-h-[250px] resize-y text-sm transition-all ${isTextValid
                                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                                        : 'border-slate-200'
                                    }`}
                                placeholder="Collez la description du poste ici...

💡 Astuce : Copiez l'intégralité de l'offre pour une meilleure analyse"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={loading}
                            />
                            <div className="flex justify-between items-center">
                                <p className={`text-xs ${isTextValid ? 'text-green-600' : 'text-slate-500'}`}>
                                    {text.length} caractères {isTextValid ? '✓' : `(minimum 50)`}
                                </p>
                                {text && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setText(cleanText(text))}
                                        disabled={loading}
                                    >
                                        ✨ Nettoyer
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-white px-3 text-slate-400 font-medium">OU</span>
                            </div>
                        </div>

                        {/* SECTION 2: URL (Compact) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="url" className="flex items-center gap-2 text-sm">
                                    <Link2 className="w-4 h-4 text-blue-600" />
                                    URL de l'offre
                                </Label>
                                {isUrlValid && (
                                    <span className="flex items-center gap-1 text-green-600 text-xs">
                                        <Check className="w-3 h-3" /> Valide
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    id="url"
                                    type="url"
                                    placeholder="https://example.com/job-posting"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    disabled={loading}
                                    className={`pr-8 transition-all ${isUrlValid
                                            ? 'border-green-500 focus:border-green-500'
                                            : url && !isUrlValid
                                                ? 'border-amber-400'
                                                : ''
                                        }`}
                                />
                                {url && (
                                    <button
                                        type="button"
                                        onClick={() => setUrl('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {url && !isUrlValid && (
                                <p className="text-xs text-amber-600">
                                    ⚠️ URL invalide (doit commencer par http:// ou https://)
                                </p>
                            )}
                        </div>

                        {/* Separator */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-white px-3 text-slate-400 font-medium">OU</span>
                            </div>
                        </div>

                        {/* SECTION 3: FICHIER (Compact avec drop zone) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2 text-sm">
                                    <Upload className="w-4 h-4 text-orange-600" />
                                    Fichier de l'offre
                                </Label>
                                {isFileValid && (
                                    <span className="flex items-center gap-1 text-green-600 text-xs">
                                        <Check className="w-3 h-3" /> Prêt
                                    </span>
                                )}
                            </div>

                            {file ? (
                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-green-800">{file.name}</p>
                                            <p className="text-xs text-green-600">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFile}
                                        className="text-green-600 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all"
                                >
                                    <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                                    <p className="text-sm text-slate-600">Cliquez ou glissez-déposez</p>
                                    <p className="text-xs text-slate-400">PDF, DOC, TXT (max 5MB)</p>
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

                        {/* Active input indicator */}
                        {activeInput && (
                            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg">
                                <p className="text-sm text-purple-700 text-center">
                                    ✨ Analyse prête via <strong>
                                        {activeInput === 'text' ? 'le texte' : activeInput === 'url' ? "l'URL" : 'le fichier'}
                                    </strong>
                                </p>
                            </div>
                        )}

                        {/* Submit button */}
                        <Button
                            onClick={handleAnalyze}
                            disabled={!canAnalyze}
                            className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
                            size="lg"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Analyser le Match
                        </Button>

                        <p className="text-xs text-center text-slate-500">
                            Raccourci : <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Enter</kbd>
                        </p>

                    </CardContent>
                </Card>

                {/* Historique */}
                {userId && (
                    <div className="mt-6 sm:mt-12">
                        <h2 className="text-base sm:text-xl font-bold mb-2 sm:mb-4">Historique</h2>
                        <AnalysisHistory userId={userId} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
