"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function useUnsavedChanges(isDirty: boolean) {
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const [nextUrl, setNextUrl] = useState<string | null>(null);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const confirmNavigation = () => {
        setShowWarning(false);
        if (nextUrl) {
            router.push(nextUrl);
        }
    };

    const cancelNavigation = () => {
        setShowWarning(false);
        setNextUrl(null);
    };

    return {
        showWarning,
        confirmNavigation,
        cancelNavigation,
    };
}
