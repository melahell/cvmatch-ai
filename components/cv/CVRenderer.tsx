"use client";

import dynamic from "next/dynamic";
import { CVData, JobContext, TemplateProps } from "./templates";

// Dynamic imports for templates
const ModernTemplate = dynamic(() => import("./templates/ModernTemplate"), { ssr: false });
const TechTemplate = dynamic(() => import("./templates/TechTemplate"), { ssr: false });
const ClassicTemplate = dynamic(() => import("./templates/ClassicTemplate"), { ssr: false });
const CreativeTemplate = dynamic(() => import("./templates/CreativeTemplate"), { ssr: false });

interface CVRendererProps {
    data: CVData;
    templateId: string;
    includePhoto?: boolean;
    jobContext?: JobContext;
    dense?: boolean;
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
    dense = false
}: CVRendererProps) {
    const TemplateComponent = TEMPLATE_COMPONENTS[templateId] || TEMPLATE_COMPONENTS.modern;

    return (
        <TemplateComponent
            data={data}
            includePhoto={includePhoto}
            jobContext={jobContext}
            dense={dense}
        />
    );
}

// Export for PDF generation
export { ModernTemplate, TechTemplate, ClassicTemplate, CreativeTemplate };

