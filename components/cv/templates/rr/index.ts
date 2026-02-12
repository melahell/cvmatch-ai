/**
 * Templates Reactive Resume - Index
 *
 * 13 templates distincts, chacun avec un layout unique.
 * Adaptés depuis Reactive Resume (MIT License)
 */

export { default as PikachuTemplate } from "./PikachuTemplate";
export { default as BronzorTemplate } from "./BronzorTemplate";
export { default as ChikoritaTemplate } from "./ChikoritaTemplate";
export { default as DittoTemplate } from "./DittoTemplate";
export { default as GengarTemplate } from "./GengarTemplate";
export { default as LaprasTemplate } from "./LaprasTemplate";
export { default as AzurillTemplate } from "./AzurillTemplate";
export { default as GlalieTemplate } from "./GlalieTemplate";
export { default as KakunaTemplate } from "./KakunaTemplate";
export { default as LeafishTemplate } from "./LeafishTemplate";
export { default as NosepassTemplate } from "./NosepassTemplate";
export { default as OnyxTemplate } from "./OnyxTemplate";
export { default as RhyhornTemplate } from "./RhyhornTemplate";

/**
 * Informations sur les templates Reactive Resume
 */
export const RR_TEMPLATE_INFO = [
    {
        id: "pikachu",
        name: "Pikachu",
        description: "Header gradient avec timeline dots, single-column dynamique",
        category: "modern" as const,
        preview: "/templates/pikachu-preview.png",
        available: true,
        recommended: ["Marketing", "Startup", "Digital"],
    },
    {
        id: "bronzor",
        name: "Bronzor",
        description: "Single-column minimaliste, typographie élégante, sans sidebar",
        category: "minimal" as const,
        preview: "/templates/bronzor-preview.png",
        available: true,
        recommended: ["Juridique", "Académique", "Direction"],
    },
    {
        id: "gengar",
        name: "Gengar",
        description: "Sidebar gauche avec header intégré dans la couleur, fond sombre",
        category: "professional" as const,
        preview: "/templates/gengar-preview.png",
        available: true,
        recommended: ["Tech", "Data", "Product"],
    },
    {
        id: "chikorita",
        name: "Chikorita",
        description: "Sidebar DROITE avec fond coloré solide et texte blanc",
        category: "modern" as const,
        preview: "/templates/chikorita-preview.png",
        available: true,
        recommended: ["UX/UI", "Growth", "Consulting"],
    },
    {
        id: "ditto",
        name: "Ditto",
        description: "Bannière header pleine largeur, body single-column ATS-friendly",
        category: "professional" as const,
        preview: "/templates/ditto-preview.png",
        available: true,
        recommended: ["Engineering", "Généraliste", "Corporate"],
    },
    {
        id: "lapras",
        name: "Lapras",
        description: "Header gradient avec effet vague, deux colonnes aquatiques",
        category: "modern" as const,
        preview: "/templates/lapras-preview.png",
        available: true,
        recommended: ["Tech", "SaaS", "Innovation"],
    },
    { id: "azurill", name: "Azurill Compact", description: "Header compact avec barre colorée", category: "modern" as const, preview: "/templates/pikachu-preview.png", available: true, recommended: ["Généraliste", "Admin"] },
    { id: "glalie", name: "Glalie Pro", description: "Header sombre pleine largeur", category: "professional" as const, preview: "/templates/pikachu-preview.png", available: true, recommended: ["Tech", "Data"] },
    { id: "kakuna", name: "Kakuna Sobre", description: "Une colonne sobre, ligne d'accent", category: "minimal" as const, preview: "/templates/pikachu-preview.png", available: true, recommended: ["Finance", "Juridique"] },
    { id: "leafish", name: "Leafish Nature", description: "Header dégradé doux", category: "creative" as const, preview: "/templates/pikachu-preview.png", available: true, recommended: ["Environnement", "Associatif"] },
    { id: "nosepass", name: "Nosepass Épuré", description: "Barre latérale fine, style épuré", category: "minimal" as const, preview: "/templates/pikachu-preview.png", available: true, recommended: ["Recherche", "Académique"] },
    { id: "onyx", name: "Onyx Sidebar", description: "Sidebar gauche sombre, pro", category: "professional" as const, preview: "/templates/pikachu-preview.png", available: true, recommended: ["Consulting", "Management"] },
    { id: "rhyhorn", name: "Rhyhorn Robuste", description: "Une colonne robuste, titres soulignés", category: "classic" as const, preview: "/templates/pikachu-preview.png", available: true, recommended: ["Engineering", "Corporate"] },
];
