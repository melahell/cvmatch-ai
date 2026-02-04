import type { CVThemeVariables } from "@/lib/cv/cv-theme-variables";
import { CV_COLORWAY_BY_ID } from "@/lib/cv/style/colorways";
import { CV_FONT_BY_ID } from "@/lib/cv/style/fonts";
import { CV_DENSITY_BY_ID, type CVDensity } from "@/lib/cv/style/density";

export interface CVStyleSelection {
    templateId: string;
    colorwayId?: string;
    fontId?: string;
    density?: CVDensity;
    printSafe?: boolean;
}

export interface ResolvedCVStyle {
    templateId: string;
    colorwayId?: string;
    fontId?: string;
    density?: CVDensity;
    themeOverrides: Partial<CVThemeVariables>;
    dense?: boolean;
}

function normalizeId(v: string | undefined): string | undefined {
    if (!v) return undefined;
    const s = String(v).trim();
    return s.length ? s : undefined;
}

function normalizeDensity(v: string | undefined): CVDensity | undefined {
    if (!v) return undefined;
    if (v === "compact" || v === "normal" || v === "airy") return v;
    return undefined;
}

export function parseLegacyTemplateId(templateId: string): {
    templateId: string;
    colorwayId?: string;
    fontId?: string;
    density?: CVDensity;
} {
    const id = String(templateId || "").trim();
    const parts = id.split("__");
    if (parts.length < 2) return { templateId: id };

    const base = parts[0] || id;
    const colorwayId = normalizeId(parts[1]);
    const fontId = normalizeId(parts[2]);
    const density = normalizeDensity(parts[3]);

    return { templateId: base, colorwayId, fontId, density };
}

function isFontAllowed(templateId: string, fontId: string): boolean {
    return true;
}

function applyPrintSafe(templateId: string): Partial<CVThemeVariables> {
    if (templateId === "modern") {
        return {
            "--cv-sidebar-bg": "#0f172a",
        };
    }
    return {};
}

export function resolveCVStyle(selection: CVStyleSelection): ResolvedCVStyle {
    const legacy = selection.templateId.includes("__") ? parseLegacyTemplateId(selection.templateId) : null;
    const baseTemplateId = legacy?.templateId || selection.templateId;

    const colorwayId = normalizeId(selection.colorwayId) || legacy?.colorwayId;
    const fontIdRaw = normalizeId(selection.fontId) || legacy?.fontId;
    const density = selection.density || legacy?.density;

    const themeOverrides: Partial<CVThemeVariables> = {};

    if (colorwayId) {
        const color = CV_COLORWAY_BY_ID[colorwayId];
        if (color) {
            themeOverrides["--cv-primary"] = color.primary;
            themeOverrides["--cv-primary-light"] = color.primaryLight;
            themeOverrides["--cv-sidebar-accent"] = color.sidebarAccent || color.primary;
            if (color.sidebarBg) {
                themeOverrides["--cv-sidebar-bg"] = color.sidebarBg;
            }
        }
    }

    if (fontIdRaw) {
        const font = CV_FONT_BY_ID[fontIdRaw];
        if (font && isFontAllowed(baseTemplateId, font.id)) {
            themeOverrides["--cv-font-body"] = font.body;
            themeOverrides["--cv-font-heading"] = font.heading;
        }
    }

    let dense: boolean | undefined = undefined;
    if (density) {
        const d = CV_DENSITY_BY_ID[density];
        Object.assign(themeOverrides, d.themeOverrides);
        dense = d.denseFlag;
    }

    if (selection.printSafe) {
        Object.assign(themeOverrides, applyPrintSafe(baseTemplateId));
    }

    return {
        templateId: baseTemplateId,
        colorwayId,
        fontId: fontIdRaw,
        density,
        themeOverrides,
        dense,
    };
}
