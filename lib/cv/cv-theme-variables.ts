/**
 * CV Theme CSS Variables System
 *
 * Système de theming unifié inspiré de Reactive Resume.
 * Toutes les valeurs visuelles des templates passent par des CSS Custom Properties.
 * Un template ne définit que son LAYOUT — les couleurs/fonts viennent d'ici.
 */

export interface CVThemeVariables {
    // Colors
    "--cv-primary": string;
    "--cv-primary-light": string;
    "--cv-text": string;
    "--cv-text-muted": string;
    "--cv-background": string;
    "--cv-sidebar-bg": string;
    "--cv-sidebar-text": string;
    "--cv-sidebar-accent": string;
    "--cv-border": string;

    // Typography
    "--cv-font-body": string;
    "--cv-font-heading": string;
    "--cv-font-size-base": string;
    "--cv-font-size-name": string;
    "--cv-font-size-title": string;
    "--cv-font-size-section": string;
    "--cv-font-size-body": string;
    "--cv-font-size-small": string;
    "--cv-font-size-tiny": string;
    "--cv-line-height": string;

    // Layout
    "--cv-page-width": string;
    "--cv-page-height": string;
    "--cv-sidebar-width": string;
    "--cv-margin-x": string;
    "--cv-margin-y": string;
    "--cv-gap-x": string;
    "--cv-gap-y": string;

    // Page
    "--cv-format": string;
}

export interface CVThemePreset {
    id: string;
    name: string;
    variables: CVThemeVariables;
}

/**
 * Default theme variables (professional, neutral)
 */
const DEFAULT_VARIABLES: CVThemeVariables = {
    "--cv-primary": "#3b82f6",
    "--cv-primary-light": "#3b82f615",
    "--cv-text": "#1f2937",
    "--cv-text-muted": "#6b7280",
    "--cv-background": "#ffffff",
    "--cv-sidebar-bg": "#f8fafc",
    "--cv-sidebar-text": "#1f2937",
    "--cv-sidebar-accent": "#3b82f6",
    "--cv-border": "#e5e7eb",

    "--cv-font-body": "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif",
    "--cv-font-heading": "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif",
    "--cv-font-size-base": "9pt",
    "--cv-font-size-name": "18pt",
    "--cv-font-size-title": "11pt",
    "--cv-font-size-section": "10pt",
    "--cv-font-size-body": "8.5pt",
    "--cv-font-size-small": "8pt",
    "--cv-font-size-tiny": "7pt",
    "--cv-line-height": "1.35",

    "--cv-page-width": "210mm",
    "--cv-page-height": "297mm",
    "--cv-sidebar-width": "35%",
    "--cv-margin-x": "5mm",
    "--cv-margin-y": "5mm",
    "--cv-gap-x": "4mm",
    "--cv-gap-y": "3mm",

    "--cv-format": "A4",
};

/**
 * Template-specific theme overrides
 */
