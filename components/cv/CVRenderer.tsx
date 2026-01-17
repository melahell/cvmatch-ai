"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { CVData, JobContext, TemplateProps } from "./templates";
import { normalizeRAGToCV } from "./normalizeData";
import { generateCSSVariables, cssVariablesToStyle } from "@/lib/cv/css-variables";

// Dynamic imports for templates
const ModernTemplate = dynamic(() => import("./templates/ModernTemplate"), { ssr: false });
const TechTemplate = dynamic(() => import("./templates/TechTemplate"), { ssr: false });
const ClassicTemplate = dynamic(() => import("./templates/ClassicTemplate"), { ssr: false });
const CreativeTemplate = dynamic(() => import("./templates/CreativeTemplate"), { ssr: false });

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
    modern: ModernTemplate,
    tech: TechTemplate,
    classic: ClassicTemplate,
    creative: CreativeTemplate,
};

export default function CVRenderer({
    data,
    templateId,
    includePhoto = true,
    jobContext,
    dense = false,
    unitStats
}: CVRendererProps) {
    // Normalize the data to template-friendly format
    const normalizedData = useMemo(() => {
        try {
            return normalizeRAGToCV(data);
        } catch (e) {
            console.error("Data normalization error:", e);
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
export { ModernTemplate, TechTemplate, ClassicTemplate, CreativeTemplate };

