"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CVPreviewProps {
    cvId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CVPreview({ cvId, open, onOpenChange }: CVPreviewProps) {
    const [loading, setLoading] = useState(true);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <div className="relative w-full h-full">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-slate-600">Chargement...</div>
                        </div>
                    )}
                    <iframe
                        src={`/dashboard/cv/${cvId}?preview=true`}
                        className="w-full h-[80vh] border-0"
                        onLoad={() => setLoading(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
