export type CVThemeId = "modern" | "tech" | "classic" | "creative" | "compact_ats";

export type CVZoneName =
    | "header"
    | "summary"
    | "experiences"
    | "skills"
    | "formation"
    | "projects"
    | "certifications"
    | "languages"
    | "interests"
    | "footer"
    | "margins"
    | "clients";

export interface ZoneConfig {
    name: CVZoneName;
    capacity_units: number;
    min_units: number;
    flex: boolean;
    flex_priority: number;
    overflow_strategy: "hide" | "compact" | "split_page";
}

export interface CVThemeConfig {
    id: CVThemeId;
    name: string;
    description: string;
    page_config: {
        total_height_units: number;
        supports_two_pages: boolean;
        two_pages_threshold: number;
    };
    zones: Record<CVZoneName, ZoneConfig>;
    adaptive_rules: {
        min_detailed_experiences: number;
        prefer_detailed_for_recent: boolean;
        compact_after_years: number;
        skills_display_mode: "auto" | "full" | "compact";
        max_bullet_points_per_exp: number;
    };
    visual_config: {
        unit_to_mm: number;
        font_sizes?: Record<string, number>;
        colors?: Record<string, string>;
        spacing_multiplier: number;
    };
}

const BASE_PAGE = {
    total_height_units: 200,
    supports_two_pages: false,
    two_pages_threshold: 210,
};

