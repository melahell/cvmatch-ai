"use client";

import { useEffect, useMemo, useState } from "react";
import { Palette } from "lucide-react";
import { useAccentTheme } from "@/components/providers/ColorThemeProvider";

const LABELS: Record<string, string> = {
    neon: "Néon",
    ocean: "Océan",
    emerald: "Émeraude",
    sunset: "Coucher de soleil",
};

export function AccentToggle() {
    const [mounted, setMounted] = useState(false);
    const { accent, cycleAccent } = useAccentTheme();

    useEffect(() => setMounted(true), []);

    const label = useMemo(() => LABELS[accent] ?? "Couleurs", [accent]);

    if (!mounted) {
        return (
            <div className="w-full px-4 py-2 flex items-center gap-2 text-sm text-cvText-secondary">
                <Palette className="w-4 h-4" />
                Couleurs
            </div>
        );
    }

    return (
        <button
            onClick={cycleAccent}
            className="w-full px-4 py-2 text-left text-sm text-cvText-primary hover:bg-surface-secondary flex items-center gap-2 transition-colors"
        >
            <Palette className="w-4 h-4" />
            <span>Couleurs</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded bg-surface-tertiary text-cvText-secondary">
                {label}
            </span>
        </button>
    );
}

