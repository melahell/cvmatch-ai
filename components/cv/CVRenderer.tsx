"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { CVData, JobContext, TemplateProps } from "./templates";
import { normalizeRAGToCV } from "./normalizeData";
import { generateCSSVariables, cssVariablesToStyle } from "@/lib/cv/css-variables";
import { getThemeVariables, themeToStyle } from "@/lib/cv/cv-theme-variables";
import { logger } from "@/lib/utils/logger";
import { resolveTemplateVariant } from "@/lib/cv/template-variants";

// Dynamic imports for templates — all 17
const ModernTemplate = dynamic(() => import("./templates/ModernTemplate"), { ssr: false });
const TechTemplate = dynamic(() => import("./templates/TechTemplate"), { ssr: false });
const ClassicTemplate = dynamic(() => import("./templates/ClassicTemplate"), { ssr: false });
const CreativeTemplate = dynamic(() => import("./templates/CreativeTemplate"), { ssr: false });

// Templates Reactive Resume (13)
const OnyxTemplate = dynamic(() => import("./templates/rr/OnyxTemplate"), { ssr: false });
const PikachuTemplate = dynamic(() => import("./templates/rr/PikachuTemplate"), { ssr: false });
const BronzorTemplate = dynamic(() => import("./templates/rr/BronzorTemplate"), { ssr: false });
const AzurillTemplate = dynamic(() => import("./templates/rr/AzurillTemplate"), { ssr: false });
const ChikoritaTemplate = dynamic(() => import("./templates/rr/ChikoritaTemplate"), { ssr: false });
const DitgarTemplate = dynamic(() => import("./templates/rr/DitgarTemplate"), { ssr: false });
const DittoTemplate = dynamic(() => import("./templates/rr/DittoTemplate"), { ssr: false });
const GengarTemplate = dynamic(() => import("./templates/rr/GengarTemplate"), { ssr: false });
const GlalieTemplate = dynamic(() => import("./templates/rr/GlalieTemplate"), { ssr: false });
const KakunaTemplate = dynamic(() => import("./templates/rr/KakunaTemplate"), { ssr: false });
const LaprasTemplate = dynamic(() => import("./templates/rr/LaprasTemplate"), { ssr: false });
const LeafishTemplate = dynamic(() => import("./templates/rr/LeafishTemplate"), { ssr: false });
const RhyhornTemplate = dynamic(() => import("./templates/rr/RhyhornTemplate"), { ssr: false });

export interface CVRendererProps {
    data: any; // Accept raw data from API, will normalize
    templateId: string;
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
}

const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<TemplateProps>> = {
    // Templates originaux CV-Crush (4)
    modern: ModernTemplate,
    tech: TechTemplate,
    classic: ClassicTemplate,
    creative: CreativeTemplate,
    // Templates Reactive Resume (13)
    onyx: OnyxTemplate,
    pikachu: PikachuTemplate,
    bronzor: BronzorTemplate,
    azurill: AzurillTemplate,
    chikorita: ChikoritaTemplate,
    ditgar: DitgarTemplate,
    ditto: DittoTemplate,
    gengar: GengarTemplate,
    glalie: GlalieTemplate,
    kakuna: KakunaTemplate,
    lapras: LaprasTemplate,
    leafish: LeafishTemplate,
    rhyhorn: RhyhornTemplate,
};

/** All available template IDs */
export const AVAILABLE_TEMPLATE_IDS = Object.keys(TEMPLATE_COMPONENTS);

export default function CVRenderer({
    data,
    templateId,
    includePhoto = true,
    jobContext,
    dense = false,
    format = "A4",
    customCSS,
    unitStats,
}: CVRendererProps) {
    const { baseId, variant } = useMemo(() => resolveTemplateVariant(templateId), [templateId]);

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
        return generateCSSVariables(baseId, stats);
    }, [baseId, unitStats]);

    // Generate new theme CSS variables
    const themeVars = useMemo(() => {
        return getThemeVariables(baseId, format, variant?.themeOverrides);
    }, [baseId, format, variant]);

    const TemplateComponent = TEMPLATE_COMPONENTS[baseId] || TEMPLATE_COMPONENTS.modern;
    const effectiveDense = dense || !!variant?.dense;

    // Merge both variable sets
    const mergedStyle = {
        ...cssVariablesToStyle(cssVariables),
        ...themeToStyle(themeVars),
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
    OnyxTemplate, PikachuTemplate, BronzorTemplate,
    AzurillTemplate, ChikoritaTemplate, DitgarTemplate, DittoTemplate,
    GengarTemplate, GlalieTemplate, KakunaTemplate,
    LaprasTemplate, LeafishTemplate, RhyhornTemplate,
};