export const CV_THEMES: Record<CVThemeId, CVThemeConfig> = {
    classic: {
        id: "classic",
        name: "Classic Professional",
        description: "Template sobre et professionnel, marges standards",
        page_config: BASE_PAGE,
        zones: {
            header: { name: "header", capacity_units: 12, min_units: 8, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            summary: { name: "summary", capacity_units: 10, min_units: 5, flex: true, flex_priority: 5, overflow_strategy: "compact" },
            experiences: { name: "experiences", capacity_units: 100, min_units: 50, flex: true, flex_priority: 10, overflow_strategy: "compact" },
            skills: { name: "skills", capacity_units: 28, min_units: 15, flex: true, flex_priority: 7, overflow_strategy: "compact" },
            formation: { name: "formation", capacity_units: 24, min_units: 12, flex: true, flex_priority: 6, overflow_strategy: "compact" },
            projects: { name: "projects", capacity_units: 0, min_units: 0, flex: true, flex_priority: 4, overflow_strategy: "hide" },
            certifications: { name: "certifications", capacity_units: 12, min_units: 0, flex: true, flex_priority: 3, overflow_strategy: "compact" },
            languages: { name: "languages", capacity_units: 6, min_units: 0, flex: true, flex_priority: 2, overflow_strategy: "compact" },
            interests: { name: "interests", capacity_units: 0, min_units: 0, flex: true, flex_priority: 1, overflow_strategy: "hide" },
            footer: { name: "footer", capacity_units: 5, min_units: 0, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            margins: { name: "margins", capacity_units: 15, min_units: 15, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            clients: { name: "clients", capacity_units: 0, min_units: 0, flex: true, flex_priority: 1, overflow_strategy: "hide" },
        },
        adaptive_rules: {
            min_detailed_experiences: 2,
            prefer_detailed_for_recent: true,
            compact_after_years: 8,
            skills_display_mode: "auto",
            max_bullet_points_per_exp: 4,
        },
        visual_config: { unit_to_mm: 4, spacing_multiplier: 1 },
    },
    modern: {
        id: "modern",
        name: "Modern & Spacious",
        description: "Design moderne avec grandes marges et header avec photo",
        page_config: BASE_PAGE,
        zones: {
            header: { name: "header", capacity_units: 20, min_units: 12, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            summary: { name: "summary", capacity_units: 15, min_units: 8, flex: true, flex_priority: 5, overflow_strategy: "compact" },
            experiences: { name: "experiences", capacity_units: 75, min_units: 45, flex: true, flex_priority: 10, overflow_strategy: "compact" },
            skills: { name: "skills", capacity_units: 25, min_units: 15, flex: true, flex_priority: 7, overflow_strategy: "compact" },
            formation: { name: "formation", capacity_units: 20, min_units: 10, flex: true, flex_priority: 6, overflow_strategy: "compact" },
            projects: { name: "projects", capacity_units: 0, min_units: 0, flex: true, flex_priority: 4, overflow_strategy: "hide" },
            certifications: { name: "certifications", capacity_units: 10, min_units: 0, flex: true, flex_priority: 3, overflow_strategy: "compact" },
            languages: { name: "languages", capacity_units: 8, min_units: 0, flex: true, flex_priority: 2, overflow_strategy: "compact" },
            interests: { name: "interests", capacity_units: 0, min_units: 0, flex: true, flex_priority: 1, overflow_strategy: "hide" },
            footer: { name: "footer", capacity_units: 0, min_units: 0, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            margins: { name: "margins", capacity_units: 30, min_units: 30, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            clients: { name: "clients", capacity_units: 8, min_units: 0, flex: true, flex_priority: 4, overflow_strategy: "hide" },
        },
        adaptive_rules: {
            min_detailed_experiences: 1,
            prefer_detailed_for_recent: true,
            compact_after_years: 6,
            skills_display_mode: "auto",
            max_bullet_points_per_exp: 4,
        },
        visual_config: { unit_to_mm: 4, spacing_multiplier: 1.05 },
    },
    tech: {
        id: "tech",
        name: "Tech Compact",
        description: "Optimisé profils techniques, focus compétences et ATS",
        page_config: BASE_PAGE,
        zones: {
            header: { name: "header", capacity_units: 16, min_units: 8, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            summary: { name: "summary", capacity_units: 8, min_units: 0, flex: true, flex_priority: 2, overflow_strategy: "hide" },
            experiences: { name: "experiences", capacity_units: 90, min_units: 45, flex: true, flex_priority: 10, overflow_strategy: "compact" },
            skills: { name: "skills", capacity_units: 60, min_units: 25, flex: true, flex_priority: 9, overflow_strategy: "compact" },
            formation: { name: "formation", capacity_units: 14, min_units: 6, flex: true, flex_priority: 5, overflow_strategy: "compact" },
            projects: { name: "projects", capacity_units: 0, min_units: 0, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            certifications: { name: "certifications", capacity_units: 12, min_units: 0, flex: true, flex_priority: 6, overflow_strategy: "compact" },
            languages: { name: "languages", capacity_units: 8, min_units: 0, flex: true, flex_priority: 3, overflow_strategy: "hide" },
            interests: { name: "interests", capacity_units: 0, min_units: 0, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            footer: { name: "footer", capacity_units: 0, min_units: 0, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            margins: { name: "margins", capacity_units: 12, min_units: 12, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            clients: { name: "clients", capacity_units: 0, min_units: 0, flex: true, flex_priority: 1, overflow_strategy: "hide" },
        },
        adaptive_rules: {
            min_detailed_experiences: 1,
            prefer_detailed_for_recent: true,
            compact_after_years: 6,
            skills_display_mode: "full",
            max_bullet_points_per_exp: 3,
        },
        visual_config: { unit_to_mm: 4, spacing_multiplier: 1.1 },
    },
    creative: {
        id: "creative",
        name: "Creative",
        description: "Design moderne et coloré pour profils créatifs",
        page_config: BASE_PAGE,
        zones: {
            header: { name: "header", capacity_units: 20, min_units: 12, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            summary: { name: "summary", capacity_units: 8, min_units: 0, flex: true, flex_priority: 3, overflow_strategy: "compact" },
            experiences: { name: "experiences", capacity_units: 95, min_units: 50, flex: true, flex_priority: 10, overflow_strategy: "compact" },
            skills: { name: "skills", capacity_units: 34, min_units: 16, flex: true, flex_priority: 8, overflow_strategy: "compact" },
            formation: { name: "formation", capacity_units: 16, min_units: 8, flex: true, flex_priority: 5, overflow_strategy: "compact" },
            projects: { name: "projects", capacity_units: 0, min_units: 0, flex: true, flex_priority: 4, overflow_strategy: "hide" },
            certifications: { name: "certifications", capacity_units: 10, min_units: 0, flex: true, flex_priority: 2, overflow_strategy: "compact" },
            languages: { name: "languages", capacity_units: 10, min_units: 0, flex: true, flex_priority: 4, overflow_strategy: "compact" },
            interests: { name: "interests", capacity_units: 0, min_units: 0, flex: true, flex_priority: 1, overflow_strategy: "hide" },
            footer: { name: "footer", capacity_units: 0, min_units: 0, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            margins: { name: "margins", capacity_units: 20, min_units: 20, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            clients: { name: "clients", capacity_units: 0, min_units: 0, flex: true, flex_priority: 1, overflow_strategy: "hide" },
        },
        adaptive_rules: {
            min_detailed_experiences: 1,
            prefer_detailed_for_recent: true,
            compact_after_years: 6,
            skills_display_mode: "auto",
            max_bullet_points_per_exp: 3,
        },
        visual_config: { unit_to_mm: 4, spacing_multiplier: 1.1 },
    },
    compact_ats: {
        id: "compact_ats",
        name: "Compact ATS-Optimized",
        description: "Maximum d'information, optimisé pour parsing ATS, toujours 1 page",
        page_config: {
            ...BASE_PAGE,
            supports_two_pages: false,
            two_pages_threshold: 999,  // Never go to 2 pages
        },
        zones: {
            header: { name: "header", capacity_units: 8, min_units: 8, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            summary: { name: "summary", capacity_units: 7, min_units: 5, flex: true, flex_priority: 4, overflow_strategy: "compact" },
            experiences: { name: "experiences", capacity_units: 110, min_units: 70, flex: true, flex_priority: 10, overflow_strategy: "compact" },
            skills: { name: "skills", capacity_units: 30, min_units: 20, flex: true, flex_priority: 9, overflow_strategy: "compact" },
            formation: { name: "formation", capacity_units: 18, min_units: 9, flex: true, flex_priority: 5, overflow_strategy: "compact" },
            projects: { name: "projects", capacity_units: 0, min_units: 0, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            certifications: { name: "certifications", capacity_units: 12, min_units: 0, flex: true, flex_priority: 6, overflow_strategy: "compact" },
            languages: { name: "languages", capacity_units: 4, min_units: 0, flex: true, flex_priority: 3, overflow_strategy: "hide" },
            interests: { name: "interests", capacity_units: 0, min_units: 0, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            footer: { name: "footer", capacity_units: 0, min_units: 0, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            margins: { name: "margins", capacity_units: 12, min_units: 12, flex: false, flex_priority: 1, overflow_strategy: "hide" },
            clients: { name: "clients", capacity_units: 0, min_units: 0, flex: true, flex_priority: 1, overflow_strategy: "hide" },
        },
        adaptive_rules: {
            min_detailed_experiences: 3,  // More detailed experiences for ATS
            prefer_detailed_for_recent: true,
            compact_after_years: 12,
            skills_display_mode: "full",  // Always full skills list for ATS
            max_bullet_points_per_exp: 4,
        },
        visual_config: {
            unit_to_mm: 3.8,  // Slightly more compact
            font_sizes: {
                name: 20,
                title: 12,
                section_header: 11,
                body: 9,
                small: 8
            },
            colors: {
                primary: "#000000",
                secondary: "#333333",
                accent: "#666666"
            },
            spacing_multiplier: 0.8  // Less spacing for compact layout
        },
    },
};

export function getThemeConfig(templateName: string): CVThemeConfig {
    const id = (templateName || "modern").toLowerCase() as CVThemeId;
    return CV_THEMES[id] || CV_THEMES.modern;
}
