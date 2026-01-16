"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { WeightSelector, Weight } from "./WeightSelector";

interface SkillItem {
    nom: string;
    niveau?: number;
    poids?: Weight;
}

interface SkillsManagerProps {
    skills: SkillItem[];
    category: 'techniques' | 'linguistiques' | 'soft';
    onAdd: (skill: SkillItem) => void;
    onRemove: (skillName: string) => void;
    onUpdateWeight: (skillName: string, weight: Weight) => void;
    suggestions?: string[];
}

export function SkillsManager({
    skills,
    category,
    onAdd,
    onRemove,
    onUpdateWeight,
    suggestions = []
}: SkillsManagerProps) {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleAdd = () => {
        if (!inputValue.trim()) return;

        // Check if skill already exists
        if (skills.some(s => s.nom.toLowerCase() === inputValue.toLowerCase())) {
            return;
        }

        onAdd({
            nom: inputValue.trim(),
            poids: 'inclus'
        });

        setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const filteredSuggestions = suggestions.filter(s =>
        s.toLowerCase().includes(inputValue.toLowerCase()) &&
        !skills.some(skill => skill.nom.toLowerCase() === s.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Input Section */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Input
                        placeholder={`Ajouter ${category === 'techniques' ? 'une compétence technique' : category === 'linguistiques' ? 'une langue' : 'une compétence'}`}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />

                    {/* Autocomplete Suggestions */}
                    {showSuggestions && filteredSuggestions.length > 0 && inputValue && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                            {filteredSuggestions.slice(0, 5).map((suggestion, i) => (
                                <button
                                    key={i}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm"
                                    onClick={() => {
                                        setInputValue(suggestion);
                                        setShowSuggestions(false);
                                    }}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <Button onClick={handleAdd} disabled={!inputValue.trim()}>
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                </Button>
            </div>

            {/* Skills List */}
            <div className="space-y-2">
                {skills.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                        Aucune compétence ajoutée
                    </p>
                ) : (
                    skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 p-2 border rounded">
                            <div className="flex items-center gap-2 flex-1">
                                <Badge variant="secondary">{skill.nom}</Badge>
                                {skill.niveau && (
                                    <span className="text-xs text-slate-500">Niveau {skill.niveau}/5</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <WeightSelector
                                    value={skill.poids || 'inclus'}
                                    onChange={(weight) => onUpdateWeight(skill.nom, weight)}
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemove(skill.nom)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Stats */}
            {skills.length > 0 && (
                <div className="text-xs text-slate-500">
                    {skills.length} compétence{skills.length > 1 ? 's' : ''} ·
                    {' '}{skills.filter(s => s.poids === 'important').length} importante{skills.filter(s => s.poids === 'important').length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
