"use client";

import { useEffect, useState } from "react";
import { X, Command } from "lucide-react";

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const shortcuts = [
    {
        category: "Navigation", items: [
            { keys: ["⌘", "1"], description: "Dashboard" },
            { keys: ["⌘", "2"], description: "Analyser" },
            { keys: ["⌘", "3"], description: "Candidatures" },
            { keys: ["⌘", "4"], description: "Mon Profil" },
        ]
    },
    {
        category: "Actions", items: [
            { keys: ["⌘", "N"], description: "Nouvelle analyse" },
            { keys: ["⌘", "U"], description: "Upload document" },
            { keys: ["⌘", "/"], description: "Afficher raccourcis" },
        ]
    },
    {
        category: "Interface", items: [
            { keys: ["⌘", "D"], description: "Toggle dark mode" },
            { keys: ["Escape"], description: "Fermer modal" },
        ]
    },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Command className="w-5 h-5" />
                            Raccourcis clavier
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Shortcuts List */}
                    <div className="space-y-6">
                        {shortcuts.map((section) => (
                            <div key={section.category}>
                                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                                    {section.category}
                                </h3>
                                <div className="space-y-2">
                                    {section.items.map((shortcut, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                                        >
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {shortcut.description}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {shortcut.keys.map((key, j) => (
                                                    <kbd
                                                        key={j}
                                                        className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm font-mono text-slate-700 dark:text-slate-300 shadow-sm"
                                                    >
                                                        {key}
                                                    </kbd>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer note */}
                    <p className="mt-6 text-sm text-slate-400 text-center">
                        Sur Windows/Linux, utilisez Ctrl au lieu de ⌘
                    </p>
                </div>
            </div>
        </>
    );
}
