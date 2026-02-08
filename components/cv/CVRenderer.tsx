"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { CVData, JobContext, TemplateProps } from "./templates";
import { normalizeRAGToCV } from "./normalizeData";
import { generateCSSVariables, cssVariablesToStyle } from "@/lib/cv/css-variables";
import { getThemeVariables, themeToStyle } from "@/lib/cv/cv-theme-variables";
import { logger } from "@/lib/utils/logger";
import { resolveCVStyle } from "@/lib/cv/style/resolve-style";
import type { CVDensity } from "@/lib/cv/style/density";

// Dynamic imports — 10 distinct templates
// Originals (4)
const ModernTemplate = dynamic(() => import("./templates/ModernTemplate"), { ssr: false });
const TechTemplate = dynamic(() => import("./templates/TechTemplate"), { ssr: false });
const ClassicTemplate = dynamic(() => import("./templates/ClassicTemplate"), { ssr: false });
const CreativeTemplate = dynamic(() => import("./templates/CreativeTemplate"), { ssr: false });

// Reactive Resume inspired (6)
const PikachuTemplate = dynamic(() => import("./templates/rr/PikachuTemplate"), { ssr: false });
const BronzorTemplate = dynamic(() => import("./templates/rr/BronzorTemplate"), { ssr: false });
const ChikoritaTemplate = dynamic(() => import("./templates/rr/ChikoritaTemplate"), { ssr: false });
const DittoTemplate = dynamic(() => import("./templates/rr/DittoTemplate"), { ssr: false });
const GengarTemplate = dynamic(() => import("./templates/rr/GengarTemplate"), { ssr: false });
const LaprasTemplate = dynamic(() => import("./templates/rr/LaprasTemplate"), { ssr: false });

export interface CVRendererProps {
    data: any; // Accept raw data from API, will normalize
    templateId: string;
    colorwayId?: string;
    fontId?: string;
    density?: CVDensity;
    printSafe?: boolean;
    includePhoto?: boolean;
    jobContext?: JobContext;
    dense?: boolean;
    format?: "A4" | "Letter";
    customCSS?: string;
    unitStats?: {
        total: number;
        remaining: number;
        percentage: number;
    };
    dynamicCssVariables?: Record<string, string>;
}

const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<TemplateProps>> = {
    // Originals (4)
    modern: ModernTemplate,
    tech: TechTemplate,
    classic: ClassicTemplate,
    creative: CreativeTemplate,
    // Reactive Resume inspired (6)
    pikachu: PikachuTemplate,
    bronzor: BronzorTemplate,
    chikorita: ChikoritaTemplate,
    ditto: DittoTemplate,
    gengar: GengarTemplate,
    lapras: LaprasTemplate,
};

/** All available template IDs */
export const AVAILABLE_TEMPLATE_IDS = Object.keys(TEMPLATE_COMPONENTS);

const TEMPLATE_IMPORTERS: Record<string, () => Promise<unknown>> = {
    modern: () => import("./templates/ModernTemplate"),
    tech: () => import("./templates/TechTemplate"),
    classic: () => import("./templates/ClassicTemplate"),
    creative: () => import("./templates/CreativeTemplate"),
    pikachu: () => import("./templates/rr/PikachuTemplate"),
    bronzor: () => import("./templates/rr/BronzorTemplate"),
    chikorita: () => import("./templates/rr/ChikoritaTemplate"),
    ditto: () => import("./templates/rr/DittoTemplate"),
    gengar: () => import("./templates/rr/GengarTemplate"),
    lapras: () => import("./templates/rr/LaprasTemplate"),
};

export function preloadCVTemplate(templateId: string) {
    const base = templateId.includes("__") ? templateId.split("__")[0] : templateId;
    const importer = TEMPLATE_IMPORTERS[base];
    if (!importer) return Promise.resolve();
    return importer().then(() => undefined);
}

export default function CVRenderer({
    data,
    templateId,
    colorwayId,
    fontId,
    density,
    printSafe,
    includePhoto = true,
    jobContext,
    dense = false,
    format = "A4",
    customCSS,
    unitStats,
    dynamicCssVariables,
}: CVRendererProps) {
    const resolvedStyle = useMemo(
        () => resolveCVStyle({ templateId, colorwayId, fontId, density, printSafe }),
        [templateId, colorwayId, fontId, density, printSafe]
    );

    const looksLikeCVData = (value: any): value is CVData => {
        if (!value || typeof value !== "object") return false;
        const profil = (value as any).profil;
        const experiences = (value as any).experiences;
        if (!profil || typeof profil !== "object") return false;
        if (typeof profil.prenom !== "string") return false;
        if (typeof profil.nom !== "string") return false;
        if (typeof profil.titre_principal !== "string") return false;
        if (!Array.isArray(experiences)) return false;
        if (experiences.length === 0) return true;
        const first = experiences[0];
        if (!first || typeof first !== "object") return false;
        return typeof first.poste === "string" && typeof first.entreprise === "string";
    };

    // Normalize the data to template-friendly format
    const normalizedData = useMemo(() => {
        try {
            if (looksLikeCVData(data)) return data;
            return normalizeRAGToCV(data);
        } catch (e) {
            logger.error("Data normalization error", { error: e });
            return data as CVData;
        }
    }, [data]);

    // Generate legacy CSS variables (for backward compat)
    const cssVariables = useMemo(() => {
        const stats = unitStats ? {
            header: 0, summary: 0, experiences: 0, skills: 0,
            formation: 0, certifications: 0, languages: 0, margins: 0,
            ...unitStats,
        } : undefined;
        return generateCSSVariables(resolvedStyle.templateId, stats);
    }, [resolvedStyle.templateId, unitStats]);

    // Generate new theme CSS variables
    const themeVars = useMemo(() => {
        return getThemeVariables(resolvedStyle.templateId, format, resolvedStyle.themeOverrides);
    }, [resolvedStyle.templateId, format, resolvedStyle.themeOverrides]);

    const TemplateComponent = TEMPLATE_COMPONENTS[resolvedStyle.templateId] || TEMPLATE_COMPONENTS.modern;
    const effectiveDense = dense || !!resolvedStyle.dense;

    // Merge both variable sets
    const mergedStyle = {
        ...cssVariablesToStyle(cssVariables),
        ...themeToStyle(themeVars),
        ...(dynamicCssVariables || {}),
    };

    return (
        <div id="cv-container" style={mergedStyle}>
            <TemplateComponent
                data={normalizedData}
                includePhoto={includePhoto}
                jobContext={jobContext}
                dense={effectiveDense}
            />
            {customCSS && (
                <style dangerouslySetInnerHTML={{
                    __html: customCSS.replace(/([^{}]*\{)/g, (match) => {
                        // Scope custom CSS to #cv-container
                        if (match.trim().startsWith("@")) return match;
                        return `#cv-container ${match}`;
                    }),
                }} />
            )}
        </div>
    );
}

// Export all template components for direct use
export {
    ModernTemplate, TechTemplate, ClassicTemplate, CreativeTemplate,
    PikachuTemplate, BronzorTemplate, ChikoritaTemplate,
    DittoTemplate, GengarTemplate, LaprasTemplate,
};
