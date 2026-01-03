"use client";

import { useState } from "react";
import { Upload, Loader2, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

interface PhotoUploadProps {
    currentPhoto?: string | null;
    onUploadSuccess: (url: string) => void;
}

export function PhotoUpload({ currentPhoto, onUploadSuccess }: PhotoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentPhoto || null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('Le fichier doit être une image (JPG, PNG, etc.)');
            return;
        }

        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_SIZE) {
            toast.error('L\'image doit faire moins de 2MB');
            return;
        }

        // Preview local
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('photo', file);

            const response = await fetch('/api/profile/photo', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Échec de l\'upload');
            }

            const data = await response.json();
            onUploadSuccess(data.photo_url);
            toast.success('Photo de profil mise à jour !');
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de l\'upload');
            setPreview(currentPhoto || null); // Revert preview
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        try {
            const response = await fetch('/api/profile/photo', {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error();

            setPreview(null);
            onUploadSuccess('');
            toast.success('Photo supprimée');
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    return (
        <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                {/* Avatar Preview */}
                <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200">
                        {preview ? (
                            <Image
                                src={preview}
                                alt="Photo de profil"
                                width={96}
                                height={96}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <User className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-slate-400" />
                        )}
                    </div>
                    {preview && (
                        <button
                            onClick={handleRemove}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            disabled={uploading}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold mb-0.5 sm:mb-1">Photo de profil</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mb-2 sm:mb-3">
                        JPG, PNG ou GIF. Max 2MB.
                    </p>

                    <div className="flex gap-2">
                        <label>
                            <Button
                                variant={preview ? "outline" : "default"}
                                disabled={uploading}
                                className="cursor-pointer"
                                size="sm"
                                asChild
                            >
                                <span>
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                                            <span className="text-xs sm:text-sm">Upload...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                            <span className="text-xs sm:text-sm">{preview ? 'Changer' : 'Télécharger'}</span>
                                        </>
                                    )}
                                </span>
                            </Button>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </Card>
    );
}
