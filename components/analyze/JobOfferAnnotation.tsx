"use client";

import { useState } from "react";

interface AnnotationProps {
    text: string;
    onHighlight: (selection: string) => void;
}

// Phase 2 Item 5: Annotation system for job offers
export function JobOfferAnnotation({ text, onHighlight }: AnnotationProps) {
    const [highlights, setHighlights] = useState<string[]>([]);

    const handleSelection = () => {
        const selection = window.getSelection();
        const selectedText = selection?.toString();

        if (selectedText && selectedText.length > 2) {
            setHighlights([...highlights, selectedText]);
            onHighlight(selectedText);
        }
    };

    // Helper function to render line with highlights safely (no XSS)
    const renderLineWithHighlights = (line: string, lineIndex: number) => {
        // If no highlights, return plain text
        if (highlights.length === 0) {
            return <p key={lineIndex} className="mb-2">{line}</p>;
        }

        // Find all highlight positions in this line
        const parts: Array<{ text: string; isHighlight: boolean }> = [];
        let remainingLine = line;
        let hasHighlight = false;

        highlights.forEach(highlight => {
            if (remainingLine.includes(highlight)) {
                hasHighlight = true;
                const index = remainingLine.indexOf(highlight);

                // Add text before highlight
                if (index > 0) {
                    parts.push({ text: remainingLine.substring(0, index), isHighlight: false });
                }

                // Add highlight
                parts.push({ text: highlight, isHighlight: true });

                // Update remaining line
                remainingLine = remainingLine.substring(index + highlight.length);
            }
        });

        // Add remaining text
        if (remainingLine.length > 0) {
            parts.push({ text: remainingLine, isHighlight: false });
        }

        // If no highlights found in this line, return plain text
        if (!hasHighlight) {
            return <p key={lineIndex} className="mb-2">{line}</p>;
        }

        // Render parts with highlights as React components (safe)
        return (
            <p key={lineIndex} className="mb-2">
                {parts.map((part, partIndex) =>
                    part.isHighlight ? (
                        <mark key={partIndex} className="bg-yellow-200">
                            {part.text}
                        </mark>
                    ) : (
                        <span key={partIndex}>{part.text}</span>
                    )
                )}
            </p>
        );
    };

    return (
        <div
            onMouseUp={handleSelection}
            className="relative p-4 bg-white border rounded-lg cursor-text select-text"
        >
            <div className="prose max-w-none">
                {text.split('\n').map((line, i) => renderLineWithHighlights(line, i))}
            </div>

            {highlights.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-semibold mb-2">Éléments surlignés :</p>
                    <div className="flex flex-wrap gap-2">
                        {highlights.map((h, i) => (
                            <span key={i} className="px-2 py-1 bg-yellow-200 rounded text-xs">
                                {h.substring(0, 30)}{h.length > 30 ? '...' : ''}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
