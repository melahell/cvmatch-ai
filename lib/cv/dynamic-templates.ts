/**
 * Dynamic Templates - Système de templates CV dynamiques
 *
 * [AMÉLIORATION P3-11] : Génération automatique de templates CV
 * adaptés au secteur, niveau de séniorité et type de poste
 *
 * Features:
 * - Templates pré-définis par secteur
 * - Génération dynamique basée sur le profil
 * - Layouts adaptatifs
 * - Règles de composition conditionnelles
 * - Thèmes personnalisables
 */

import type { AIWidget } from "./ai-widgets";
import { detectSector, type SectorId } from "./sector-customization";
import { logger } from "@/lib/utils/logger";

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateSection {
    id: string;
    name: string;
    type: "header" | "summary" | "experience" | "education" | "skills" | "languages" | "certifications" | "projects" | "references" | "custom";
    order: number;
    visible: boolean;
    layout: "full" | "half-left" | "half-right" | "third" | "two-thirds";
    style: SectionStyle;
    maxItems?: number;
    conditions?: SectionCondition[];
}

export interface SectionStyle {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    fontSize?: "small" | "medium" | "large";
    iconStyle?: "none" | "minimal" | "filled";
    bulletStyle?: "disc" | "circle" | "square" | "dash" | "none";
    spacing?: "compact" | "normal" | "relaxed";
}

export interface SectionCondition {
    type: "has_content" | "min_items" | "sector" | "seniority" | "custom";
    value?: any;
    action: "show" | "hide" | "move" | "merge";
}

export interface TemplateTheme {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        muted: string;
    };
    fonts: {
        heading: string;
        body: string;
        accent?: string;
    };
    spacing: {
        page: number;
        section: number;
        item: number;
    };
}

export interface CVTemplate {
    id: string;
    name: string;
    description: string;
    targetSectors: SectorId[];
    targetSeniority: ("junior" | "confirmed" | "senior" | "expert")[];
    sections: TemplateSection[];
    theme: TemplateTheme;
    metadata: {
        author: string;
        version: string;
        createdAt: string;
        tags: string[];
    };
}

export interface TemplateGenerationContext {
    sector: SectorId;
    seniority: "junior" | "confirmed" | "senior" | "expert";
    yearsExperience: number;
    hasPhoto: boolean;
    experienceCount: number;
    educationCount: number;
    skillCount: number;
    hasReferences: boolean;
    hasCertifications: boolean;
    language: string;
}

export interface GeneratedTemplate extends CVTemplate {
    generatedFor: TemplateGenerationContext;
    adaptations: string[];
}

// ============================================================================
// PREDEFINED THEMES
// ============================================================================

