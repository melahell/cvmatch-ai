"use client";

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Version is injected at build time via env variable
const BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "dev";

export default function VersionOverlay() {
    const [version, setVersion] = useState(BUILD_VERSION);
    const pathname = usePathname();

    const shouldHide =
        pathname.startsWith("/dashboard/cv-builder") ||
        pathname.startsWith("/dashboard/cv/") ||
        pathname.startsWith("/dashboard/cvs") ||
        pathname.startsWith("/demo");

    useEffect(() => {
        if (shouldHide) return;
        // Fetch fresh version from API to detect mismatched deployments
        fetch("/api/version")
            .then(res => res.json())
            .then(data => {
                if (data.version) setVersion(data.version);
            })
            .catch(() => {
                // Keep build version if fetch fails
            });
    }, [shouldHide]);

    if (shouldHide) return null;

    return (
        <div className="fixed top-2 right-2 z-50 pointer-events-none">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm shadow-sm text-xs font-mono opacity-50 hover:opacity-100 transition-opacity pointer-events-auto">
                v{version}
            </Badge>
        </div>
    );
}
