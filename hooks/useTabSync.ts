"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useTabSync(defaultTab: string = "vue") {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || defaultTab;

    const setActiveTab = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return { activeTab, setActiveTab };
}