export const THEMES: Record<string, TemplateTheme> = {
    corporate: {
        id: "corporate",
        name: "Corporate",
        colors: {
            primary: "#1a365d",
            secondary: "#2d4a7c",
            accent: "#3182ce",
            background: "#ffffff",
            text: "#1a202c",
            muted: "#718096",
        },
        fonts: {
            heading: "Arial, sans-serif",
            body: "Arial, sans-serif",
        },
        spacing: {
            page: 20,
            section: 16,
            item: 8,
        },
    },
    modern: {
        id: "modern",
        name: "Modern",
        colors: {
            primary: "#7c3aed",
            secondary: "#a78bfa",
            accent: "#ec4899",
            background: "#fafafa",
            text: "#1f2937",
            muted: "#6b7280",
        },
        fonts: {
            heading: "Inter, sans-serif",
            body: "Inter, sans-serif",
        },
        spacing: {
            page: 24,
            section: 20,
            item: 12,
        },
    },
    classic: {
        id: "classic",
        name: "Classic",
        colors: {
            primary: "#1f2937",
            secondary: "#374151",
            accent: "#059669",
            background: "#ffffff",
            text: "#111827",
            muted: "#4b5563",
        },
        fonts: {
            heading: "Georgia, serif",
            body: "Times New Roman, serif",
        },
        spacing: {
            page: 18,
            section: 14,
            item: 6,
        },
    },
    tech: {
        id: "tech",
        name: "Tech",
        colors: {
            primary: "#0f172a",
            secondary: "#1e293b",
            accent: "#06b6d4",
            background: "#f8fafc",
            text: "#0f172a",
            muted: "#64748b",
        },
        fonts: {
            heading: "JetBrains Mono, monospace",
            body: "Inter, sans-serif",
            accent: "JetBrains Mono, monospace",
        },
        spacing: {
            page: 20,
            section: 16,
            item: 10,
        },
    },
    creative: {
        id: "creative",
        name: "Creative",
        colors: {
            primary: "#dc2626",
            secondary: "#f87171",
            accent: "#fbbf24",
            background: "#fffbeb",
            text: "#292524",
            muted: "#78716c",
        },
        fonts: {
            heading: "Playfair Display, serif",
            body: "Lato, sans-serif",
        },
        spacing: {
            page: 24,
            section: 18,
            item: 10,
        },
    },
    minimal: {
        id: "minimal",
        name: "Minimal",
        colors: {
            primary: "#18181b",
            secondary: "#27272a",
            accent: "#18181b",
            background: "#ffffff",
            text: "#18181b",
            muted: "#71717a",
        },
        fonts: {
            heading: "Helvetica Neue, sans-serif",
            body: "Helvetica Neue, sans-serif",
        },
        spacing: {
            page: 32,
            section: 24,
            item: 12,
        },
    },
};

// ============================================================================
// SECTOR-SPECIFIC TEMPLATES
// ============================================================================

/**
 * Sections de base communes à tous les templates
 */
const BASE_SECTIONS: TemplateSection[] = [
    {
        id: "header",
        name: "En-tête",
        type: "header",
        order: 0,
        visible: true,
        layout: "full",
        style: { spacing: "normal" },
    },
    {
        id: "summary",
        name: "Résumé",
        type: "summary",
        order: 1,
        visible: true,
        layout: "full",
        style: { fontSize: "medium", spacing: "normal" },
        conditions: [{ type: "has_content", action: "show" }],
    },
    {
        id: "experience",
        name: "Expérience Professionnelle",
        type: "experience",
        order: 2,
        visible: true,
        layout: "full",
        style: { bulletStyle: "disc", spacing: "normal" },
        maxItems: 5,
    },
    {
        id: "education",
        name: "Formation",
        type: "education",
        order: 3,
        visible: true,
        layout: "full",
        style: { spacing: "compact" },
    },
    {
        id: "skills",
        name: "Compétences",
        type: "skills",
        order: 4,
        visible: true,
        layout: "half-left",
        style: { spacing: "compact" },
    },
    {
        id: "languages",
        name: "Langues",
        type: "languages",
        order: 5,
        visible: true,
        layout: "half-right",
        style: { spacing: "compact" },
    },
];

/**
 * Configurations sectorielles
 */
