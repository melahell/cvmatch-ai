"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { CVData, JobContext, TemplateProps, DisplayLimits } from "./templates";
import { normalizeRAGToCV } from "./normalizeData";
import { generateCSSVariables, cssVariablesToStyle } from "@/lib/cv/css-variables";
import { getThemeVariables, themeToStyle } from "@/lib/cv/cv-theme-variables";
import { logger } from "@/lib/utils/logger";
import { resolveCVStyle } from "@/lib/cv/style/resolve-style";
import type { CVDensity } from "@/lib/cv/style/density";

// Dynamic imports — all templates
// Originals (4)
const ModernTemplate = dynamic(() => import("./templates/ModernTemplate"), { ssr: false });
const TechTemplate = dynamic(() => import("./templates/TechTemplate"), { ssr: false });
const ClassicTemplate = dynamic(() => import("./templates/ClassicTemplate"), { ssr: false });
const CreativeTemplate = dynamic(() => import("./templates/CreativeTemplate"), { ssr: false });

// Premium (6)
const ElegantTemplate = dynamic(() => import("./templates/premium/ElegantTemplate"), { ssr: false });
const ExecutiveTemplate = dynamic(() => import("./templates/premium/ExecutiveTemplate"), { ssr: false });
const TerminalTemplate = dynamic(() => import("./templates/premium/TerminalTemplate"), { ssr: false });
const MetropolisTemplate = dynamic(() => import("./templates/premium/MetropolisTemplate"), { ssr: false });
const HorizonTemplate = dynamic(() => import("./templates/premium/HorizonTemplate"), { ssr: false });
const CatalystTemplate = dynamic(() => import("./templates/premium/CatalystTemplate"), { ssr: false });

// Reactive Resume (13 total)
const PikachuTemplate = dynamic(() => import("./templates/rr/PikachuTemplate"), { ssr: false });
const BronzorTemplate = dynamic(() => import("./templates/rr/BronzorTemplate"), { ssr: false });
const ChikoritaTemplate = dynamic(() => import("./templates/rr/ChikoritaTemplate"), { ssr: false });
const DittoTemplate = dynamic(() => import("./templates/rr/DittoTemplate"), { ssr: false });
const GengarTemplate = dynamic(() => import("./templates/rr/GengarTemplate"), { ssr: false });
const LaprasTemplate = dynamic(() => import("./templates/rr/LaprasTemplate"), { ssr: false });
const AzurillTemplate = dynamic(() => import("./templates/rr/AzurillTemplate"), { ssr: false });
const GlalieTemplate = dynamic(() => import("./templates/rr/GlalieTemplate"), { ssr: false });
const KakunaTemplate = dynamic(() => import("./templates/rr/KakunaTemplate"), { ssr: false });
const LeafishTemplate = dynamic(() => import("./templates/rr/LeafishTemplate"), { ssr: false });
const NosepassTemplate = dynamic(() => import("./templates/rr/NosepassTemplate"), { ssr: false });
const OnyxTemplate = dynamic(() => import("./templates/rr/OnyxTemplate"), { ssr: false });
const RhyhornTemplate = dynamic(() => import("./templates/rr/RhyhornTemplate"), { ssr: false });
// RR Améliorés (10)
const AuroraTemplate = dynamic(() => import("./templates/rr-improved/AuroraTemplate"), { ssr: false });
const CarbonTemplate = dynamic(() => import("./templates/rr-improved/CarbonTemplate"), { ssr: false });
const SlateTemplate = dynamic(() => import("./templates/rr-improved/SlateTemplate"), { ssr: false });
const IvoryTemplate = dynamic(() => import("./templates/rr-improved/IvoryTemplate"), { ssr: false });
const ApexTemplate = dynamic(() => import("./templates/rr-improved/ApexTemplate"), { ssr: false });
const VertexTemplate = dynamic(() => import("./templates/rr-improved/VertexTemplate"), { ssr: false });
const PrismTemplate = dynamic(() => import("./templates/rr-improved/PrismTemplate"), { ssr: false });
const LumenTemplate = dynamic(() => import("./templates/rr-improved/LumenTemplate"), { ssr: false });
const HelixTemplate = dynamic(() => import("./templates/rr-improved/HelixTemplate"), { ssr: false });
const NovaTemplate = dynamic(() => import("./templates/rr-improved/NovaTemplate"), { ssr: false });

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
    containerId?: string;
    unitStats?: {
        total: number;
        remaining: number;
        percentage: number;
    };
    dynamicCssVariables?: Record<string, string>;
    displayLimits?: DisplayLimits;
}

