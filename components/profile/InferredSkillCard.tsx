"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Link2, Plus, Loader2 } from "lucide-react";
import type { InferredSkill } from "@/types/rag";

interface InferredSkillCardProps {
    skill: InferredSkill;
    onAdd: () => void | Promise<void>;
    onReject: () => void | Promise<void>;
    adding?: boolean;
    rejecting?: boolean;
}

export function InferredSkillCard({
    skill,
    onAdd,
    onReject,
    adding = false,
    rejecting = false
}: InferredSkillCardProps) {
    return (
        <div className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors space-y-3">
            {/* Header with skill name and confidence */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-lg">{skill.name}</span>
                        <Badge
                            variant="outline"
                            className="text-xs bg-purple-50 border-purple-300 text-purple-700 shrink-0"
                        >
                            {skill.confidence}% confiance
                        </Badge>
                    </div>

                    {/* Reasoning */}
                    <div className="text-sm text-slate-600 space-y-2">
                        <div className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <strong className="text-slate-700">Raison :</strong>{" "}
                                <span>{skill.reasoning}</span>
                            </div>
                        </div>

                        {/* Sources */}
                        {skill.sources && skill.sources.length > 0 && (
                            <div className="flex items-start gap-2">
                                <Link2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <strong className="text-slate-700">Sources :</strong>
                                    <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5">
                                        {skill.sources.slice(0, 2).map((source, i) => (
                                            <li key={i} className="text-xs text-slate-600 truncate" title={source}>
                                                {source}
                                            </li>
                                        ))}
                                        {skill.sources.length > 2 && (
                                            <li className="text-xs text-slate-400 italic">
                                                +{skill.sources.length - 2} autre(s)
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                    <Button
                        size="sm"
                        onClick={onAdd}
                        disabled={adding || rejecting}
                        className="whitespace-nowrap"
                    >
                        {adding ? (
                            <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Ajout...</>
                        ) : (
                            <><Plus className="w-4 h-4 mr-1" /> Ajouter</>
                        )}
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onReject}
                        disabled={adding || rejecting}
                        className="whitespace-nowrap text-slate-600 hover:text-slate-900"
                    >
                        {rejecting ? "..." : "Rejeter"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