const SECTOR_TEMPLATE_CONFIGS: Record<SectorId, Partial<CVTemplate>> = {
    finance: {
        name: "Finance Professional",
        description: "Template optimisé pour les métiers de la finance",
        theme: THEMES.corporate,
        sections: [
            ...BASE_SECTIONS,
            {
                id: "certifications",
                name: "Certifications",
                type: "certifications",
                order: 6,
                visible: true,
                layout: "full",
                style: { spacing: "compact", iconStyle: "minimal" },
            },
            {
                id: "references",
                name: "Références",
                type: "references",
                order: 7,
                visible: true,
                layout: "full",
                style: { spacing: "compact" },
                conditions: [{ type: "seniority", value: ["senior", "expert"], action: "show" }],
            },
        ],
    },
    tech: {
        name: "Tech Expert",
        description: "Template moderne pour les profils tech",
        theme: THEMES.tech,
        sections: [
            ...BASE_SECTIONS.map(s => ({
                ...s,
                style: { ...s.style, bulletStyle: "dash" as const },
            })),
            {
                id: "projects",
                name: "Projets",
                type: "projects",
                order: 4,
                visible: true,
                layout: "full",
                style: { spacing: "normal", bulletStyle: "none" },
            },
            {
                id: "certifications",
                name: "Certifications Techniques",
                type: "certifications",
                order: 7,
                visible: true,
                layout: "half-left",
                style: { spacing: "compact" },
            },
        ],
    },
    pharma: {
        name: "Life Sciences",
        description: "Template pour l'industrie pharmaceutique et santé",
        theme: THEMES.classic,
        sections: [
            ...BASE_SECTIONS,
            {
                id: "certifications",
                name: "Certifications & Formations Réglementaires",
                type: "certifications",
                order: 3,
                visible: true,
                layout: "full",
                style: { spacing: "normal" },
            },
            {
                id: "publications",
                name: "Publications",
                type: "custom",
                order: 8,
                visible: true,
                layout: "full",
                style: { spacing: "compact" },
                conditions: [{ type: "has_content", action: "show" }],
            },
        ],
    },
    conseil: {
        name: "Consultant",
        description: "Template pour les métiers du conseil",
        theme: THEMES.modern,
        sections: [
            ...BASE_SECTIONS,
            {
                id: "references",
                name: "Références Clients",
                type: "references",
                order: 6,
                visible: true,
                layout: "full",
                style: { spacing: "normal", iconStyle: "filled" },
            },
        ],
    },
    industrie: {
        name: "Industry Professional",
        description: "Template pour l'industrie manufacturière",
        theme: THEMES.corporate,
        sections: [
            ...BASE_SECTIONS,
            {
                id: "certifications",
                name: "Certifications & Habilitations",
                type: "certifications",
                order: 5,
                visible: true,
                layout: "full",
                style: { spacing: "compact" },
            },
        ],
    },
    retail: {
        name: "Retail & Commerce",
        description: "Template pour le retail et commerce",
        theme: THEMES.creative,
        sections: BASE_SECTIONS,
    },
    rh: {
        name: "Human Resources",
        description: "Template pour les ressources humaines",
        theme: THEMES.modern,
        sections: [
            ...BASE_SECTIONS,
            {
                id: "certifications",
                name: "Certifications RH",
                type: "certifications",
                order: 6,
                visible: true,
                layout: "half-left",
                style: { spacing: "compact" },
            },
        ],
    },
    marketing: {
        name: "Marketing & Communication",
        description: "Template créatif pour le marketing",
        theme: THEMES.creative,
        sections: [
            ...BASE_SECTIONS,
            {
                id: "portfolio",
                name: "Portfolio",
                type: "custom",
                order: 4,
                visible: true,
                layout: "full",
                style: { spacing: "normal" },
                conditions: [{ type: "has_content", action: "show" }],
            },
        ],
    },
    public: {
        name: "Secteur Public",
        description: "Template pour le secteur public",
        theme: THEMES.classic,
        sections: [
            ...BASE_SECTIONS,
            {
                id: "formations_continues",
                name: "Formations Continues",
                type: "custom",
                order: 6,
                visible: true,
                layout: "full",
                style: { spacing: "compact" },
            },
        ],
    },
    other: {
        name: "Polyvalent",
        description: "Template polyvalent standard",
        theme: THEMES.minimal,
        sections: BASE_SECTIONS,
    },
};

// ============================================================================
// TEMPLATE GENERATION
// ============================================================================

/**
 * Génère un template dynamique basé sur le contexte
 */
