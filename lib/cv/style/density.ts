import type { CVThemeVariables } from "@/lib/cv/cv-theme-variables";

export type CVDensity = "compact" | "normal" | "airy";

export interface CVDensityPreset {
    id: CVDensity;
    name: string;
    themeOverrides: Partial<CVThemeVariables>;
    denseFlag?: boolean;
}

export const CV_DENSITIES: CVDensityPreset[] = [
    {
        id: "compact",
        name: "Compact",
        denseFlag: true,
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
        name: "Normal",
        themeOverrides: {},
    },
    {
        id: "airy",
        name: "Aéré",
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

export const CV_DENSITY_BY_ID: Record<CVDensity, CVDensityPreset> = Object.fromEntries(
    CV_DENSITIES.map((d) => [d.id, d])
) as Record<CVDensity, CVDensityPreset>;

