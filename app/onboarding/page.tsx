"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, CheckCircle, FileText, ArrowRight, Camera, Info, ExternalLink, X } from "lucide-react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createSupabaseClient } from "@/lib/supabase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContextualLoader } from "@/components/loading/ContextualLoader";

export default function OnboardingPage() {
    const router = useRouter();
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [showLinkedInGuide, setShowLinkedInGuide] = useState(false);

    const [userId, setUserId] = useState<string | null>(null);

    // Initialisation Supabase
    const supabase = createSupabaseClient();

    useEffect(() => {
        const storedId = Cookies.get("userId");
        if (!storedId) {
            router.push("/login"); // Redirect if no auth
        } else {
            setUserId(storedId);
        }
    }, [router]);

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

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const photo = e.target.files[0];
            setProfilePhoto(photo);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(photo);
        }
    };

    const removePhoto = () => {
        setProfilePhoto(null);
        setPhotoPreview(null);
    };

    const startProcess = async () => {
        if (files.length === 0) return;

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

            if (!generateRes.ok) throw new Error("Generation failed");

            const data = await generateRes.json();
            console.log("RAG Generated:", data);

            setProgress(80);

            // 3. Generate Job Suggestions (async, non-blocking)
            try {
                const jobsRes = await fetch("/api/rag/suggest-jobs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                if (jobsRes.ok) {
                    console.log("Job suggestions generated");
                }
            } catch (e) {
                console.warn("Job suggestions failed (non-critical)", e);
            }

            setProgress(100);

            // Redirect to dashboard
            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);

        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue.");
            setUploading(false);
            setProcessing(false);
        }
    };

    // Show contextual loader during processing
    if (processing) {
        return (
            <ContextualLoader
                context="generating-rag"
                progress={progress}
            />
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto max-w-2xl py-12 px-4">
                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${files.length > 0 ? "bg-green-500 text-white" : "bg-blue-600 text-white"}`}>
                            {files.length > 0 ? <CheckCircle className="w-5 h-5" /> : "1"}
                        </div>
                        <span className="text-sm font-medium">Documents</span>
                    </div>
                    <div className="w-12 h-0.5 bg-slate-200 mx-2" />
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${processing ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : "2"}
                        </div>
                        <span className="text-sm font-medium text-slate-500">Analyse IA</span>
                    </div>
                    <div className="w-12 h-0.5 bg-slate-200 mx-2" />
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold">3</div>
                        <span className="text-sm font-medium text-slate-500">Terminé</span>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">
                            Commençons par ton profil 🚀
                        </CardTitle>
                        <CardDescription className="text-center">
                            L'IA va automatiquement structurer tes compétences et générer des recommandations personnalisées.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* LinkedIn Export Guide Modal */}
                        {showLinkedInGuide && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
                                    <button onClick={() => setShowLinkedInGuide(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                                        <X className="w-5 h-5" />
                                    </button>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Info className="w-5 h-5 text-blue-600" /> Comment exporter ton profil LinkedIn ?
                                    </h3>
                                    <ol className="space-y-3 text-sm">
                                        <li className="flex gap-2">
                                            <span className="font-bold text-blue-600">1.</span>
                                            <span>Va sur <a href="https://www.linkedin.com/in/" target="_blank" className="text-blue-600 underline">ton profil LinkedIn</a></span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold text-blue-600">2.</span>
                                            <span>Clique sur le bouton <strong>"Plus"</strong> (sous ta photo)</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold text-blue-600">3.</span>
                                            <span>Sélectionne <strong>"Enregistrer au format PDF"</strong></span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-bold text-blue-600">4.</span>
                                            <span>Uploade le PDF ici !</span>
                                        </li>
                                    </ol>
                                    <Button onClick={() => setShowLinkedInGuide(false)} className="w-full mt-4">
                                        C'est compris !
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Guidance Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Quels documents uploader ?
                            </h3>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                <div className="text-blue-700">✅ CV (PDF, DOCX)</div>
                                <button
                                    onClick={() => setShowLinkedInGuide(true)}
                                    className="text-blue-700 text-left hover:underline flex items-center gap-1"
                                >
                                    ✅ Profil LinkedIn <Info className="w-3 h-3" />
                                </button>
                                <div className="text-blue-600 opacity-75">💡 Certifications</div>
                                <div className="text-blue-600 opacity-75">💡 Portfolio</div>
                            </div>
                        </div>

                        {/* Photo Upload Section */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📷 Photo de profil (optionnel - pour ton CV)
                            </label>
                            <div className="flex items-center gap-4">
                                {photoPreview ? (
                                    <div className="relative">
                                        <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-blue-500" />
                                        <button
                                            onClick={removePhoto}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                                        <Camera className="w-6 h-6 text-gray-400" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />
                                    </label>
                                )}
                                <div className="text-xs text-gray-500">
                                    {photoPreview ? "Photo ajoutée ✓" : "Clique pour ajouter ta photo"}
                                </div>
                            </div>
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${dragActive
                                ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-lg"
                                : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                                }`}
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
                                disabled={files.length === 0 || uploading || processing}
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
                        </div>
                    </CardContent>
                </Card>

                {/* Dev Helper removed for production */}
            </div>
        </DashboardLayout>
    );
}