export function generateDynamicTemplate(context: TemplateGenerationContext): GeneratedTemplate {
    logger.info("[dynamic-templates] Génération template", { context });

    const adaptations: string[] = [];

    // Récupérer la config sectorielle
    const sectorConfig = SECTOR_TEMPLATE_CONFIGS[context.sector];
    let sections = [...(sectorConfig.sections || BASE_SECTIONS)];
    let theme = { ...sectorConfig.theme } || THEMES.corporate;

    // ========================================================================
    // ADAPTATIONS BASÉES SUR LA SÉNIORITÉ
    // ========================================================================

    if (context.seniority === "junior") {
        // Juniors: mettre l'éducation en avant
        const educationIdx = sections.findIndex(s => s.type === "education");
        const experienceIdx = sections.findIndex(s => s.type === "experience");

        if (educationIdx > experienceIdx && experienceIdx >= 0) {
            // Inverser l'ordre
            const temp = sections[educationIdx].order;
            sections[educationIdx].order = sections[experienceIdx].order;
            sections[experienceIdx].order = temp;
            adaptations.push("Formation placée avant l'expérience (profil junior)");
        }

        // Réduire le nombre max d'expériences
        const expSection = sections.find(s => s.type === "experience");
        if (expSection) {
            expSection.maxItems = 3;
            adaptations.push("Maximum 3 expériences (profil junior)");
        }

        // Masquer les références pour les juniors
        const refSection = sections.find(s => s.type === "references");
        if (refSection) {
            refSection.visible = false;
            adaptations.push("Références masquées (profil junior)");
        }
    }

    if (context.seniority === "senior" || context.seniority === "expert") {
        // Seniors: résumé obligatoire, plus d'expériences
        const summarySection = sections.find(s => s.type === "summary");
        if (summarySection) {
            summarySection.visible = true;
            summarySection.style.fontSize = "large";
            adaptations.push("Résumé mis en avant (profil senior/expert)");
        }

        // Plus d'expériences mais moins de détails par expérience
        const expSection = sections.find(s => s.type === "experience");
        if (expSection) {
            expSection.maxItems = context.seniority === "expert" ? 4 : 5;
            expSection.style.spacing = "compact";
            adaptations.push("Expériences condensées (profil senior/expert)");
        }

        // Afficher les références
        const refSection = sections.find(s => s.type === "references");
        if (refSection) {
            refSection.visible = true;
            adaptations.push("Références affichées (profil senior/expert)");
        }
    }

    // ========================================================================
    // ADAPTATIONS BASÉES SUR LE CONTENU
    // ========================================================================

    // Photo
    if (!context.hasPhoto) {
        // Ajuster le header pour centrer sans photo
        const headerSection = sections.find(s => s.type === "header");
        if (headerSection) {
            headerSection.style = { ...headerSection.style, textColor: theme.colors.primary };
            adaptations.push("Header centré (pas de photo)");
        }
    }

    // Peu d'expériences
    if (context.experienceCount <= 2) {
        const expSection = sections.find(s => s.type === "experience");
        if (expSection) {
            expSection.style.spacing = "relaxed";
            adaptations.push("Espacement augmenté (peu d'expériences)");
        }
    }

    // Beaucoup de compétences
    if (context.skillCount > 15) {
        const skillSection = sections.find(s => s.type === "skills");
        if (skillSection) {
            skillSection.layout = "full";
            skillSection.style.spacing = "compact";
            adaptations.push("Compétences en pleine largeur (nombreuses)");
        }
    }

    // Certifications présentes
    if (context.hasCertifications) {
        const certSection = sections.find(s => s.type === "certifications");
        if (certSection) {
            certSection.visible = true;
        } else {
            sections.push({
                id: "certifications",
                name: "Certifications",
                type: "certifications",
                order: sections.length,
                visible: true,
                layout: "half-right",
                style: { spacing: "compact" },
            });
            adaptations.push("Section certifications ajoutée");
        }
    }

    // ========================================================================
    // ADAPTATIONS LINGUISTIQUES
    // ========================================================================

    if (context.language !== "fr") {
        // Traduire les noms de sections
        const translations: Record<string, Record<string, string>> = {
            en: {
                "Résumé": "Summary",
                "Expérience Professionnelle": "Work Experience",
                "Formation": "Education",
                "Compétences": "Skills",
                "Langues": "Languages",
                "Certifications": "Certifications",
                "Références": "References",
            },
            de: {
                "Résumé": "Zusammenfassung",
                "Expérience Professionnelle": "Berufserfahrung",
                "Formation": "Ausbildung",
                "Compétences": "Fähigkeiten",
                "Langues": "Sprachen",
            },
        };

        const langTranslations = translations[context.language];
        if (langTranslations) {
            sections = sections.map(s => ({
                ...s,
                name: langTranslations[s.name] || s.name,
            }));
            adaptations.push(`Noms de sections traduits (${context.language})`);
        }
    }

    // ========================================================================
    // FINALISATION
    // ========================================================================

    // Trier les sections par ordre
    sections.sort((a, b) => a.order - b.order);

    // Filtrer les sections invisibles
    const visibleSections = sections.filter(s => s.visible);

    const template: GeneratedTemplate = {
        id: `dynamic_${context.sector}_${context.seniority}_${Date.now()}`,
        name: `${sectorConfig.name} - ${context.seniority}`,
        description: `Template généré dynamiquement pour ${context.sector} / ${context.seniority}`,
        targetSectors: [context.sector],
        targetSeniority: [context.seniority],
        sections: visibleSections,
        theme,
        metadata: {
            author: "CVMatch AI",
            version: "2.0.0",
            createdAt: new Date().toISOString(),
            tags: [context.sector, context.seniority, "dynamic"],
        },
        generatedFor: context,
        adaptations,
    };

    logger.info("[dynamic-templates] Template généré", {
        templateId: template.id,
        sectionCount: visibleSections.length,
        adaptationCount: adaptations.length,
    });

    return template;
}

