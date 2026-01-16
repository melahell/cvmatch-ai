"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";

interface SpellcheckInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
    multiline?: boolean;
    context?: string; // "cv", "certification", "experience", etc.
}

/**
 * Input component with AI spellcheck on blur
 * Shows suggestion tooltip when corrections are available
 */
export function SpellcheckInput({
    value,
    onChange,
    onBlur,
    placeholder,
    className = "",
    multiline = false,
    context = "cv"
}: SpellcheckInputProps) {
    const [isChecking, setIsChecking] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    const handleBlur = async () => {
        onBlur?.();

        // Skip if too short or hasn't changed
        if (!value || value.length < 10) {
            return;
        }

        setIsChecking(true);

        try {
            const response = await fetch("/api/ai/spellcheck", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: value, context })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.hasChanges && result.corrected) {
                    setSuggestion(result.corrected);
                    setShowSuggestion(true);
                }
            }
        } catch (error) {
            console.error("Spellcheck error:", error);
        } finally {
            setIsChecking(false);
        }
    };

    const acceptSuggestion = () => {
        if (suggestion) {
            onChange(suggestion);
            setSuggestion(null);
            setShowSuggestion(false);
        }
    };

    const rejectSuggestion = () => {
        setSuggestion(null);
        setShowSuggestion(false);
    };

    const baseClassName = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`;

    return (
        <div className="relative">
            {multiline ? (
                <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={`${baseClassName} min-h-[100px] resize-y`}
                    rows={3}
                />
            ) : (
                <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={baseClassName}
                />
            )}

            {/* Loading indicator */}
            {isChecking && (
                <div className="absolute right-2 top-2">
                    <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                </div>
            )}

            {/* Suggestion tooltip */}
            {showSuggestion && suggestion && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-purple-200 rounded-lg shadow-lg p-3">
                    <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-purple-600 font-medium mb-1">
                                Suggestion de l'IA :
                            </div>
                            <div className="text-sm text-slate-700 break-words">
                                {suggestion}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t">
                        <button
                            onClick={rejectSuggestion}
                            className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Ignorer
                        </button>
                        <button
                            onClick={acceptSuggestion}
                            className="px-2 py-1 text-xs text-white bg-purple-600 hover:bg-purple-700 rounded flex items-center gap-1"
                        >
                            <Check className="w-3 h-3" /> Accepter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
