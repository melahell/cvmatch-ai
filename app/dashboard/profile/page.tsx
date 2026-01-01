"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { Loader2, ArrowLeft, Save, Briefcase, GraduationCap, Wrench, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Cookies from "js-cookie";

type WeightValue = "important" | "inclus" | "exclu";

const WeightBadge = ({ weight, onChange }: { weight: WeightValue; onChange: (w: WeightValue) => void }) => {
    const weights: WeightValue[] = ["important", "inclus", "exclu"];
    const idx = weights.indexOf(weight);

    const cycle = () => {
        const nextIdx = (idx + 1) % weights.length;
        onChange(weights[nextIdx]);
    };

    const styles = {
        important: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
        inclus: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200",
        exclu: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
    };

    const labels = {
        important: "🔥 Important",
        inclus: "✅ Inclus",
        exclu: "❌ Exclu"
    };

    return (
        <button
            onClick={cycle}
            className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${styles[weight]}`}
        >
            {labels[weight]}
        </button>
    );
};

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [ragData, setRagData] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const supabase = createSupabaseClient();

    useEffect(() => {
        const id = Cookies.get("userId");
        if (!id) {
            router.push("/login");
            return;
        }
        setUserId(id);
        fetchProfile(id);
    }, []);

    const fetchProfile = async (uid: string) => {
        const { data } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", uid)
            .single();

        if (data?.completeness_details) {
            // Add default weights if missing
            const enriched = addDefaultWeights(data.completeness_details);
            setRagData(enriched);
        }
        setLoading(false);
    };

    const addDefaultWeights = (data: any) => {
        // Add weight to experiences
        if (data.experiences) {
            data.experiences = data.experiences.map((exp: any) => ({
                ...exp,
                weight: exp.weight || "inclus"
            }));
        }
        // Add weight to skills
        if (data.competences?.techniques) {
            data.competences.techniques = data.competences.techniques.map((skill: string | any) =>
                typeof skill === "string" ? { nom: skill, weight: "inclus" } : { ...skill, weight: skill.weight || "inclus" }
            );
        }
        // Add weight to formations
        if (data.formations) {
            data.formations = data.formations.map((f: any) => ({
                ...f,
                weight: f.weight || "inclus"
            }));
        }
        return data;
    };

    const updateWeight = (section: string, index: number, newWeight: WeightValue) => {
        setRagData((prev: any) => {
            const updated = { ...prev };
            if (section === "experiences") {
                updated.experiences[index].weight = newWeight;
            } else if (section === "competences.techniques") {
                updated.competences.techniques[index].weight = newWeight;
            } else if (section === "formations") {
                updated.formations[index].weight = newWeight;
            }
            return updated;
        });
    };

    const saveProfile = async () => {
        if (!userId || !ragData) return;
        setSaving(true);

        await supabase
            .from("rag_metadata")
            .update({ completeness_details: ragData })
            .eq("user_id", userId);

        setSaving(false);
        alert("Profil sauvegardé !");
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Mes Informations</h1>
                </div>
                <Button onClick={saveProfile} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Enregistrer
                </Button>
            </div>

            {/* Legend */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="text-sm font-medium mb-2">Pondération :</div>
                <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1"><Badge className="bg-green-100 text-green-700">🔥 Important</Badge> = Toujours inclus, mis en avant</span>
                    <span className="flex items-center gap-1"><Badge className="bg-blue-100 text-blue-700">✅ Inclus</Badge> = Inclus par défaut</span>
                    <span className="flex items-center gap-1"><Badge className="bg-red-100 text-red-700">❌ Exclu</Badge> = Jamais dans le CV</span>
                </div>
            </div>

            {/* Profile */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" /> Profil
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div><strong>Nom :</strong> {ragData?.profil?.prenom} {ragData?.profil?.nom}</div>
                    <div><strong>Titre :</strong> {ragData?.profil?.titre_principal}</div>
                    <div><strong>Localisation :</strong> {ragData?.profil?.localisation}</div>
                </CardContent>
            </Card>

            {/* Experiences */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" /> Expériences ({ragData?.experiences?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {ragData?.experiences?.map((exp: any, i: number) => (
                        <div key={i} className="flex items-start justify-between border-b pb-3 last:border-0">
                            <div>
                                <div className="font-medium">{exp.poste}</div>
                                <div className="text-sm text-slate-500">{exp.entreprise} • {exp.debut} - {exp.fin || "Présent"}</div>
                            </div>
                            <WeightBadge
                                weight={exp.weight || "inclus"}
                                onChange={(w) => updateWeight("experiences", i, w)}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Compétences */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="w-5 h-5" /> Compétences Techniques ({ragData?.competences?.techniques?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {ragData?.competences?.techniques?.map((skill: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                                <span className="text-sm">{typeof skill === "string" ? skill : skill.nom}</span>
                                <WeightBadge
                                    weight={skill.weight || "inclus"}
                                    onChange={(w) => updateWeight("competences.techniques", i, w)}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Formations */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" /> Formations ({ragData?.formations?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {ragData?.formations?.map((f: any, i: number) => (
                        <div key={i} className="flex items-start justify-between border-b pb-3 last:border-0">
                            <div>
                                <div className="font-medium">{f.diplome}</div>
                                <div className="text-sm text-slate-500">{f.ecole} • {f.annee}</div>
                            </div>
                            <WeightBadge
                                weight={f.weight || "inclus"}
                                onChange={(w) => updateWeight("formations", i, w)}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