// ============================================================================
// TEMPLATE SELECTION
// ============================================================================

/**
 * Sélectionne le meilleur template pré-défini pour un contexte
 */
export function selectBestTemplate(
    availableTemplates: CVTemplate[],
    context: TemplateGenerationContext
): CVTemplate | null {
    if (availableTemplates.length === 0) return null;

    let bestTemplate: CVTemplate | null = null;
    let bestScore = -1;

    for (const template of availableTemplates) {
        let score = 0;

        // Score secteur
        if (template.targetSectors.includes(context.sector)) {
            score += 50;
        }

        // Score séniorité
        if (template.targetSeniority.includes(context.seniority)) {
            score += 30;
        }

        // Bonus pour le nombre de sections adaptées
        const relevantSections = template.sections.filter(s => {
            if (s.type === "references" && !context.hasReferences) return false;
            if (s.type === "certifications" && !context.hasCertifications) return false;
            return true;
        });
        score += relevantSections.length * 2;

        if (score > bestScore) {
            bestScore = score;
            bestTemplate = template;
        }
    }

    return bestTemplate;
}

// ============================================================================
// TEMPLATE TO CSS
// ============================================================================

/**
 * Génère le CSS pour un template
 */
export function generateTemplateCSS(template: CVTemplate): string {
    const { theme, sections } = template;

    let css = `
/* CVMatch AI - Dynamic Template CSS */
/* Template: ${template.name} */
/* Generated: ${new Date().toISOString()} */

:root {
    --cv-primary: ${theme.colors.primary};
    --cv-secondary: ${theme.colors.secondary};
    --cv-accent: ${theme.colors.accent};
    --cv-background: ${theme.colors.background};
    --cv-text: ${theme.colors.text};
    --cv-muted: ${theme.colors.muted};

    --cv-font-heading: ${theme.fonts.heading};
    --cv-font-body: ${theme.fonts.body};

    --cv-spacing-page: ${theme.spacing.page}px;
    --cv-spacing-section: ${theme.spacing.section}px;
    --cv-spacing-item: ${theme.spacing.item}px;
}

.cv-container {
    font-family: var(--cv-font-body);
    color: var(--cv-text);
    background-color: var(--cv-background);
    padding: var(--cv-spacing-page);
    max-width: 210mm;
    margin: 0 auto;
}

.cv-section {
    margin-bottom: var(--cv-spacing-section);
}

.cv-section-title {
    font-family: var(--cv-font-heading);
    color: var(--cv-primary);
    border-bottom: 2px solid var(--cv-accent);
    padding-bottom: 4px;
    margin-bottom: var(--cv-spacing-item);
}

.cv-item {
    margin-bottom: var(--cv-spacing-item);
}
`;

    // Générer les styles spécifiques par section
    for (const section of sections) {
        const sectionClass = `.cv-section-${section.id}`;

        css += `
${sectionClass} {
    ${section.style.backgroundColor ? `background-color: ${section.style.backgroundColor};` : ""}
    ${section.style.textColor ? `color: ${section.style.textColor};` : ""}
}

${sectionClass} .cv-section-title {
    ${section.style.fontSize === "small" ? "font-size: 14px;" : ""}
    ${section.style.fontSize === "large" ? "font-size: 20px;" : ""}
}
`;

        // Style de liste
        if (section.style.bulletStyle && section.style.bulletStyle !== "none") {
            const bulletMap: Record<string, string> = {
                disc: "disc",
                circle: "circle",
                square: "square",
                dash: "'- '",
            };
            css += `
${sectionClass} ul {
    list-style-type: ${bulletMap[section.style.bulletStyle]};
    padding-left: 20px;
}
`;
        }

        // Espacement
        if (section.style.spacing === "compact") {
            css += `
${sectionClass} .cv-item {
    margin-bottom: calc(var(--cv-spacing-item) / 2);
}
`;
        } else if (section.style.spacing === "relaxed") {
            css += `
${sectionClass} .cv-item {
    margin-bottom: calc(var(--cv-spacing-item) * 1.5);
}
`;
        }
    }

    // Layouts
    css += `
/* Layouts */
.cv-layout-full { width: 100%; }
.cv-layout-half-left { width: 48%; float: left; margin-right: 4%; }
.cv-layout-half-right { width: 48%; float: right; }
.cv-layout-third { width: 31%; float: left; margin-right: 2.33%; }
.cv-layout-two-thirds { width: 65%; float: left; margin-right: 2%; }

.cv-clearfix::after {
    content: "";
    display: table;
    clear: both;
}

/* Print styles */
@media print {
    .cv-container {
        padding: 0;
        max-width: none;
    }

    .cv-section {
        page-break-inside: avoid;
    }
}
`;

    return css;
}

