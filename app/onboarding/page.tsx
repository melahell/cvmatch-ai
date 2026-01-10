"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, CheckCircle, FileText, Info, ShieldCheck } from "lucide-react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createSupabaseClient } from "@/lib/supabase";

export default function OnboardingPage() {
    const router = useRouter();
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [geminiConsent, setGeminiConsent] = useState(false);
    const [consentChecked, setConsentChecked] = useState(false);

    const [userId, setUserId] = useState<string | null>(null);

    // Initialisation Supabase
    const supabase = createSupabaseClient();

    useEffect(() => {
        const storedId = Cookies.get("userId");
        if (!storedId) {
            router.push("/login"); // Redirect if no auth
        } else {
            setUserId(storedId);
            checkExistingConsent(storedId);
        }
    }, [router]);

    const checkExistingConsent = async (uid: string) => {
        const { data } = await supabase
            .from("users")
            .select("gemini_consent")
            .eq("id", uid)
            .single();

        if (data?.gemini_consent) {
            setGeminiConsent(true);
            setConsentChecked(true);
        } else {
            // Afficher la modale de consentement au premier chargement
            setShowConsentModal(true);
        }
    };

    const handleAcceptConsent = async () => {
        if (!userId) return;

        try {
            // Sauvegarder le consentement
            await supabase
                .from("users")
                .update({
                    gemini_consent: true,
                    gemini_consent_date: new Date().toISOString()
                })
                .eq("id", userId);

            setGeminiConsent(true);
            setConsentChecked(true);
            setShowConsentModal(false);

            console.log("[GDPR] User granted Gemini consent");
        } catch (error) {
            alert("Erreur lors de l'enregistrement du consentement");
        }
    };

    const handleDeclineConsent = () => {
        alert(
            "Sans l'analyse IA, nous ne pouvons pas extraire votre profil automatiquement. " +
            "Vous pouvez accepter plus tard dans vos paramètres."
        );
        router.push("/dashboard");
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const newFiles = Array.from(e.dataTransfer.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const newFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const startProcess = async () => {
        if (files.length === 0) return;

        if (!geminiConsent) {
            alert("Vous devez accepter l'analyse IA pour continuer.");
            setShowConsentModal(true);
            return;
        }

        setUploading(true);
        setProgress(10);

        try {
            // 1. Upload
            const formData = new FormData();
            formData.append("userId", userId || "");
            files.forEach((file) => formData.append("files", file));

            const uploadRes = await fetch("/api/rag/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            setProgress(50);
            setUploading(false);
            setProcessing(true);

            // 2. Generate RAG
            const generateRes = await fetch("/api/rag/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            if (!generateRes.ok) {
                const errorData = await generateRes.json();
                throw new Error(errorData.error || "Generation failed");
            }

            const data = await generateRes.json();
            console.log("RAG Generated:", data);

            setProgress(100);

            // Redirect to dashboard (mock path for now)
            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);

        } catch (error: any) {
            console.error(error);
            alert(`Une erreur est survenue: ${error.message}`);
            setUploading(false);
            setProcessing(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-20 px-4">
            {/* MODALE DE CONSENTEMENT GEMINI */}
            {showConsentModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-lg w-full">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                                </div>
                                <CardTitle className="text-xl">Analyse IA de votre CV</CardTitle>
                            </div>
                            <CardDescription>
                                Consentement requis pour continuer (RGPD)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-slate-700 mb-3">
                                    Pour extraire et analyser votre CV, nous utilisons{" "}
                                    <strong>Google Gemini AI</strong>. Vos données professionnelles
                                    (nom, expériences, compétences) seront traitées par Google Cloud Platform.
                                </p>
                                <div className="space-y-2 text-xs text-slate-600">
                                    <p><strong>Données analysées :</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>Nom, prénom, localisation</li>
                                        <li>Expériences professionnelles</li>
                                        <li>Compétences et formations</li>
                                        <li>Contact (email, téléphone, LinkedIn)</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-green-800">
                                        <strong>Vos droits (RGPD) :</strong>
                                        <ul className="mt-1 space-y-0.5">
                                            <li>• Vous pouvez révoquer ce consentement à tout moment</li>
                                            <li>• Vous pouvez consulter l'historique des analyses</li>
                                            <li>• Vous pouvez supprimer toutes vos données</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-slate-500">
                                En acceptant, vous autorisez CVMatch AI à traiter vos données avec
                                Google Gemini conformément à notre{" "}
                                <a href="/privacy" className="text-blue-600 hover:underline">
                                    Politique de Confidentialité
                                </a>.
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={handleDeclineConsent}
                                    className="flex-1"
                                >
                                    Refuser
                                </Button>
                                <Button
                                    onClick={handleAcceptConsent}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    ✓ Accepter et Continuer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        Commençons par ton profil 🚀
                    </CardTitle>
                    <CardDescription className="text-center">
                        Uploade ton CV actuel, ton profil LinkedIn (PDF) ou tout autre document pertinent.
                        L'IA va automatiquement structurer tes compétences.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Banner de statut du consentement */}
                    {consentChecked && (
                        <div className={`mb-4 p-3 rounded-lg border ${
                            geminiConsent
                                ? "bg-green-50 border-green-200"
                                : "bg-yellow-50 border-yellow-200"
                        }`}>
                            <div className="flex items-center gap-2 text-sm">
                                {geminiConsent ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-green-800 font-medium">
                                            Analyse IA activée
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Info className="w-4 h-4 text-yellow-600" />
                                        <span className="text-yellow-800 font-medium">
                                            Analyse IA désactivée
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div
                        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-slate-200"
                            } `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            id="file-upload"
                            onChange={handleChange}
                            accept=".pdf,.docx,.txt"
                        />

                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-slate-100 rounded-full">
                                <Upload className="w-8 h-8 text-slate-500" />
                            </div>
                            <div>
                                <label
                                    htmlFor="file-upload"
                                    className="font-medium text-blue-600 cursor-pointer hover:underline"
                                >
                                    Clique pour uploader
                                </label>
                                <span className="text-slate-500"> ou glisse tes fichiers ici</span>
                            </div>
                            <p className="text-xs text-slate-400">PDF, DOCX acceptés (Max 10MB)</p>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <h4 className="text-sm font-medium text-slate-700">Fichiers sélectionnés :</h4>
                            {files.map((file, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                        <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </div>
                                    {!uploading && !processing && (
                                        <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500">
                                            &times;
                                        </button>
                                    )}
                                    {(uploading || processing) && <CheckCircle className="w-5 h-5 text-green-500" />}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8">
                        <Button
                            className="w-full h-12 text-lg"
                            disabled={files.length === 0 || uploading || processing || !geminiConsent}
                            onClick={startProcess}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Upload en cours...
                                </>
                            ) : processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyse IA en cours ({progress}%)...
                                </>
                            ) : (
                                "Analyser mon profil avec l'IA ✨"
                            )}
                        </Button>

                        {!geminiConsent && consentChecked && (
                            <p className="text-xs text-center text-slate-500 mt-2">
                                <button
                                    onClick={() => setShowConsentModal(true)}
                                    className="text-blue-600 hover:underline"
                                >
                                    Activer l'analyse IA
                                </button>
                                {" "}pour continuer
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dev Helper removed for production */}
        </div>
    );
}
