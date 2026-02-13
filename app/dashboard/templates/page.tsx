"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, Sparkles, Grid3X3, LayoutTemplate, Loader2, X } from "lucide-react";
import { TEMPLATES, TemplateInfo } from "@/components/cv/templates";
import DashboardLayout from "@/components/layout/DashboardLayout";
import dynamic from "next/dynamic";
import { SAMPLE_CV_DATA } from "@/lib/cv/sample-cv";
import { preloadCVTemplate } from "@/components/cv/CVRenderer";
import { CVTemplateThumbnail } from "@/components/cv/CVTemplateThumbnail";
import { useAccentTheme } from "@/components/providers/ColorThemeProvider";

const CVRenderer = dynamic(() => import("@/components/cv/CVRenderer"), {
    loading: () => (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
        </div>
    ),
    ssr: false,
});

export default function TemplatesStorePage() {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const { accent } = useAccentTheme();
    const accentLabel = useMemo(() => {
        if (accent === "ocean") return "Océan";
        if (accent === "emerald") return "Émeraude";
        if (accent === "sunset") return "Sunset";
        return "Néon";
    }, [accent]);

    const categories = [
        { id: "all", label: "Tous", icon: Grid3X3 },
        { id: "reactive-resume", label: "Reactive Resume", icon: LayoutTemplate },
        { id: "cv-crush", label: "CV-Crush", icon: Sparkles },
        { id: "modern", label: "Moderne", icon: LayoutTemplate },
        { id: "tech", label: "Tech", icon: Sparkles },
        { id: "classic", label: "Classique", icon: LayoutTemplate },
        { id: "creative", label: "Créatif", icon: Sparkles },
    ];

    const filteredTemplates = selectedCategory === "all"
        ? TEMPLATES
        : selectedCategory === "reactive-resume" || selectedCategory === "cv-crush"
            ? TEMPLATES.filter(t => t.source === selectedCategory)
            : TEMPLATES.filter(t => t.category === selectedCategory);

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 px-4 space-y-6">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-cvText-primary mb-2">
                        Templates CV
                    </h1>
                    <p className="text-cvText-secondary">
                        Choisissez parmi notre collection de templates professionnels,
                        optimisés pour format A4 une page.
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <span className="text-xs text-cvText-secondary">Palette :</span>
                        <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border border-cvBorder-light bg-surface-primary">
                            <span className="h-2.5 w-2.5 rounded-full bg-gradient-neon" />
                            <span className="text-cvText-primary">{accentLabel}</span>
                        </span>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex justify-center gap-2 flex-wrap">
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={selectedCategory === cat.id ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            <cat.icon className="w-4 h-4 mr-1" />
                            {cat.label}
                        </Button>
                    ))}
                </div>

                {/* Templates Grid — grouped by source when "Tous" */}
                {selectedCategory === "all" ? (
                    <div className="space-y-10 max-w-6xl mx-auto">
                        <section>
                            <h2 className="text-lg font-semibold text-cvText-primary mb-4">
                                Reactive Resume ({TEMPLATES.filter(t => t.source === "reactive-resume").length})
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {TEMPLATES.filter(t => t.source === "reactive-resume").map((template) => (
                                    <TemplateStoreCard key={template.id} template={template} />
                                ))}
                            </div>
                        </section>
                        <section>
                            <h2 className="text-lg font-semibold text-cvText-primary mb-4">
                                CV-Crush ({TEMPLATES.filter(t => t.source === "cv-crush").length})
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {TEMPLATES.filter(t => t.source === "cv-crush").map((template) => (
                                    <TemplateStoreCard key={template.id} template={template} />
                                ))}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {filteredTemplates.map((template) => (
                            <TemplateStoreCard key={template.id} template={template} />
                        ))}
                    </div>
                )}

                {/* Premium CTA */}
                <Card className="max-w-2xl mx-auto bg-gradient-neon-subtle border-cvBorder-light">
                    <CardContent className="p-6 text-center">
                        <Sparkles className="w-8 h-8 text-neon-purple mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-cvText-primary mb-2">
                            Bientôt : Templates Premium
                        </h3>
                        <p className="text-sm text-cvText-secondary mb-4">
                            Accédez à une collection exclusive de templates créatifs et personnalisables.
                        </p>
                        <Button variant="outline">
                            Être notifié
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

function TemplateStoreCard({ template }: { template: TemplateInfo }) {
    const isAvailable = template.available;
    const [showPreview, setShowPreview] = useState<boolean>(false);

    return (
        <Card className={`overflow-hidden transition-all hover:shadow-lg ${!isAvailable ? 'opacity-60' : ''}`}>
            {/* Preview */}
            <div className="aspect-[210/297] relative bg-surface-secondary">
                <CVTemplateThumbnail data={SAMPLE_CV_DATA} templateId={template.id} />

                {/* Lock overlay for unavailable */}
                {!isAvailable && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center">
                        <div className="bg-surface-primary rounded-full p-3 shadow-lg border border-cvBorder-light">
                            <Lock className="w-6 h-6 text-cvText-secondary" />
                        </div>
                    </div>
                )}

                {isAvailable && (
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-surface-primary/80 backdrop-blur"
                            onMouseEnter={() => preloadCVTemplate(template.id)}
                            onClick={() => { preloadCVTemplate(template.id); setShowPreview(true); }}
                        >
                            Aperçu
                        </Button>
                    </div>
                )}
            </div>

            {/* Info */}
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-cvText-primary">
                        {template.name}
                    </h3>
                    {isAvailable ? (
                        <Badge variant="success" className="bg-green-100 text-green-700">
                            <Check className="w-3 h-3 mr-1" />
                            Gratuit
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-cvText-secondary">
                            Bientôt
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-cvText-secondary mb-3">
                    {template.description}
                </p>
                {template.recommended && (
                    <div className="flex flex-wrap gap-1">
                        {template.recommended.map((rec, i) => (
                            <span
                                key={i}
                                className="text-xs px-2 py-0.5 bg-surface-secondary rounded-full text-cvText-secondary"
                            >
                                {rec}
                            </span>
                        ))}
                    </div>
                )}
            </CardContent>

            {showPreview && (
                <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
                    <div className="relative bg-surface-primary rounded-lg shadow-xl w-full max-w-5xl h-[85vh] overflow-auto border border-cvBorder-light">
                        <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-3 right-3 z-10"
                            onClick={() => setShowPreview(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        <div className="p-4">
                            <CVRenderer
                                data={SAMPLE_CV_DATA}
                                templateId={template.id}
                                fontId="sans"
                                density="normal"
                                includePhoto={false}
                                format="A4"
                            />
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
