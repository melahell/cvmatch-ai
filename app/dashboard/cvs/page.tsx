"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Migration: Cette page redirige vers /dashboard/tracking avec le filtre CVs
 * Les CVs sont maintenant intégrés dans la page Candidatures pour une vue unifiée
 */
export default function CVListPage() {
    const router = useRouter();

    useEffect(() => {
        // Rediriger vers tracking avec filtre "Avec CV"
        router.replace('/dashboard/tracking?cvFilter=with_cv');
    }, [router]);

    return null;
}