const TEMPLATE_OVERRIDES: Record<string, Partial<CVThemeVariables>> = {
    modern: {
        "--cv-primary": "#6366f1",
        "--cv-primary-light": "#6366f115",
        "--cv-sidebar-bg": "linear-gradient(180deg, #0f172a 0%, #475569 100%)",
        "--cv-sidebar-text": "#f8fafc",
        "--cv-sidebar-accent": "#818cf8",
        "--cv-font-heading": "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif",
        "--cv-sidebar-width": "75mm",
    },
    tech: {
        "--cv-primary": "#22c55e",
        "--cv-primary-light": "#22c55e15",
        "--cv-sidebar-bg": "#0f172a",
        "--cv-sidebar-text": "#f8fafc",
        "--cv-sidebar-accent": "#34d399",
        "--cv-font-body": "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
        "--cv-font-heading": "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
        "--cv-sidebar-width": "70mm",
    },
    classic: {
        "--cv-primary": "#1e3a5f",
        "--cv-primary-light": "#1e3a5f10",
        "--cv-sidebar-bg": "#ffffff",
        "--cv-sidebar-text": "#1f2937",
        "--cv-font-body": "var(--font-serif), Georgia, 'Times New Roman', serif",
        "--cv-font-heading": "var(--font-serif), Georgia, 'Times New Roman', serif",
        "--cv-sidebar-width": "0",
    },
    creative: {
        "--cv-primary": "#f59e0b",
        "--cv-primary-light": "#f59e0b15",
        "--cv-sidebar-bg": "#f9fafb",
        "--cv-sidebar-text": "#1f2937",
        "--cv-sidebar-accent": "#f97316",
        "--cv-font-body": "var(--font-display), var(--font-sans), sans-serif",
        "--cv-font-heading": "var(--font-display), var(--font-sans), sans-serif",
        "--cv-sidebar-width": "65mm",
    },
    onyx: {
        "--cv-primary": "#3b82f6",
        "--cv-primary-light": "#3b82f615",
        "--cv-sidebar-bg": "#f8fafc",
        "--cv-sidebar-text": "#1f2937",
        "--cv-sidebar-width": "35%",
    },
    pikachu: {
        "--cv-primary": "#f59e0b",
        "--cv-primary-light": "#f59e0b15",
        "--cv-sidebar-width": "0",
    },
    bronzor: {
        "--cv-primary": "#6366f1",
        "--cv-primary-light": "#6366f115",
        "--cv-sidebar-width": "0",
    },
    azurill: {
        "--cv-primary": "#3b82f6",
        "--cv-primary-light": "#3b82f615",
        "--cv-sidebar-bg": "#eff6ff",
        "--cv-sidebar-text": "#1f2937",
        "--cv-sidebar-width": "33%",
    },
    chikorita: {
        "--cv-primary": "#10b981",
        "--cv-primary-light": "#10b98115",
        "--cv-sidebar-bg": "#ecfdf5",
        "--cv-sidebar-text": "#1f2937",
        "--cv-sidebar-width": "33%",
    },
    gengar: {
        "--cv-primary": "#6366f1",
        "--cv-primary-light": "#6366f115",
        "--cv-sidebar-bg": "#f0f0ff",
        "--cv-sidebar-text": "#1f2937",
        "--cv-sidebar-width": "33%",
    },
    glalie: {
        "--cv-primary": "#0ea5e9",
        "--cv-primary-light": "#0ea5e915",
        "--cv-sidebar-bg": "#f0f9ff",
        "--cv-sidebar-text": "#1f2937",
        "--cv-sidebar-width": "33%",
    },
    kakuna: {
        "--cv-primary": "#059669",
        "--cv-primary-light": "#05966915",
        "--cv-sidebar-width": "0",
    },
    leafish: {
        "--cv-primary": "#22c55e",
        "--cv-primary-light": "#22c55e15",
        "--cv-sidebar-width": "0",
    },
    lapras: {
        "--cv-primary": "#06b6d4",
        "--cv-primary-light": "#06b6d415",
        "--cv-sidebar-width": "33%",
    },
    ditto: {
        "--cv-primary": "#8b5cf6",
        "--cv-primary-light": "#8b5cf615",
        "--cv-sidebar-bg": "#faf5ff",
        "--cv-sidebar-text": "#1f2937",
        "--cv-sidebar-width": "33%",
    },
    ditgar: {
        "--cv-primary": "#a855f7",
        "--cv-primary-light": "#a855f715",
        "--cv-sidebar-bg": "#1e1b4b",
        "--cv-sidebar-text": "#f8fafc",
        "--cv-sidebar-accent": "#c4b5fd",
        "--cv-sidebar-width": "33%",
    },
    rhyhorn: {
        "--cv-primary": "#64748b",
        "--cv-primary-light": "#64748b15",
        "--cv-sidebar-width": "0",
    },
    umbreon: {
        "--cv-primary": "#f59e0b",
        "--cv-primary-light": "#f59e0b15",
        "--cv-sidebar-bg": "linear-gradient(180deg, #0b1020 0%, #111827 100%)",
        "--cv-sidebar-text": "#f8fafc",
        "--cv-sidebar-accent": "#fde047",
        "--cv-sidebar-width": "35%",
    },
    eevee: {
        "--cv-primary": "#92400e",
        "--cv-primary-light": "#92400e15",
        "--cv-sidebar-width": "0",
    },
    altaria: {
        "--cv-primary": "#2563eb",
        "--cv-primary-light": "#2563eb15",
        "--cv-sidebar-width": "0",
    },
};

/**
 * Get theme variables for a template, with format override
 */
export function getThemeVariables(
    templateId: string,
    format: "A4" | "Letter" = "A4",
    overrides?: Partial<CVThemeVariables>
): CVThemeVariables {
    const formatDims = format === "Letter"
        ? { "--cv-page-width": "215.9mm", "--cv-page-height": "279.4mm", "--cv-format": "Letter" }
        : { "--cv-page-width": "210mm", "--cv-page-height": "297mm", "--cv-format": "A4" };

    return {
        ...DEFAULT_VARIABLES,
        ...formatDims,
        ...(TEMPLATE_OVERRIDES[templateId] || {}),
        ...(overrides || {}),
    } as CVThemeVariables;
}

/**
 * Convert theme variables to React CSSProperties for inline injection
 */
export function themeToStyle(variables: CVThemeVariables): React.CSSProperties {
    return variables as unknown as React.CSSProperties;
}

/**
 * Generate a CSS string from theme variables (for <style> injection)
 */
export function themeToCSS(variables: CVThemeVariables): string {
    return Object.entries(variables)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join("\n");
}

/**
 * Google Fonts URL generator for the theme
 */
export function getGoogleFontsUrl(templateId: string): string {
    const fontFamilies: Record<string, string[]> = {
        default: ["Inter:wght@400;500;600;700;800"],
        tech: ["JetBrains+Mono:wght@400;500;600;700", "Inter:wght@400;500;600;700"],
        classic: ["Libre+Baskerville:wght@400;700", "Inter:wght@400;500;600;700"],
        creative: ["Outfit:wght@400;500;600;700;800", "Inter:wght@400;500;600;700"],
    };

    const families = fontFamilies[templateId] || fontFamilies.default;
    return `https://fonts.googleapis.com/css2?${families.map(f => `family=${f}`).join("&")}&display=block`;
}
