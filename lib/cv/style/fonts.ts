export interface CVFontPreset {
    id: string;
    name: string;
    body: string;
    heading: string;
}

export const CV_FONTS: CVFontPreset[] = [
    {
        id: "sans",
        name: "Sans",
        body: "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif",
        heading: "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif",
    },
    {
        id: "serif",
        name: "Serif",
        body: "var(--font-serif), Georgia, 'Times New Roman', serif",
        heading: "var(--font-serif), Georgia, 'Times New Roman', serif",
    },
    {
        id: "mono",
        name: "Mono",
        body: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
        heading: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
    },
    {
        id: "display",
        name: "Display",
        body: "var(--font-display), var(--font-sans), sans-serif",
        heading: "var(--font-display), var(--font-sans), sans-serif",
    },
];

export const CV_FONT_BY_ID: Record<string, CVFontPreset> = Object.fromEntries(
    CV_FONTS.map((f) => [f.id, f])
);

