/**
 * Templates Reactive Resume - Index
 * 
 * [CDC Sprint 4.2] Templates adaptés depuis Reactive Resume (MIT License)
 * Total: 14 templates disponibles (3 existants + 11 nouveaux)
 */

// Existing templates
export { default as OnyxTemplate } from "./OnyxTemplate";
export { default as PikachuTemplate } from "./PikachuTemplate";
export { default as BronzorTemplate } from "./BronzorTemplate";

// New templates (adapted from Reactive Resume)
export { default as AzurillTemplate } from "./AzurillTemplate";
export { default as DittoTemplate } from "./DittoTemplate";
export { default as GengarTemplate } from "./GengarTemplate";
export { default as GlalieTemplate } from "./GlalieTemplate";
export { default as KakunaTemplate } from "./KakunaTemplate";
export { default as ChikoritaTemplate } from "./ChikoritaTemplate";
export { default as RhyhornTemplate } from "./RhyhornTemplate";
export { default as LeafishTemplate } from "./LeafishTemplate";
export { default as LaprasTemplate } from "./LaprasTemplate";
export { default as DitgarTemplate } from "./DitgarTemplate";

/**
 * Informations sur les templates Reactive Resume
 */
export const RR_TEMPLATE_INFO = [
    {
        id: "onyx",
        name: "Onyx",
        description: "Design professionnel avec sidebar, idéal pour consultants",
        category: "professional" as const,
        preview: "/templates/onyx-preview.png",
        available: true,
        recommended: ["Consulting", "Management", "Finance"],
    },
    {
        id: "pikachu",
        name: "Pikachu",
        description: "Design moderne et dynamique, header coloré",
        category: "modern" as const,
        preview: "/templates/pikachu-preview.png",
        available: true,
        recommended: ["Marketing", "Design", "Startup"],
    },
    {
        id: "bronzor",
        name: "Bronzor",
        description: "Design minimaliste et élégant, typographie épurée",
        category: "minimal" as const,
        preview: "/templates/bronzor-preview.png",
        available: true,
        recommended: ["Juridique", "Académique", "Direction"],
    },
    {
        id: "azurill",
        name: "Azurill",
        description: "Header centré avec timeline, design équilibré",
        category: "professional" as const,
        preview: "/templates/azurill-preview.png",
        available: true,
        recommended: ["Tech", "Engineering", "Consulting"],
    },
    {
        id: "ditto",
        name: "Ditto",
        description: "Header violet élégant avec sidebar compacte",
        category: "modern" as const,
        preview: "/templates/ditto-preview.png",
        available: true,
        recommended: ["Creative", "Digital", "Startup"],
    },
    {
        id: "gengar",
        name: "Gengar",
        description: "Sidebar colorée avec header intégré, style indigo",
        category: "professional" as const,
        preview: "/templates/gengar-preview.png",
        available: true,
        recommended: ["Tech", "Data", "Product"],
    },
    {
        id: "glalie",
        name: "Glalie",
        description: "Photo centrée avec sidebar minimaliste, style bleu ciel",
        category: "minimal" as const,
        preview: "/templates/glalie-preview.png",
        available: true,
        recommended: ["Healthcare", "Education", "HR"],
    },
    {
        id: "kakuna",
        name: "Kakuna",
        description: "Layout full-width épuré, vert émeraude",
        category: "minimal" as const,
        preview: "/templates/kakuna-preview.png",
        available: true,
        recommended: ["Environment", "Sciences", "R&D"],
    },
    {
        id: "chikorita",
        name: "Chikorita",
        description: "Header gradient frais, two-columns moderne",
        category: "modern" as const,
        preview: "/templates/chikorita-preview.png",
        available: true,
        recommended: ["Marketing", "UX/UI", "Growth"],
    },
    {
        id: "rhyhorn",
        name: "Rhyhorn",
        description: "Style robuste avec accents gris ardoise",
        category: "professional" as const,
        preview: "/templates/rhyhorn-preview.png",
        available: true,
        recommended: ["Industrial", "Operations", "Logistics"],
    },
    {
        id: "leafish",
        name: "Leafish",
        description: "Design nature avec coins arrondis, vert frais",
        category: "modern" as const,
        preview: "/templates/leafish-preview.png",
        available: true,
        recommended: ["Sustainability", "Bio", "Wellness"],
    },
    {
        id: "lapras",
        name: "Lapras",
        description: "Header avec effet vague, style aquatique cyan",
        category: "modern" as const,
        preview: "/templates/lapras-preview.png",
        available: true,
        recommended: ["Tech", "SaaS", "Innovation"],
    },
    {
        id: "ditgar",
        name: "Ditgar",
        description: "Sidebar sombre mystérieuse, accents violets",
        category: "professional" as const,
        preview: "/templates/ditgar-preview.png",
        available: true,
        recommended: ["Security", "DevOps", "Backend"],
    },
];
