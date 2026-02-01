/**
 * Templates Reactive Resume - Index
 * 
 * [CDC Sprint 4.2] Templates adaptés depuis Reactive Resume (MIT License)
 */

export { default as OnyxTemplate } from "./OnyxTemplate";
export { default as PikachuTemplate } from "./PikachuTemplate";
export { default as BronzorTemplate } from "./BronzorTemplate";

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
];
