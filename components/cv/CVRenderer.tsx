"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { CVData, JobContext, TemplateProps } from "./templates";
import { normalizeRAGToCV } from "./normalizeData";
import { generateCSSVariables, cssVariablesToStyle } from "@/lib/cv/css-variables";
import { logger } from "@/lib/utils/logger";

// Dynamic imports for templates
const ModernTemplate = dynamic(() => import("./templates/ModernTemplate"), { ssr: false });
const TechTemplate = dynamic(() => import("./templates/TechTemplate"), { ssr: false });
const ClassicTemplate = dynamic(() => import("./templates/ClassicTemplate"), { ssr: false });
const CreativeTemplate = dynamic(() => import("./templates/CreativeTemplate"), { ssr: false });

// [CDC Sprint 4.2] Templates Reactive Resume
const OnyxTemplate = dynamic(() => import("./templates/rr/OnyxTemplate"), { ssr: false });
const PikachuTemplate = dynamic(() => import("./templates/rr/PikachuTemplate"), { ssr: false });
const BronzorTemplate = dynamic(() => import("./templates/rr/BronzorTemplate"), { ssr: false });

interface CVRendererProps {
    data: any; // Accept raw data from API, will normalize
    templateId: string;
    includePhoto?: boolean;
    jobContext?: JobContext;
    dense?: boolean;
    unitStats?: {
        total: number;
        remaining: number;
        percentage: number;
    };
}

const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<TemplateProps>> = {
    // Templates originaux CV-Crush
    modern: ModernTemplate,
    tech: TechTemplate,
    classic: ClassicTemplate,
    creative: CreativeTemplate,
    // [CDC Sprint 4.2] Templates Reactive Resume
    onyx: OnyxTemplate,
    pikachu: PikachuTemplate,
    bronzor: BronzorTemplate,
};

export default function CVRenderer({
    data,
    templateId,
    includePhoto = true,
    jobContext,
    dense = false,
    unitStats
}: CVRendererProps) {
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

    // Generate CSS variables for the theme
    const cssVariables = useMemo(() => {
        const stats = unitStats ? {
            header: 0,
            summary: 0,
            experiences: 0,
            skills: 0,
            formation: 0,
            certifications: 0,
            languages: 0,
            margins: 0,
            ...unitStats
        } : undefined;
        return generateCSSVariables(templateId, stats);
    }, [templateId, unitStats]);

    const TemplateComponent = TEMPLATE_COMPONENTS[templateId] || TEMPLATE_COMPONENTS.modern;

    return (
        <div style={cssVariablesToStyle(cssVariables)}>
            <TemplateComponent
                data={normalizedData}
                includePhoto={includePhoto}
                jobContext={jobContext}
                dense={dense}
            />
        </div>
    );
}

// Export for PDF generation
export { 
    ModernTemplate, TechTemplate, ClassicTemplate, CreativeTemplate,
    OnyxTemplate, PikachuTemplate, BronzorTemplate,
};