const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<TemplateProps>> = {
    // Originals (4)
    modern: ModernTemplate,
    tech: TechTemplate,
    classic: ClassicTemplate,
    creative: CreativeTemplate,
    // Premium (6)
    elegant: ElegantTemplate,
    executive: ExecutiveTemplate,
    terminal: TerminalTemplate,
    metropolis: MetropolisTemplate,
    horizon: HorizonTemplate,
    catalyst: CatalystTemplate,
    // Reactive Resume (13)
    pikachu: PikachuTemplate,
    bronzor: BronzorTemplate,
    chikorita: ChikoritaTemplate,
    ditto: DittoTemplate,
    gengar: GengarTemplate,
    lapras: LaprasTemplate,
    azurill: AzurillTemplate,
    glalie: GlalieTemplate,
    kakuna: KakunaTemplate,
    leafish: LeafishTemplate,
    nosepass: NosepassTemplate,
    onyx: OnyxTemplate,
    rhyhorn: RhyhornTemplate,
    aurora: AuroraTemplate,
    carbon: CarbonTemplate,
    slate: SlateTemplate,
    ivory: IvoryTemplate,
    apex: ApexTemplate,
    vertex: VertexTemplate,
    prism: PrismTemplate,
    lumen: LumenTemplate,
    helix: HelixTemplate,
    nova: NovaTemplate,
};

/** All available template IDs */
export const AVAILABLE_TEMPLATE_IDS = Object.keys(TEMPLATE_COMPONENTS);

const TEMPLATE_IMPORTERS: Record<string, () => Promise<unknown>> = {
    modern: () => import("./templates/ModernTemplate"),
    tech: () => import("./templates/TechTemplate"),
    classic: () => import("./templates/ClassicTemplate"),
    creative: () => import("./templates/CreativeTemplate"),
    elegant: () => import("./templates/premium/ElegantTemplate"),
    executive: () => import("./templates/premium/ExecutiveTemplate"),
    terminal: () => import("./templates/premium/TerminalTemplate"),
    metropolis: () => import("./templates/premium/MetropolisTemplate"),
    horizon: () => import("./templates/premium/HorizonTemplate"),
    catalyst: () => import("./templates/premium/CatalystTemplate"),
    pikachu: () => import("./templates/rr/PikachuTemplate"),
    bronzor: () => import("./templates/rr/BronzorTemplate"),
    chikorita: () => import("./templates/rr/ChikoritaTemplate"),
    ditto: () => import("./templates/rr/DittoTemplate"),
    gengar: () => import("./templates/rr/GengarTemplate"),
    lapras: () => import("./templates/rr/LaprasTemplate"),
    azurill: () => import("./templates/rr/AzurillTemplate"),
    glalie: () => import("./templates/rr/GlalieTemplate"),
    kakuna: () => import("./templates/rr/KakunaTemplate"),
    leafish: () => import("./templates/rr/LeafishTemplate"),
    nosepass: () => import("./templates/rr/NosepassTemplate"),
    onyx: () => import("./templates/rr/OnyxTemplate"),
    rhyhorn: () => import("./templates/rr/RhyhornTemplate"),
    aurora: () => import("./templates/rr-improved/AuroraTemplate"),
    carbon: () => import("./templates/rr-improved/CarbonTemplate"),
    slate: () => import("./templates/rr-improved/SlateTemplate"),
    ivory: () => import("./templates/rr-improved/IvoryTemplate"),
    apex: () => import("./templates/rr-improved/ApexTemplate"),
    vertex: () => import("./templates/rr-improved/VertexTemplate"),
    prism: () => import("./templates/rr-improved/PrismTemplate"),
    lumen: () => import("./templates/rr-improved/LumenTemplate"),
    helix: () => import("./templates/rr-improved/HelixTemplate"),
    nova: () => import("./templates/rr-improved/NovaTemplate"),
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
    containerId = "cv-container",
    unitStats,
    dynamicCssVariables,
    displayLimits,
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
        <div id={containerId} style={mergedStyle}>
            <TemplateComponent
                data={normalizedData}
                includePhoto={includePhoto}
                jobContext={jobContext}
                dense={effectiveDense}
                displayLimits={displayLimits}
            />
            {customCSS && (
                <style dangerouslySetInnerHTML={{
                    __html: customCSS.replace(/([^{}]*\{)/g, (match) => {
                        // Scope custom CSS to #cv-container
                        if (match.trim().startsWith("@")) return match;
                        return `#${containerId} ${match}`;
                    }),
                }} />
            )}
        </div>
    );
}

// Export all template components for direct use
export {
    ModernTemplate, TechTemplate, ClassicTemplate, CreativeTemplate,
    ElegantTemplate, ExecutiveTemplate, TerminalTemplate,
    MetropolisTemplate, HorizonTemplate, CatalystTemplate,
    PikachuTemplate, BronzorTemplate, ChikoritaTemplate,
    DittoTemplate, GengarTemplate, LaprasTemplate,
};