// ============================================================================
// CONTEXT DETECTION
// ============================================================================

/**
 * Détecte le contexte de génération à partir des widgets et du profil
 */
export function detectGenerationContext(
    widgets: AIWidget[],
    ragProfile: any,
    jobDescription: string
): TemplateGenerationContext {
    // Détecter le secteur
    const sector = detectSector(jobDescription, ragProfile) as SectorId;

    // Compter les éléments
    const experienceWidgets = widgets.filter(w => w.section === "experiences");
    const educationWidgets = widgets.filter(w => w.section === "formations" || w.section === "education");
    const skillWidgets = widgets.filter(w => w.section === "skills" || w.section === "competences");
    const certWidgets = widgets.filter(w => w.section === "certifications");

    // Calculer l'expérience totale
    let totalYears = 0;
    const experiences = ragProfile?.experiences || [];
    for (const exp of experiences) {
        const start = exp.date_debut || exp.debut;
        const end = exp.date_fin || exp.fin || new Date().toISOString();
        if (start) {
            const years = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24 * 365);
            totalYears += Math.max(0, years);
        }
    }

    // Déterminer la séniorité
    let seniority: "junior" | "confirmed" | "senior" | "expert" = "confirmed";
    if (totalYears < 3) seniority = "junior";
    else if (totalYears < 8) seniority = "confirmed";
    else if (totalYears < 15) seniority = "senior";
    else seniority = "expert";

    return {
        sector,
        seniority,
        yearsExperience: Math.round(totalYears),
        hasPhoto: !!ragProfile?.profil?.photo_url,
        experienceCount: experienceWidgets.length || experiences.length,
        educationCount: educationWidgets.length || (ragProfile?.formations?.length || 0),
        skillCount: skillWidgets.length || (ragProfile?.competences?.techniques?.length || 0),
        hasReferences: !!(ragProfile?.clients_references?.clients?.length > 0),
        hasCertifications: certWidgets.length > 0 || (ragProfile?.certifications?.length || 0) > 0,
        language: ragProfile?.langue || "fr",
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { THEMES, SECTOR_TEMPLATE_CONFIGS, BASE_SECTIONS };
