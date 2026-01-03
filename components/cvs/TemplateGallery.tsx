"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { CV_TEMPLATES } from "@/lib/constants/app-constants";

interface TemplateGalleryProps {
    onSelectTemplate?: (templateId: string) => void;
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CV_TEMPLATES.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-4">
                        <div className="aspect-[3/4] bg-slate-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            <Eye className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="font-semibold mb-1">{template.name}</h3>
                        <p className="text-sm text-slate-500 mb-3">{template.description}</p>
                        {onSelectTemplate && (
                            <Button
                                size="sm"
                                className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onSelectTemplate(template.id)}
                            >
                                Utiliser ce template
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
