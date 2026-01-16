"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(
    key: string,
    callback: () => void,
    modifiers: { ctrl?: boolean; cmd?: boolean; shift?: boolean; alt?: boolean } = {}
) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const { ctrl = false, cmd = false, shift = false, alt = false } = modifiers;

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdKey = isMac ? e.metaKey : e.ctrlKey;

            if (e.key.toLowerCase() === key.toLowerCase()) {
                if (ctrl && !e.ctrlKey) return;
                if (cmd && !cmdKey) return;
                if (shift && !e.shiftKey) return;
                if (alt && !e.altKey) return;

                // If modifiers required but none specified, return
                if ((ctrl || cmd || shift || alt) && !(e.ctrlKey || cmdKey || e.shiftKey || e.altKey)) return;

                e.preventDefault();
                callback();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [key, callback, modifiers]);
}
