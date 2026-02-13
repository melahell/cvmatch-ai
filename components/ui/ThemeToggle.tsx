"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, resolvedTheme, setTheme } = useTheme();

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full px-4 py-2 flex items-center gap-2 text-sm text-cvText-secondary">
                <Sun className="w-4 h-4" />
                Thème
            </div>
        );
    }

    const effective = resolvedTheme === "dark" ? "dark" : "light";
    const isDark = effective === "dark";
    const modeLabel = theme === "system" ? "Auto" : isDark ? "Sombre" : "Clair";
    const Icon = theme === "system" ? Monitor : isDark ? Moon : Sun;
    const nextTheme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";

    return (
        <button
            onClick={() => setTheme(nextTheme)}
            className="w-full px-4 py-2 text-left text-sm text-cvText-primary hover:bg-surface-secondary flex items-center gap-2 transition-colors"
        >
            <Icon className="w-4 h-4" />
            <span>Thème</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded bg-surface-tertiary text-cvText-secondary">
                {modeLabel}
            </span>
        </button>
    );
}
