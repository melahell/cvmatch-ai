export interface CVColorway {
    id: string;
    name: string;
    primary: string;
    primaryLight: string;
    sidebarAccent?: string;
    sidebarBg?: string;
}

export const CV_COLORWAYS: CVColorway[] = [
    { id: "indigo", name: "Indigo", primary: "#4f46e5", primaryLight: "#4f46e515", sidebarAccent: "#818cf8" },
    { id: "blue", name: "Bleu", primary: "#2563eb", primaryLight: "#2563eb15", sidebarAccent: "#60a5fa" },
    { id: "sky", name: "Ciel", primary: "#0284c7", primaryLight: "#0284c715", sidebarAccent: "#38bdf8" },
    { id: "cyan", name: "Cyan", primary: "#0891b2", primaryLight: "#0891b215", sidebarAccent: "#22d3ee" },
    { id: "teal", name: "Sarcelle", primary: "#0f766e", primaryLight: "#0f766e15", sidebarAccent: "#2dd4bf" },
    { id: "emerald", name: "Émeraude", primary: "#059669", primaryLight: "#05966915", sidebarAccent: "#34d399" },
    { id: "green", name: "Vert", primary: "#16a34a", primaryLight: "#16a34a15", sidebarAccent: "#4ade80" },
    { id: "lime", name: "Citron", primary: "#65a30d", primaryLight: "#65a30d15", sidebarAccent: "#a3e635" },
    { id: "amber", name: "Ambre", primary: "#d97706", primaryLight: "#d9770615", sidebarAccent: "#fbbf24" },
    { id: "orange", name: "Orange", primary: "#ea580c", primaryLight: "#ea580c15", sidebarAccent: "#fb923c" },
    { id: "rose", name: "Rose", primary: "#e11d48", primaryLight: "#e11d4815", sidebarAccent: "#fb7185" },
    { id: "red", name: "Rouge", primary: "#dc2626", primaryLight: "#dc262615", sidebarAccent: "#f87171" },
    { id: "violet", name: "Violet", primary: "#7c3aed", primaryLight: "#7c3aed15", sidebarAccent: "#a78bfa" },
    { id: "purple", name: "Pourpre", primary: "#9333ea", primaryLight: "#9333ea15", sidebarAccent: "#c084fc" },
    { id: "fuchsia", name: "Fuchsia", primary: "#c026d3", primaryLight: "#c026d315", sidebarAccent: "#e879f9" },
    { id: "slate", name: "Ardoise", primary: "#475569", primaryLight: "#47556915", sidebarAccent: "#94a3b8" },
    { id: "gray", name: "Gris", primary: "#4b5563", primaryLight: "#4b556315", sidebarAccent: "#9ca3af" },
    { id: "navy", name: "Marine", primary: "#1e3a8a", primaryLight: "#1e3a8a12", sidebarAccent: "#60a5fa" },
    { id: "charcoal", name: "Charbon", primary: "#111827", primaryLight: "#11182712", sidebarAccent: "#6b7280" },
    { id: "brown", name: "Brun", primary: "#7c2d12", primaryLight: "#7c2d1212", sidebarAccent: "#fdba74" },
];

export const CV_COLORWAY_BY_ID: Record<string, CVColorway> = Object.fromEntries(
    CV_COLORWAYS.map((c) => [c.id, c])
);

