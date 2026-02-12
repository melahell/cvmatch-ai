"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, Sparkles, Grid3X3, LayoutTemplate, Loader2, X } from "lucide-react";
import { TEMPLATES, TemplateInfo } from "@/components/cv/templates";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CV_COLORWAY_BY_ID, CV_COLORWAYS } from "@/lib/cv/style/colorways";
import dynamic from "next/dynamic";
import { SAMPLE_CV_DATA } from "@/lib/cv/sample-cv";
import { preloadCVTemplate } from "@/components/cv/CVRenderer";

const CVRenderer = dynamic(() => import("@/components/cv/CVRenderer"), {
    loading: () => (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    ),
    ssr: false,
});

export default function TemplatesStorePage() {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Templates CV
                    </h1>
                    <p className="text-slate-600 dark:text-slate-600">
                        Choisissez parmi notre collection de templates professionnels,
                        optimisés pour format A4 une page.
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex justify-center gap-2 flex-wrap">
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={selectedCategory === cat.id ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={selectedCategory === cat.id
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "dark:border-slate-700 dark:text-slate-300"
                            }
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
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                Reactive Resume ({TEMPLATES.filter(t => t.source === "reactive-resume").length})
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {TEMPLATES.filter(t => t.source === "reactive-resume").map((template) => (
                                    <TemplateStoreCard key={template.id} template={template} />
                                ))}
                            </div>
                        </section>
                        <section>
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
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
                <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-6 text-center">
                        <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            Bientôt : Templates Premium
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-600 mb-4">
                            Accédez à une collection exclusive de templates créatifs et personnalisables.
                        </p>
                        <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-400">
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
    const [colorwayId, setColorwayId] = useState<string>("indigo");
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const colorway = CV_COLORWAY_BY_ID[colorwayId] || CV_COLORWAYS[0];

    return (
        <Card className={`overflow-hidden transition-all hover:shadow-lg ${!isAvailable ? 'opacity-60' : ''
            } dark:bg-slate-900 dark:border-slate-800`}>
            {/* Preview */}
            <div className="aspect-[210/297] relative bg-surface-secondary">
                {/* Mini preview mockup */}
                <div className="p-4 h-full flex flex-col">
                    <div className="flex gap-2 mb-3">
                        <div className="flex-1">
                            <div className="h-3 w-20 rounded bg-[var(--swatch)]" style={{ ["--swatch" as any]: colorway.primary } as any} />
                            <div className="h-2 w-14 bg-slate-200 rounded mt-1.5" />
                        </div>
                        {(template.id === 'modern' || template.id === 'creative') && (
                            <div className="w-8 h-8 bg-slate-200 rounded-full" />
                        )}
                    </div>
                    <div className="flex-1 flex gap-2">
                        {template.id === 'tech' && (
                            <div className="w-1/3 space-y-1.5">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-1.5 bg-slate-200 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                                ))}
                            </div>
                        )}
                        <div className="flex-1 space-y-1.5">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-1.5 bg-slate-200 rounded" style={{ width: `${50 + Math.random() * 50}%` }} />
                            ))}
                        </div>
                        {template.id === 'modern' && (
                            <div className="w-1/4 space-y-1.5">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-1.5 bg-slate-200 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Lock overlay for unavailable */}
                {!isAvailable && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center">
                        <div className="bg-white dark:bg-slate-800 rounded-full p-3 shadow-lg">
                            <Lock className="w-6 h-6 text-slate-600" />
                        </div>
                    </div>
                )}

                {isAvailable && (
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/80 backdrop-blur dark:bg-slate-900/70"
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
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        {template.name}
                    </h3>
                    {isAvailable ? (
                        <Badge variant="success" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            <Check className="w-3 h-3 mr-1" />
                            Gratuit
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-slate-600 dark:text-slate-600">
                            Bientôt
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-600 mb-3">
                    {template.description}
                </p>
                {template.recommended && (
                    <div className="flex flex-wrap gap-1">
                        {template.recommended.map((rec, i) => (
                            <span
                                key={i}
                                className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-600"
                            >
                                {rec}
                            </span>
                        ))}
                    </div>
                )}
                <div className="mt-3 space-y-1">
                    <div className="text-xs text-slate-600 dark:text-slate-600">20 couleurs</div>
                    <div className="grid grid-cols-10 gap-1">
                        {CV_COLORWAYS.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setColorwayId(c.id)}
                                title={c.name}
                                className={`h-5 w-5 rounded-full border bg-[var(--swatch)] ${colorwayId === c.id ? "ring-2 ring-blue-500 border-transparent" : "border-slate-300"}`}
                                style={{ ["--swatch" as any]: c.primary } as any}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>

            {showPreview && (
                <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
                    <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-5xl h-[85vh] overflow-auto">
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
                                colorwayId={colorwayId}
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
