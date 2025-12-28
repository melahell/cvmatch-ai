
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OnboardingPage() {
    const router = useRouter();
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    // Mock User ID (For POC, ideally comes from Auth Context)
    // In a real flow, you'd get this from supabase.auth.getUser()
    // For now, we'll prompt or use a hardcoded one if auth isn't set up fully
    const [userId, setUserId] = useState("user_123_mock");

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

        setUploading(true);
        setProgress(10);

        try {
            // 1. Upload
            const formData = new FormData();
            formData.append("userId", userId);
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

            setProgress(100);

            // Redirect to dashboard (mock path for now)
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

    return (
        <div className="container mx-auto max-w-2xl py-20 px-4">
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
                    <div
                        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-slate-200"
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

            {/* Dev Helper */}
            <div className="mt-8 p-4 bg-yellow-50 text-xs text-yellow-800 rounded border border-yellow-200">
                <span className="font-bold">DEV MODE:</span> Using Mock User ID: {userId}
            </div>
        </div>
    );
}
