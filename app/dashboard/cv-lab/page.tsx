"use client";

import { useState } from "react";
import CVRenderer from "@/components/cv/CVRenderer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Beaker, FileJson, Sparkles } from "lucide-react";
import { convertAndSort } from "@/lib/cv/ai-adapter";
import { validateAIWidgetsEnvelope } from "@/lib/cv/ai-widgets";
import type { RendererResumeSchema } from "@/lib/cv/renderer-schema";

const SAMPLE_PAYLOAD = `{
  "profil_summary": {
    "prenom": "Alex",
    "nom": "Martin",
    "titre_principal": "Développeur Full-Stack",
    "localisation": "Paris",
    "elevator_pitch": "Développeur full-stack avec 7 ans d'expérience sur des produits SaaS B2B à forte volumétrie."
  },
  "job_context": {
    "company": "Startup Fintech",
    "job_title": "Senior Full-Stack Engineer",
    "match_score": 82,
    "keywords": ["React", "Node.js", "TypeScript", "Fintech"]
  },
  "widgets": [
    {
      "id": "w1",
      "type": "summary_block",
      "section": "summary",
      "text": "7 ans d'expérience en développement de produits SaaS B2B, spécialisés dans les plateformes de paiement temps réel.",
      "relevance_score": 88
    },
    {
      "id": "w2",
      "type": "experience_header",
      "section": "experiences",
      "text": "Senior Full-Stack Engineer - ScalePay",
      "relevance_score": 90,
      "sources": {
        "rag_experience_id": "exp_scalepay"
      }
    },
    {
      "id": "w3",
      "type": "experience_bullet",
      "section": "experiences",
      "text": "Conception et mise en production d'une API de paiement temps réel (99,99% uptime) utilisée par 150+ marchands.",
      "relevance_score": 95,
      "sources": {
        "rag_experience_id": "exp_scalepay"
      }
    },
    {
      "id": "w4",
      "type": "experience_bullet",
      "section": "experiences",
      "text": "Migration d'un monolithe Ruby vers une architecture Node.js / React modulaire, réduisant le temps de déploiement de 40%.",
      "relevance_score": 92,
      "sources": {
        "rag_experience_id": "exp_scalepay"
      }
    },
    {
      "id": "w5",
      "type": "skill_item",
      "section": "skills",
      "text": "TypeScript",
      "relevance_score": 80
    },
    {
      "id": "w6",
      "type": "skill_item",
      "section": "skills",
      "text": "React",
      "relevance_score": 85
    },
    {
      "id": "w7",
      "type": "skill_item",
      "section": "skills",
      "text": "Communication transverse",
      "relevance_score": 70
    },
    {
      "id": "w8",
      "type": "education_item",
      "section": "education",
      "text": "Master Informatique - Université de Lyon (2016)",
      "relevance_score": 65
    },
    {
      "id": "w9",
      "type": "language_item",
      "section": "languages",
      "text": "Français - Natif",
      "relevance_score": 100
    },
    {
      "id": "w10",
      "type": "language_item",
      "section": "languages",
      "text": "Anglais (Courant)",
      "relevance_score": 90
    }
  ],
  "meta": {
    "model": "gemini-3.0-pro",
    "created_at": "2026-01-23T10:00:00.000Z",
    "locale": "fr-FR",
    "version": "v1"
  }
}`;

export default function CVLabPage() {
    const [rawJson, setRawJson] = useState<string>(SAMPLE_PAYLOAD);
    const [error, setError] = useState<string | null>(null);
    const [cvData, setCvData] = useState<RendererResumeSchema | null>(null);
    const [templateId, setTemplateId] = useState<string>("modern");

    const handleGenerate = () => {
        setError(null);

        try {
            const parsed = JSON.parse(rawJson);
            const validation = validateAIWidgetsEnvelope(parsed);

            if (!validation.success) {
                setError(`Schema AI_WIDGETS_SCHEMA invalide: ${validation.error.errors[0]?.message || "Erreur de validation"}`);
                setCvData(null);
                return;
            }

            const cv = convertAndSort(parsed);
            setCvData(cv);
        } catch (e: any) {
            setError(`Erreur de parsing JSON: ${e?.message || String(e)}`);
            setCvData(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <header className="border-b bg-white">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Beaker className="w-5 h-5 text-purple-600" />
                        <div>
                            <h1 className="text-base sm:text-lg font-semibold text-slate-900">
                                Laboratoire CV V2 – AI Widgets → Renderer
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-600">
                                Expérimente la chaîne AI_WIDGETS_SCHEMA → AIAdapter → CVRenderer sans toucher au moteur historique.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 border border-purple-100">
                            <Sparkles className="w-3 h-3" />
                            Prototype interne
                        </span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Colonne gauche : JSON + contrôle */}
                <section className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <FileJson className="w-4 h-4 text-slate-700" />
                                <CardTitle className="text-base">Payload AI_WIDGETS_SCHEMA</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs text-slate-600">
                                Colle ici le JSON produit par ton prompt Gemini (schéma AI_WIDGETS_SCHEMA). Le moteur va :
                                1) valider le format, 2) trier/filtrer les widgets, 3) construire un CV prêt à être affiché.
                            </p>
                            <Textarea
                                value={rawJson}
                                onChange={(e) => setRawJson(e.target.value)}
                                className="font-mono text-xs min-h-[260px]"
                            />
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>
                                        Modèle attendu : {"{"} profil_summary, job_context, widgets[], meta {"}"}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setRawJson(SAMPLE_PAYLOAD);
                                            setError(null);
                                            setCvData(null);
                                        }}
                                    >
                                        Réinitialiser
                                    </Button>
                                    <Button type="button" size="sm" onClick={handleGenerate}>
                                        Générer le CV V2
                                    </Button>
                                </div>
                            </div>
                            {error && (
                                <div className="mt-2 flex items-start gap-2 rounded-md border border-red-100 bg-red-50 p-2 text-xs text-red-700">
                                    <AlertCircle className="w-4 h-4 mt-[1px]" />
                                    <p>{error}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Template & options</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-600">Template :</span>
                                <div className="flex gap-1">
                                    {["modern", "tech", "classic", "creative"].map((id) => (
                                        <Button
                                            key={id}
                                            type="button"
                                            size="sm"
                                            variant={templateId === id ? "primary" : "outline"}
                                            onClick={() => setTemplateId(id)}
                                        >
                                            {id}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-500">
                                Le renderer V2 réutilise les mêmes templates A4 que le moteur actuel (CSS print natif).
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Colonne droite : rendu CV */}
                <section>
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base">Prévisualisation CV V2</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 bg-slate-100 flex items-center justify-center p-4">
                            {cvData ? (
                                <div className="w-full max-w-[900px] bg-white shadow-md">
                                    <CVRenderer
                                        data={cvData}
                                        templateId={templateId}
                                        includePhoto={true}
                                        dense={false}
                                    />
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    <p>Colle un JSON valide et clique sur &laquo; Générer le CV V2 &raquo; pour voir le rendu.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </main>
        </div>
    );
}

