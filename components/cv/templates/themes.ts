// CV Template Theme System - Color variants for templates

export interface TemplateTheme {
    id: string;
    name: string;
    colors: {
        primary: string;       // Main accent color
        secondary: string;     // Secondary accent
        accent: string;        // Highlight color
        sidebar: string;       // Sidebar background
        sidebarText: string;   // Sidebar text color
        sidebarAccent: string; // Sidebar accent
        text: string;          // Main text color
        textMuted: string;     // Muted text
        background: string;    // Main background
        border: string;        // Border color
    };
}

// Pre-defined color themes for Modern template
export const MODERN_THEMES: TemplateTheme[] = [
    {
        id: 'modern-indigo',
        name: 'Indigo Pro',
        colors: {
            primary: '#6366f1',      // Indigo 500
            secondary: '#8b5cf6',    // Violet 500
            accent: '#a78bfa',       // Violet 400
            sidebar: '#0f172a',      // Slate 900
            sidebarText: '#f8fafc',  // Slate 50
            sidebarAccent: '#818cf8', // Indigo 400
            text: '#1e293b',         // Slate 800
            textMuted: '#64748b',    // Slate 500
            background: '#ffffff',
            border: '#e2e8f0'        // Slate 200
        }
    },
    {
        id: 'modern-emerald',
        name: 'Emerald Fresh',
        colors: {
            primary: '#10b981',      // Emerald 500
            secondary: '#06b6d4',    // Cyan 500
            accent: '#34d399',       // Emerald 400
            sidebar: '#022c22',      // Emerald 950
            sidebarText: '#f0fdf4',  // Emerald 50
            sidebarAccent: '#6ee7b7', // Emerald 300
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#d1fae5'        // Emerald 100
        }
    },
    {
        id: 'modern-rose',
        name: 'Rose Élégance',
        colors: {
            primary: '#f43f5e',      // Rose 500
            secondary: '#ec4899',    // Pink 500
            accent: '#fb7185',       // Rose 400
            sidebar: '#4c0519',      // Rose 950
            sidebarText: '#fff1f2',  // Rose 50
            sidebarAccent: '#fda4af', // Rose 300
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#fecdd3'        // Rose 200
        }
    },
    {
        id: 'modern-amber',
        name: 'Amber Gold',
        colors: {
            primary: '#f59e0b',      // Amber 500
            secondary: '#f97316',    // Orange 500
            accent: '#fbbf24',       // Amber 400
            sidebar: '#451a03',      // Amber 950
            sidebarText: '#fffbeb',  // Amber 50
            sidebarAccent: '#fcd34d', // Amber 300
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#fde68a'        // Amber 200
        }
    },
    {
        id: 'modern-slate',
        name: 'Slate Minimal',
        colors: {
            primary: '#475569',      // Slate 600
            secondary: '#64748b',    // Slate 500
            accent: '#94a3b8',       // Slate 400
            sidebar: '#0f172a',      // Slate 900
            sidebarText: '#f8fafc',
            sidebarAccent: '#cbd5e1', // Slate 300
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#e2e8f0'
        }
    },
    {
        id: 'modern-sky',
        name: 'Sky Blue',
        colors: {
            primary: '#0ea5e9',      // Sky 500
            secondary: '#06b6d4',    // Cyan 500
            accent: '#38bdf8',       // Sky 400
            sidebar: '#0c4a6e',      // Sky 900
            sidebarText: '#f0f9ff',  // Sky 50
            sidebarAccent: '#7dd3fc', // Sky 300
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#bae6fd'        // Sky 200
        }
    }
];

