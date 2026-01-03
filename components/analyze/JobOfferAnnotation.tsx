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

    return (
        <div
            onMouseUp={handleSelection}
            className="relative p-4 bg-white border rounded-lg cursor-text select-text"
        >
            <div className="prose max-w-none">
                {text.split('\n').map((line, i) => {
                    let displayLine = line;

                    // Highlight logic
                    highlights.forEach(highlight => {
                        if (line.includes(highlight)) {
                            displayLine = line.replace(
                                highlight,
                                `<mark class="bg-yellow-200">${highlight}</mark>`
                            );
                        }
                    });

                    return (
                        <p
                            key={i}
                            dangerouslySetInnerHTML={{ __html: displayLine }}
                            className="mb-2"
                        />
                    );
                })}
            </div>

            {highlights.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-semibold mb-2">Éléments surlignés :</p>
                    <div className="flex flex-wrap gap-2">
                        {highlights.map((h, i) => (
                            <span key={i} className="px-2 py-1 bg-yellow-200 rounded text-xs">
                                {h.substring(0, 30)}...
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
