"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";

interface Analysis {
    id: string;
    job_title: string;
    company: string;
    match_score: number;
    strengths: string[];
    weaknesses: string[];
}

export default function ComparePage({ params }: { params: { ids: string } }) {
    const router = useRouter();
    const analysisIds = params.ids.split(',');
    const [analyses, setAnalyses] = useState<Analysis[]>([]);

    // Phase 2 Item 4: Side-by-side comparison
    return (
        <div className="container mx-auto p-6">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
            </Button>

            <h1 className="text-3xl font-bold mb-6">Comparaison d'Analyses</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {analysisIds.map(id => (
                    <Card key={id}>
                        <CardHeader>
                            <CardTitle>Analyse {id.substring(0, 8)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold">Score</h3>
                                    <div className="text-3xl font-bold text-blue-600">--</div>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Forces</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Chargement...</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Faiblesses</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Chargement...</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
