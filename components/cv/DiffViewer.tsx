"use client";

/**
 * Diff Viewer - Comparaison visuelle de deux versions de CV
 * Affiche les différences avec highlighting (ajouts, suppressions, modifications)
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Eye, Split } from "lucide-react";

interface DiffViewerProps {
    oldVersion: any;
    newVersion: any;
    viewMode?: "unified" | "split";
    showSection?: string; // "all" | "profil" | "experiences" | "competences" | "formations"
}

export function DiffViewer({
    oldVersion,
    newVersion,
    viewMode = "unified",
    showSection = "all",
}: DiffViewerProps) {
    const [currentViewMode, setCurrentViewMode] = useState<"unified" | "split">(viewMode);
    const [currentSection, setCurrentSection] = useState(showSection);

    // Calculer différences par section
    const getSectionDiff = (section: string) => {
        const old = oldVersion?.[section] || {};
        const new_ = newVersion?.[section] || {};

        if (section === "profil") {
            return calculateObjectDiff(old, new_);
        } else if (section === "experiences") {
            return calculateArrayDiff(old, new_);
        } else if (section === "competences") {
            return calculateObjectDiff(old, new_);
        } else if (section === "formations") {
            return calculateArrayDiff(old, new_);
        }

        return { added: [], removed: [], modified: [] };
    };

    const calculateObjectDiff = (oldObj: any, newObj: any) => {
        const added: Array<{ key: string; value: any }> = [];
        const removed: Array<{ key: string; value: any }> = [];
        const modified: Array<{ key: string; oldValue: any; newValue: any }> = [];

        const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

        for (const key of allKeys) {
            const oldVal = oldObj?.[key];
            const newVal = newObj?.[key];

            if (oldVal === undefined && newVal !== undefined) {
                added.push({ key, value: newVal });
            } else if (oldVal !== undefined && newVal === undefined) {
                removed.push({ key, value: oldVal });
            } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                modified.push({ key, oldValue: oldVal, newValue: newVal });
            }
        }

        return { added, removed, modified };
    };

    const calculateArrayDiff = (oldArr: any[], newArr: any[]) => {
        const oldMap = new Map((oldArr || []).map((item, idx) => [idx, item]));
        const newMap = new Map((newArr || []).map((item, idx) => [idx, item]));

        const added: Array<{ index: number; value: any }> = [];
        const removed: Array<{ index: number; value: any }> = [];
        const modified: Array<{ index: number; oldValue: any; newValue: any }> = [];

        const maxLen = Math.max((oldArr || []).length, (newArr || []).length);

        for (let i = 0; i < maxLen; i++) {
            const oldItem = oldMap.get(i);
            const newItem = newMap.get(i);

            if (!oldItem && newItem) {
                added.push({ index: i, value: newItem });
            } else if (oldItem && !newItem) {
                removed.push({ index: i, value: oldItem });
            } else if (oldItem && newItem && JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
                modified.push({ index: i, oldValue: oldItem, newValue: newItem });
            }
        }

        return { added, removed, modified };
    };

    const renderDiffItem = (
        type: "added" | "removed" | "modified",
        key: string,
        oldValue: any,
        newValue?: any
    ) => {
        const bgColor =
            type === "added"
                ? "bg-green-50 border-green-200"
                : type === "removed"
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200";

        return (
            <div className={`p-3 rounded border ${bgColor} mb-2`}>
                <div className="flex items-center gap-2 mb-1">
                    <Badge
                        variant={
                            type === "added"
                                ? "success"
                                : type === "removed"
                                  ? "error"
                                  : "warning"
                        }
                    >
                        {type === "added" ? "Ajouté" : type === "removed" ? "Supprimé" : "Modifié"}
                    </Badge>
                    <span className="font-semibold text-sm">{key}</span>
                </div>
                {type === "removed" && (
                    <div className="text-sm text-red-700 line-through">{String(oldValue)}</div>
                )}
                {type === "added" && (
                    <div className="text-sm text-green-700">{String(newValue)}</div>
                )}
                {type === "modified" && (
                    <div className="space-y-1">
                        <div className="text-sm text-red-700 line-through">
                            {String(oldValue)}
                        </div>
                        <div className="text-sm text-green-700">{String(newValue)}</div>
                    </div>
                )}
            </div>
        );
    };

    const sections = [
        { id: "all", label: "Tout" },
        { id: "profil", label: "Profil" },
        { id: "experiences", label: "Expériences" },
        { id: "competences", label: "Compétences" },
        { id: "formations", label: "Formations" },
    ];

    const renderSectionDiff = (sectionId: string) => {
        if (sectionId === "all") {
            return (
                <div className="space-y-4">
                    {sections.slice(1).map((section) => (
                        <div key={section.id}>
                            <h3 className="font-semibold mb-2">{section.label}</h3>
                            {renderSectionDiff(section.id)}
                        </div>
                    ))}
                </div>
            );
        }

        const diff = getSectionDiff(sectionId);
        const hasChanges =
            diff.added.length > 0 || diff.removed.length > 0 || diff.modified.length > 0;

        if (!hasChanges) {
            return (
                <div className="text-sm text-slate-500 italic p-2">
                    Aucun changement dans cette section
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {diff.added.map((item, idx) =>
                    renderDiffItem("added", item.key || `Item ${item.index}`, null, item.value)
                )}
                {diff.removed.map((item, idx) =>
                    renderDiffItem("removed", item.key || `Item ${item.index}`, item.value)
                )}
                {diff.modified.map((item, idx) =>
                    renderDiffItem(
                        "modified",
                        item.key || `Item ${item.index}`,
                        item.oldValue,
                        item.newValue
                    )
                )}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Comparaison des Versions</CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setCurrentViewMode(currentViewMode === "unified" ? "split" : "unified")
                            }
                        >
                            {currentViewMode === "unified" ? (
                                <>
                                    <Split className="w-4 h-4 mr-2" />
                                    Split
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Unified
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={currentSection} onValueChange={setCurrentSection}>
                    <TabsList className="mb-4">
                        {sections.map((section) => (
                            <TabsTrigger key={section.id} value={section.id}>
                                {section.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {sections.map((section) => (
                        <TabsContent key={section.id} value={section.id}>
                            {currentViewMode === "split" ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold mb-2 text-slate-600">
                                            Version Ancienne
                                        </h3>
                                        <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-96">
                                            {JSON.stringify(
                                                oldVersion?.[section.id] || {},
                                                null,
                                                2
                                            )}
                                        </pre>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2 text-slate-600">
                                            Version Nouvelle
                                        </h3>
                                        <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-96">
                                            {JSON.stringify(
                                                newVersion?.[section.id] || {},
                                                null,
                                                2
                                            )}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                renderSectionDiff(section.id)
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
