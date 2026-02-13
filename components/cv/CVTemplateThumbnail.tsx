"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DisplayLimits } from "@/components/cv/templates";

const CVRenderer = dynamic(() => import("@/components/cv/CVRenderer"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-surface-secondary animate-pulse" />,
});

const A4_WIDTH_PX = 794;

type CVTemplateThumbnailProps = {
    data: any;
    templateId: string;
    fontId?: string;
    density?: "compact" | "normal" | "airy";
    includePhoto?: boolean;
    format?: "A4" | "Letter";
    className?: string;
    lazy?: boolean;
};

function useInViewport<T extends HTMLElement>(enabled: boolean) {
    const ref = useRef<T | null>(null);
    const [inView, setInView] = useState(!enabled);

    useEffect(() => {
        if (!enabled) return;
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
            rootMargin: "300px",
        });
        io.observe(el);
        return () => io.disconnect();
    }, [enabled]);

    return { ref, inView };
}

export function CVTemplateThumbnail({
    data,
    templateId,
    fontId = "sans",
    density = "normal",
    includePhoto = false,
    format = "A4",
    className,
    lazy = true,
}: CVTemplateThumbnailProps) {
    const { ref, inView } = useInViewport<HTMLDivElement>(lazy);
    const [containerWidth, setContainerWidth] = useState<number>(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const ro = new ResizeObserver(() => setContainerWidth(el.getBoundingClientRect().width));
        ro.observe(el);
        setContainerWidth(el.getBoundingClientRect().width);
        return () => ro.disconnect();
    }, [ref]);

    const scale = containerWidth > 0 ? containerWidth / A4_WIDTH_PX : 0.2;

    const displayLimits = useMemo<DisplayLimits>(
        () => ({
            maxSkills: 14,
            maxSoftSkills: 6,
            maxRealisationsPerExp: 4,
            maxClientsPerExp: 4,
            maxProjects: 2,
            maxFormations: 3,
            maxLangues: 6,
            maxCertifications: 4,
            maxClientsReferences: 12,
        }),
        []
    );

    return (
        <div
            ref={ref}
            className={[
                "relative aspect-[210/297] overflow-hidden bg-white",
                "border border-cvBorder-light rounded-md",
                className || "",
            ].join(" ")}
        >
            {inView ? (
                <div
                    className="absolute inset-0 origin-top-left pointer-events-none"
                    style={{
                        transform: `scale(${scale})`,
                        width: `${100 / scale}%`,
                        height: `${100 / scale}%`,
                    }}
                >
                    <CVRenderer
                        data={data}
                        templateId={templateId}
                        fontId={fontId}
                        density={density}
                        includePhoto={includePhoto}
                        format={format}
                        displayLimits={displayLimits}
                        containerId={`cv-thumb-${templateId}`}
                    />
                </div>
            ) : (
                <div className="h-full w-full bg-surface-secondary" />
            )}
        </div>
    );
}

