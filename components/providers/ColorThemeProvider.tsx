"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AccentTheme = "neon" | "ocean" | "emerald" | "sunset";

const STORAGE_KEY = "cvcrush:accent";
const DEFAULT_ACCENT: AccentTheme = "neon";

type AccentThemeContextValue = {
    accent: AccentTheme;
    setAccent: (accent: AccentTheme) => void;
    cycleAccent: () => void;
};

const AccentThemeContext = createContext<AccentThemeContextValue | null>(null);

const ORDER: AccentTheme[] = ["neon", "ocean", "emerald", "sunset"];

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
    const [accent, setAccentState] = useState<AccentTheme>(DEFAULT_ACCENT);

    const apply = useCallback((next: AccentTheme) => {
        setAccentState(next);
        if (typeof document !== "undefined") {
            document.documentElement.dataset.accent = next;
        }
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
        }
    }, []);

    useEffect(() => {
        let stored: AccentTheme | null = null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw === "neon" || raw === "ocean" || raw === "emerald" || raw === "sunset") stored = raw;
        } catch {
        }
        apply(stored ?? DEFAULT_ACCENT);
    }, [apply]);

    const setAccent = useCallback((next: AccentTheme) => apply(next), [apply]);

    const cycleAccent = useCallback(() => {
        const idx = ORDER.indexOf(accent);
        const next = ORDER[(idx + 1) % ORDER.length] ?? DEFAULT_ACCENT;
        apply(next);
    }, [accent, apply]);

    const value = useMemo(() => ({ accent, setAccent, cycleAccent }), [accent, setAccent, cycleAccent]);

    return <AccentThemeContext.Provider value={value}>{children}</AccentThemeContext.Provider>;
}

export function useAccentTheme(): AccentThemeContextValue {
    const ctx = useContext(AccentThemeContext);
    if (!ctx) {
        return {
            accent: DEFAULT_ACCENT,
            setAccent: () => {},
            cycleAccent: () => {},
        };
    }
    return ctx;
}

