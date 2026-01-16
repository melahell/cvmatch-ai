"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { SpellcheckInput } from "./SpellcheckInput";

interface EditableFieldProps {
    value: string;
    onSave: (newValue: string) => Promise<void>;
    label?: string;
    placeholder?: string;
    multiline?: boolean;
    className?: string;
    displayClassName?: string;
    context?: string; // For spellcheck context
}

/**
 * Click-to-edit field with inline editing and AI spellcheck
 */
export function EditableField({
    value,
    onSave,
    label,
    placeholder = "Cliquez pour modifier...",
    multiline = false,
    className = "",
    displayClassName = "",
    context = "cv"
}: EditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update local value when prop changes
    useEffect(() => {
        setEditValue(value);
    }, [value]);

    const startEditing = () => {
        setEditValue(value);
        setIsEditing(true);
        setError(null);
    };

    const cancelEditing = () => {
        setEditValue(value);
        setIsEditing(false);
        setError(null);
    };

    const saveChanges = async () => {
        if (editValue === value) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await onSave(editValue);
            setIsEditing(false);
        } catch (e: any) {
            setError(e.message || "Erreur de sauvegarde");
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            cancelEditing();
        } else if (e.key === "Enter" && !multiline) {
            saveChanges();
        }
    };

    if (isEditing) {
        return (
            <div className={`space-y-2 ${className}`}>
                {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
                <div onKeyDown={handleKeyDown}>
                    <SpellcheckInput
                        value={editValue}
                        onChange={setEditValue}
                        placeholder={placeholder}
                        multiline={multiline}
                        context={context}
                        className="bg-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={saveChanges}
                        disabled={isSaving}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                    >
                        {isSaving ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Check className="w-3 h-3" />
                        )}
                        Enregistrer
                    </button>
                    <button
                        onClick={cancelEditing}
                        disabled={isSaving}
                        className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Annuler
                    </button>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
        );
    }

    return (
        <div
            onClick={startEditing}
            className={`group cursor-pointer rounded-lg p-2 -m-2 hover:bg-slate-50 transition-colors ${displayClassName}`}
            title="Cliquez pour modifier"
        >
            <div className="flex items-start gap-2">
                <span className={`flex-1 ${!value ? "text-slate-400 italic" : ""}`}>
                    {value || placeholder}
                </span>
                <Pencil className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
        </div>
    );
}
