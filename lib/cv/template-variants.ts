import type { CVThemeVariables } from "@/lib/cv/cv-theme-variables";

export type CVTemplateDensity = "compact" | "normal" | "airy";

export interface CVTemplateVariant {
    id: string;
    baseId: string;
    name: string;
    themeOverrides: Partial<CVThemeVariables>;
    dense?: boolean;
}

const PALETTES: Array<{
    id: string;
    label: string;
    primary: string;
    primaryLight: string;
    sidebarAccent?: string;
}> = [
    { id: "indigo", label: "Indigo", primary: "#6366f1", primaryLight: "#6366f115", sidebarAccent: "#818cf8" },
    { id: "blue", label: "Bleu", primary: "#3b82f6", primaryLight: "#3b82f615", sidebarAccent: "#60a5fa" },
    { id: "emerald", label: "Émeraude", primary: "#10b981", primaryLight: "#10b98115", sidebarAccent: "#34d399" },
    { id: "cyan", label: "Cyan", primary: "#06b6d4", primaryLight: "#06b6d415", sidebarAccent: "#22d3ee" },
    { id: "violet", label: "Violet", primary: "#8b5cf6", primaryLight: "#8b5cf615", sidebarAccent: "#a78bfa" },
    { id: "rose", label: "Rose", primary: "#f43f5e", primaryLight: "#f43f5e15", sidebarAccent: "#fb7185" },
    { id: "amber", label: "Ambre", primary: "#f59e0b", primaryLight: "#f59e0b15", sidebarAccent: "#fbbf24" },
    { id: "slate", label: "Ardoise", primary: "#64748b", primaryLight: "#64748b15", sidebarAccent: "#94a3b8" },
];

const FONTS: Array<{
    id: string;
    label: string;
    body: string;
    heading: string;
}> = [
    {
        id: "sans",
        label: "Sans",
        body: "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif",
        heading: "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif",
    },
    {
        id: "mono",
        label: "Mono",
        body: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
        heading: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
    },
    {
        id: "serif",
        label: "Serif",
        body: "var(--font-serif), Georgia, 'Times New Roman', serif",
        heading: "var(--font-serif), Georgia, 'Times New Roman', serif",
    },
    {
        id: "display",
        label: "Display",
        body: "var(--font-display), var(--font-sans), sans-serif",
        heading: "var(--font-display), var(--font-sans), sans-serif",
    },
    {
        id: "mix",
        label: "Mix",
        body: "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif",
        heading: "var(--font-display), var(--font-sans), sans-serif",
    },
];

const DENSITIES: Array<{
    id: CVTemplateDensity;
    label: string;
    dense?: boolean;
    themeOverrides: Partial<CVThemeVariables>;
}> = [
    {
        id: "compact",
        label: "Compact",
        dense: true,
        themeOverrides: {
            "--cv-font-size-base": "8.5pt",
            "--cv-font-size-body": "8pt",
            "--cv-font-size-small": "7.5pt",
            "--cv-font-size-tiny": "6.8pt",
            "--cv-line-height": "1.25",
            "--cv-gap-x": "3mm",
            "--cv-gap-y": "2.5mm",
            "--cv-margin-x": "4mm",
            "--cv-margin-y": "4mm",
        },
    },
    {
        id: "normal",
        label: "Standard",
        themeOverrides: {},
    },
    {
        id: "airy",
        label: "Aéré",
        themeOverrides: {
            "--cv-font-size-base": "9.5pt",
            "--cv-font-size-body": "9pt",
            "--cv-font-size-small": "8.5pt",
            "--cv-font-size-tiny": "7.5pt",
            "--cv-line-height": "1.4",
            "--cv-gap-x": "4.5mm",
            "--cv-gap-y": "3.5mm",
            "--cv-margin-x": "6mm",
            "--cv-margin-y": "6mm",
        },
    },
];

function createVariantId(baseId: string, paletteId: string, fontId: string, densityId: string) {
    return `${baseId}__${paletteId}__${fontId}__${densityId}`;
}

export function createVariantsForBase(baseId: string, baseName: string): CVTemplateVariant[] {
    const variants: CVTemplateVariant[] = [];

    for (const palette of PALETTES) {
        for (const font of FONTS) {
            for (const density of DENSITIES) {
                const id = createVariantId(baseId, palette.id, font.id, density.id);
                const themeOverrides: Partial<CVThemeVariables> = {
                    "--cv-primary": palette.primary,
                    "--cv-primary-light": palette.primaryLight,
                    "--cv-sidebar-accent": palette.sidebarAccent || palette.primary,
                    "--cv-font-body": font.body,
                    "--cv-font-heading": font.heading,
                    ...density.themeOverrides,
                };

                variants.push({
                    id,
                    baseId,
                    name: `${baseName} · ${palette.label} · ${font.label} · ${density.label}`,
                    themeOverrides,
                    dense: density.dense,
                });
            }
        }
    }

    return variants;
}

export const CV_TEMPLATE_VARIANTS: CVTemplateVariant[] = [
    ...createVariantsForBase("modern", "Modern"),
    ...createVariantsForBase("tech", "Tech"),
];

export const CV_TEMPLATE_VARIANT_BY_ID: Record<string, CVTemplateVariant> = Object.fromEntries(
    CV_TEMPLATE_VARIANTS.map((v) => [v.id, v])
);

export function resolveTemplateVariant(templateId: string): { baseId: string; variant?: CVTemplateVariant } {
    const variant = CV_TEMPLATE_VARIANT_BY_ID[templateId];
    if (variant) return { baseId: variant.baseId, variant };

    const idx = templateId.indexOf("__");
    if (idx > 0) {
        const baseId = templateId.slice(0, idx);
        return { baseId };
    }

    return { baseId: templateId };
}

