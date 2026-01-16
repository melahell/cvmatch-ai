"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export function useKeyboardShortcuts() {
    const router = useRouter();
    const { setTheme, theme } = useTheme();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Cmd (Mac) or Ctrl (Windows/Linux)
            const modifier = e.metaKey || e.ctrlKey;

            if (!modifier) return;

            switch (e.key) {
                case "1":
                    e.preventDefault();
                    router.push("/dashboard");
                    break;
                case "2":
                    e.preventDefault();
                    router.push("/dashboard/analyze");
                    break;
                case "3":
                    e.preventDefault();
                    router.push("/dashboard/tracking");
                    break;
                case "4":
                    e.preventDefault();
                    router.push("/dashboard/profile");
                    break;
                case "n":
                case "N":
                    e.preventDefault();
                    router.push("/dashboard/analyze");
                    break;
                case "d":
                case "D":
                    e.preventDefault();
                    setTheme(theme === "dark" ? "light" : "dark");
                    break;
                default:
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [router, setTheme, theme]);
}