// Tech template themes
export const TECH_THEMES: TemplateTheme[] = [
    {
        id: 'tech-emerald',
        name: 'Matrix Green',
        colors: {
            primary: '#10b981',
            secondary: '#06b6d4',
            accent: '#8b5cf6',
            sidebar: '#0f172a',
            sidebarText: '#f8fafc',
            sidebarAccent: '#34d399',
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#e2e8f0'
        }
    },
    {
        id: 'tech-cyan',
        name: 'Neon Cyan',
        colors: {
            primary: '#06b6d4',
            secondary: '#0ea5e9',
            accent: '#8b5cf6',
            sidebar: '#164e63',
            sidebarText: '#ecfeff',
            sidebarAccent: '#22d3ee',
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#cffafe'
        }
    },
    {
        id: 'tech-violet',
        name: 'Cyberpunk Purple',
        colors: {
            primary: '#8b5cf6',
            secondary: '#a855f7',
            accent: '#c084fc',
            sidebar: '#2e1065',
            sidebarText: '#faf5ff',
            sidebarAccent: '#c4b5fd',
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#ede9fe'
        }
    }
];

// Classic template themes
export const CLASSIC_THEMES: TemplateTheme[] = [
    {
        id: 'classic-slate',
        name: 'Executive Gray',
        colors: {
            primary: '#334155',
            secondary: '#475569',
            accent: '#64748b',
            sidebar: '#1e293b',
            sidebarText: '#f8fafc',
            sidebarAccent: '#94a3b8',
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#e2e8f0'
        }
    },
    {
        id: 'classic-navy',
        name: 'Navy Blue',
        colors: {
            primary: '#1e3a5f',
            secondary: '#2563eb',
            accent: '#3b82f6',
            sidebar: '#0f172a',
            sidebarText: '#f8fafc',
            sidebarAccent: '#60a5fa',
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#dbeafe'
        }
    },
    {
        id: 'classic-burgundy',
        name: 'Burgundy',
        colors: {
            primary: '#7f1d1d',
            secondary: '#991b1b',
            accent: '#b91c1c',
            sidebar: '#450a0a',
            sidebarText: '#fef2f2',
            sidebarAccent: '#fca5a5',
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#fecaca'
        }
    }
];

// Creative template themes
export const CREATIVE_THEMES: TemplateTheme[] = [
    {
        id: 'creative-sunset',
        name: 'Sunset Gradient',
        colors: {
            primary: '#f97316',
            secondary: '#ec4899',
            accent: '#8b5cf6',
            sidebar: '#fafafa',
            sidebarText: '#1e293b',
            sidebarAccent: '#f97316',
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#fef3c7'
        }
    },
    {
        id: 'creative-ocean',
        name: 'Ocean Wave',
        colors: {
            primary: '#06b6d4',
            secondary: '#3b82f6',
            accent: '#8b5cf6',
            sidebar: '#fafafa',
            sidebarText: '#1e293b',
            sidebarAccent: '#06b6d4',
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#cffafe'
        }
    },
    {
        id: 'creative-forest',
        name: 'Forest Green',
        colors: {
            primary: '#22c55e',
            secondary: '#10b981',
            accent: '#14b8a6',
            sidebar: '#fafafa',
            sidebarText: '#1e293b',
            sidebarAccent: '#22c55e',
            text: '#1e293b',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#bbf7d0'
        }
    }
];

// Get all themes for a template type
export function getThemesForTemplate(templateId: string): TemplateTheme[] {
    switch (templateId) {
        case 'modern': return MODERN_THEMES;
        case 'tech': return TECH_THEMES;
        case 'classic': return CLASSIC_THEMES;
        case 'creative': return CREATIVE_THEMES;
        default: return MODERN_THEMES;
    }
}

// Get a specific theme by ID
export function getThemeById(themeId: string): TemplateTheme | undefined {
    const allThemes = [...MODERN_THEMES, ...TECH_THEMES, ...CLASSIC_THEMES, ...CREATIVE_THEMES];
    return allThemes.find(t => t.id === themeId);
}

// Get default theme for a template
export function getDefaultTheme(templateId: string): TemplateTheme {
    const themes = getThemesForTemplate(templateId);
    return themes[0];
}
