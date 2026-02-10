"use client";

/**
 * Contexte Enrichi Tab
 * Combine Viewer + Editor avec filtres et recherche
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContexteEnrichiViewer } from "./ContexteEnrichiViewer";
import { ContexteEnrichiEditor } from "./ContexteEnrichiEditor";
import { Eye, Edit, Search, Filter } from "lucide-react";
import type { ContexteEnrichi } from "@/types/rag-contexte-enrichi";

interface ContexteEnrichiTabProps {
    ragData: any;
    userId: string;
    onRefetch?: () => void;
}

export function ContexteEnrichiTab({
    ragData,
    userId,
    onRefetch,
}: ContexteEnrichiTabProps) {
    const [viewMode, setViewMode] = useState<"view" | "edit">("view");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "validated" | "rejected" | "pending">("all");

    // Extraire contexte enrichi depuis ragData
    const contexteEnrichi: ContexteEnrichi | undefined =
        ragData?.completeness_details?.contexte_enrichi;

    // Filtrer selon recherche et filtre
    const filterContexteEnrichi = (ctx: ContexteEnrichi | undefined): ContexteEnrichi | undefined => {
        if (!ctx) return undefined;

        const filtered: ContexteEnrichi = {
            responsabilites_implicites: ctx.responsabilites_implicites?.filter((item) => {
                const matchesSearch =
                    !searchQuery ||
                    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.justification?.toLowerCase().includes(searchQuery.toLowerCase());
                // TODO: Ajouter logique de filtre validated/rejected/pending
                return matchesSearch;
            }),
            competences_tacites: ctx.competences_tacites?.filter((item) => {
                const matchesSearch =
                    !searchQuery ||
                    item.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.justification?.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesSearch;
            }),
            environnement_travail: ctx.environnement_travail,
        };

        return filtered;
    };

    const filteredContexte = filterContexteEnrichi(contexteEnrichi);

    return (
        <div className="space-y-4">
            {/* Header avec recherche et filtres */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher dans les déductions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={filter === "all" ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setFilter("all")}
                        >
                            Tous
                        </Button>
                        <Button
                            variant={filter === "validated" ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setFilter("validated")}
                        >
                            Validés
                        </Button>
                        <Button
                            variant={filter === "rejected" ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setFilter("rejected")}
                        >
                            Rejetés
                        </Button>
                        <Button
                            variant={filter === "pending" ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setFilter("pending")}
                        >
                            En attente
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs View/Edit */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "view" | "edit")}>
                <TabsList>
                    <TabsTrigger value="view">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualisation
                    </TabsTrigger>
                    <TabsTrigger value="edit">
                        <Edit className="w-4 h-4 mr-2" />
                        Édition
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="view" className="mt-4">
                    <ContexteEnrichiViewer contexteEnrichi={filteredContexte} />
                </TabsContent>

                <TabsContent value="edit" className="mt-4">
                    <ContexteEnrichiEditor
                        contexteEnrichi={filteredContexte}
                        userId={userId}
                        onUpdate={onRefetch}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
