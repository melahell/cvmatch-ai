"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    FileText, Trash2, Download, RefreshCw, User, Briefcase, Code,
    GraduationCap, Languages, Plus, Save, AlertTriangle, ChevronDown,
    ChevronUp, Loader2, Check, X, Edit3, Eye
} from "lucide-react";
import Link from "next/link";

interface Document {
    id: string;
    filename: string;
    file_type: string;
    created_at: string;
    extraction_status: string;
}

interface Experience {
    poste: string;
    entreprise: string;
    debut: string;
    fin: string | null;
    actuel: boolean;
    realisations: { description: string; impact: string }[];
    technologies: string[];
}

interface RAGData {
    profil?: {
        nom?: string;
        prenom?: string;
        titre_principal?: string;
        localisation?: string;
        elevator_pitch?: string;
        contact?: { email?: string; telephone?: string; linkedin?: string };
    };
    experiences?: Experience[];
    competences?: {
        techniques?: string[];
        soft_skills?: string[];
    };
    formations?: { diplome: string; ecole: string; annee: string }[];
    langues?: Record<string, string>;
}

export default function RAGManagementPage() {
    const { userId, isLoading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [ragData, setRagData] = useState<RAGData | null>(null);
    const [customNotes, setCustomNotes] = useState("");
    const [completenessScore, setCompletenessScore] = useState(0);
    const [activeTab, setActiveTab] = useState<"docs" | "rag" | "reset">("rag");
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        profil: true,
        experiences: true,
        competences: true,
        formations: false,
        langues: false
    });

    const supabase = createSupabaseClient();

    useEffect(() => {
        if (!userId || authLoading) return;
        fetchData();
    }, [userId, authLoading]);

    const fetchData = async () => {
        setLoading(true);

        // Fetch documents
        const { data: docs } = await supabase
            .from("uploaded_documents")
            .select("id, filename, file_type, created_at, extraction_status")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (docs) setDocuments(docs);

        // Fetch RAG metadata
        const { data: rag } = await supabase
            .from("rag_metadata")
            .select("completeness_details, completeness_score, custom_notes")
            .eq("user_id", userId)
            .single();

        if (rag) {
            setRagData(rag.completeness_details);
            setCompletenessScore(rag.completeness_score || 0);
            setCustomNotes(rag.custom_notes || "");
        }

        setLoading(false);
    };

    const deleteDocument = async (docId: string) => {
        if (!confirm("Supprimer ce document ? Le profil RAG ne sera pas mis à jour automatiquement.")) return;

        const res = await fetch("/api/documents/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentId: docId, userId })
        });

        if (res.ok) {
            setDocuments(documents.filter(d => d.id !== docId));
        }
    };

    const regenerateProfile = async () => {
        setRegenerating(true);
        try {
            const res = await fetch("/api/rag/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                await fetchData();
            } else {
                const error = await res.json();
                alert("Erreur: " + (error.error || "Échec de la régénération"));
            }
        } catch (e) {
            alert("Erreur réseau");
        }
        setRegenerating(false);
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/rag/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, ragData, customNotes })
            });

            if (res.ok) {
                setEditMode(false);
            }
        } catch (e) {
            alert("Erreur de sauvegarde");
        }
        setSaving(false);
    };

    const resetProfile = async () => {
        if (!confirm("⚠️ ATTENTION: Ceci va supprimer TOUS vos documents et votre profil RAG. Cette action est irréversible. Continuer ?")) return;

        const res = await fetch("/api/profile/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
        });

        if (res.ok) {
            setDocuments([]);
            setRagData(null);
            setCustomNotes("");
            setCompletenessScore(0);
        }
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    };

    if (loading || authLoading) {
        return <DashboardLayout><LoadingSpinner fullScreen /></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 px-4 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Gestion du Profil RAG</h1>
                        <p className="text-slate-500 text-sm">Score de complétude : {completenessScore}/100</p>
                    </div>
                    <div className="flex gap-2">
                        {editMode ? (
                            <>
                                <Button variant="outline" onClick={() => setEditMode(false)}>
                                    <X className="w-4 h-4 mr-2" /> Annuler
                                </Button>
                                <Button onClick={saveChanges} disabled={saving}>
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Sauvegarder
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setEditMode(true)}>
                                    <Edit3 className="w-4 h-4 mr-2" /> Éditer
                                </Button>
                                <Button onClick={regenerateProfile} disabled={regenerating}>
                                    {regenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                    Régénérer
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b">
                    <button
                        onClick={() => setActiveTab("rag")}
                        className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${activeTab === "rag" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
                    >
                        <Eye className="w-4 h-4 inline mr-2" /> Mon Profil RAG
                    </button>
                    <button
                        onClick={() => setActiveTab("docs")}
                        className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${activeTab === "docs" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" /> Documents ({documents.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("reset")}
                        className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${activeTab === "reset" ? "border-red-600 text-red-600" : "border-transparent text-slate-500"}`}
                    >
                        <AlertTriangle className="w-4 h-4 inline mr-2" /> Reset
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === "docs" && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-slate-500">Documents sources utilisés pour générer votre profil</p>
                            <Link href="/onboarding">
                                <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Ajouter</Button>
                            </Link>
                        </div>

                        {documents.length === 0 ? (
                            <Card className="text-center py-12">
                                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500">Aucun document uploadé</p>
                                <Link href="/onboarding">
                                    <Button className="mt-4">Uploader des documents</Button>
                                </Link>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {documents.map(doc => (
                                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-blue-500" />
                                                <div>
                                                    <p className="font-medium text-sm">{doc.filename}</p>
                                                    <p className="text-xs text-slate-400">{formatDate(doc.created_at)} • {doc.extraction_status}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => deleteDocument(doc.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {documents.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                                <p className="text-sm text-amber-800">
                                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                                    Après suppression d'un document, cliquez sur "Régénérer" pour mettre à jour votre profil.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "rag" && (
                    <div className="space-y-4">
                        {!ragData ? (
                            <Card className="text-center py-12">
                                <User className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 mb-4">Aucun profil RAG généré</p>
                                <Link href="/onboarding">
                                    <Button>Créer mon profil</Button>
                                </Link>
                            </Card>
                        ) : (
                            <>
                                {/* Profil */}
                                <Card>
                                    <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("profil")}>
                                        <CardTitle className="flex items-center justify-between text-base">
                                            <span><User className="w-4 h-4 inline mr-2" /> Identité</span>
                                            {expandedSections.profil ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </CardTitle>
                                    </CardHeader>
                                    {expandedSections.profil && (
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-slate-500">Prénom</label>
                                                    <Input
                                                        value={ragData?.profil?.prenom || ""}
                                                        disabled={!editMode}
                                                        onChange={e => setRagData({ ...ragData, profil: { ...ragData?.profil, prenom: e.target.value } })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500">Nom</label>
                                                    <Input
                                                        value={ragData?.profil?.nom || ""}
                                                        disabled={!editMode}
                                                        onChange={e => setRagData({ ...ragData, profil: { ...ragData?.profil, nom: e.target.value } })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500">Titre principal</label>
                                                <Input
                                                    value={ragData?.profil?.titre_principal || ""}
                                                    disabled={!editMode}
                                                    onChange={e => setRagData({ ...ragData, profil: { ...ragData?.profil, titre_principal: e.target.value } })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500">Elevator Pitch</label>
                                                <Textarea
                                                    value={ragData?.profil?.elevator_pitch || ""}
                                                    disabled={!editMode}
                                                    rows={2}
                                                    onChange={e => setRagData({ ...ragData, profil: { ...ragData?.profil, elevator_pitch: e.target.value } })}
                                                />
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>

                                {/* Expériences */}
                                <Card>
                                    <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("experiences")}>
                                        <CardTitle className="flex items-center justify-between text-base">
                                            <span><Briefcase className="w-4 h-4 inline mr-2" /> Expériences ({ragData?.experiences?.length || 0})</span>
                                            {expandedSections.experiences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </CardTitle>
                                    </CardHeader>
                                    {expandedSections.experiences && (
                                        <CardContent className="space-y-4">
                                            {ragData?.experiences?.map((exp, i) => (
                                                <div key={i} className="border-l-2 border-blue-200 pl-4 py-2">
                                                    <div className="font-medium">{exp.poste}</div>
                                                    <div className="text-sm text-slate-600">{exp.entreprise}</div>
                                                    <div className="text-xs text-slate-400">{exp.debut} → {exp.fin || "Présent"}</div>
                                                    {exp.technologies?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {exp.technologies.map((tech, j) => (
                                                                <Badge key={j} variant="secondary" className="text-xs">{tech}</Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </CardContent>
                                    )}
                                </Card>

                                {/* Compétences */}
                                <Card>
                                    <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("competences")}>
                                        <CardTitle className="flex items-center justify-between text-base">
                                            <span><Code className="w-4 h-4 inline mr-2" /> Compétences</span>
                                            {expandedSections.competences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </CardTitle>
                                    </CardHeader>
                                    {expandedSections.competences && (
                                        <CardContent>
                                            <div className="mb-3">
                                                <label className="text-xs text-slate-500 mb-1 block">Techniques</label>
                                                <div className="flex flex-wrap gap-1">
                                                    {ragData?.competences?.techniques?.map((c, i) => (
                                                        <Badge key={i} className="bg-blue-100 text-blue-700">{c}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Soft Skills</label>
                                                <div className="flex flex-wrap gap-1">
                                                    {ragData?.competences?.soft_skills?.map((c, i) => (
                                                        <Badge key={i} className="bg-green-100 text-green-700">{c}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>

                                {/* Notes personnelles */}
                                <Card>
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-base">
                                            <Edit3 className="w-4 h-4 inline mr-2" /> Notes personnelles
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            placeholder="Ajoutez des informations supplémentaires que l'IA n'a pas extraites automatiquement..."
                                            value={customNotes}
                                            disabled={!editMode}
                                            rows={4}
                                            onChange={e => setCustomNotes(e.target.value)}
                                        />
                                        <p className="text-xs text-slate-400 mt-2">
                                            Ces notes seront utilisées lors de la génération de vos CVs personnalisés.
                                        </p>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                )}

                {activeTab === "reset" && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-6 text-center">
                            <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-red-900 mb-2">Zone Danger</h3>
                            <p className="text-red-700 mb-6">
                                Cette action supprimera définitivement :
                            </p>
                            <ul className="text-left max-w-xs mx-auto text-sm text-red-800 mb-6 space-y-1">
                                <li>• Tous vos documents uploadés</li>
                                <li>• Votre profil RAG complet</li>
                                <li>• Vos notes personnelles</li>
                            </ul>
                            <Button
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={resetProfile}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Tout supprimer et recommencer
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
