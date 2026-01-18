/**
 * CV CRUSH DESIGN TOKENS
 *
 * Single source of truth pour TOUTES les valeurs de design.
 * ⚠️ NE JAMAIS utiliser de valeurs hardcodées dans les composants.
 * ⚠️ Toujours référencer ces tokens.
 */

export const DESIGN_TOKENS = {
  /**
   * COULEURS
   */
  colors: {
    // Palette néon (identité de marque)
    neon: {
      pink: '#ff4eb3',
      purple: '#a855f7',
      indigo: '#6366f1',
    },

    // Couleurs sémantiques
    semantic: {
      success: '#22c55e', // Vert néon
      warning: '#f59e0b', // Ambre néon
      error: '#ef4444', // Rouge néon
      info: '#0ea5e9', // Cyan néon
    },

    // Surfaces (light mode)
    surface: {
      primary: '#ffffff',
      secondary: '#f8fafc', // slate-50
      tertiary: '#f1f5f9', // slate-100
      elevated: '#ffffff',
    },

    // Textes (light mode)
    text: {
      primary: '#0f172a', // slate-900
      secondary: '#475569', // slate-600
      tertiary: '#94a3b8', // slate-400
      inverse: '#ffffff',
      disabled: '#cbd5e1', // slate-300
    },

    // Bordures
    border: {
      light: '#e2e8f0', // slate-200
      medium: '#cbd5e1', // slate-300
      dark: '#94a3b8', // slate-400
      focus: '#a855f7', // neon-purple
    },

    // Dark mode (optionnel pour l'instant)
    dark: {
      surface: {
        primary: '#0f172a', // slate-900
        secondary: '#1e293b', // slate-800
        tertiary: '#334155', // slate-700
      },
      text: {
        primary: '#f8fafc', // slate-50
        secondary: '#cbd5e1', // slate-300
        tertiary: '#94a3b8', // slate-400
      },
    },
  },

  /**
   * OMBRES (5 niveaux progressifs)
   */
  shadows: {
    none: 'none',
    // Niveau 1: Inputs, petits éléments, tags
    level1: '0 1px 2px 0 rgba(168, 85, 247, 0.05)',
    // Niveau 2: Cards par défaut, boutons secondaires
    level2: '0 4px 6px -1px rgba(168, 85, 247, 0.08), 0 2px 4px -1px rgba(168, 85, 247, 0.04)',
    // Niveau 3: Cards au hover, boutons primaires, dropdowns
    level3: '0 10px 15px -3px rgba(168, 85, 247, 0.12), 0 4px 6px -2px rgba(168, 85, 247, 0.06)',
    // Niveau 4: Modals, CTA importants, floating elements
    level4: '0 20px 25px -5px rgba(168, 85, 247, 0.15), 0 10px 10px -5px rgba(168, 85, 247, 0.08)',
    // Niveau 5: Popovers, tooltips, maximum elevation
    level5: '0 25px 50px -12px rgba(168, 85, 247, 0.25), 0 12px 18px -6px rgba(168, 85, 247, 0.12)',
  },

  /**
   * ESPACEMENTS (système cohérent)
   */
  spacing: {
    // Entre sections majeures
    section: '80px',
    // Padding conteneur principal
    container: '24px',
    // Padding cards
    card: '16px',
    // Entre éléments liés
    element: '8px',
    // Entre label et input
    tight: '4px',
    // Gouttières grid
    gutter: '16px',
  },

  /**
   * BORDER RADIUS
   */
  radius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  /**
   * TYPOGRAPHIE
   */
  typography: {
    // Familles de polices
    fontFamily: {
      display: "'Cal Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      heading: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "'Fira Code', 'Monaco', 'Courier New', monospace",
    },

    // Tailles de police
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px',
      '7xl': '72px',
    },

    // Poids
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    // Hauteurs de ligne
    lineHeight: {
      tight: 1.1,
      snug: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },

    // Espacement des lettres
    letterSpacing: {
      tighter: '-0.04em',
      tight: '-0.02em',
      normal: '-0.01em',
      wide: '0.02em',
      wider: '0.05em',
    },
  },

  /**
   * ANIMATIONS
   */
  animations: {
    // Durées
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '800ms',
      verySlow: '1000ms',
    },

    // Fonctions d'easing
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  /**
   * Z-INDEX (éviter les guerres de z-index)
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    toast: 1700,
  },

  /**
   * BREAKPOINTS (responsive)
   */
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /**
   * CONTENEURS (max-width)
   */
  container: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
  },

  /**
   * BLUR (backdrop-filter)
   */
  blur: {
    none: '0',
    sm: '4px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  },

  /**
   * OPACITY (transparence)
   */
  opacity: {
    0: '0',
    5: '0.05',
    10: '0.1',
    20: '0.2',
    30: '0.3',
    40: '0.4',
    50: '0.5',
    60: '0.6',
    70: '0.7',
    80: '0.8',
    90: '0.9',
    100: '1',
  },
} as const;

/**
 * TYPE HELPERS
 */
export type DesignTokens = typeof DESIGN_TOKENS;
export type ColorNeon = keyof typeof DESIGN_TOKENS.colors.neon;
export type ColorSemantic = keyof typeof DESIGN_TOKENS.colors.semantic;
export type ShadowLevel = keyof typeof DESIGN_TOKENS.shadows;
export type SpacingKey = keyof typeof DESIGN_TOKENS.spacing;
export type RadiusSize = keyof typeof DESIGN_TOKENS.radius;
export type FontSize = keyof typeof DESIGN_TOKENS.typography.fontSize;
export type FontWeight = keyof typeof DESIGN_TOKENS.typography.fontWeight;

/**
 * UTILITY FUNCTIONS
 */

/**
 * Obtenir une valeur de token de manière type-safe
 */
export function getToken<K extends keyof DesignTokens>(
  category: K,
  key: string
): string {
  const value = (DESIGN_TOKENS[category] as any)[key];
  if (!value) {
    console.warn(`Token not found: ${category}.${key}`);
    return '';
  }
  return value;
}

/**
 * Générer un gradient néon
 */
export function getNeonGradient(
  direction: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-tr' = 'to-r'
): string {
  const { pink, purple, indigo } = DESIGN_TOKENS.colors.neon;
  const deg = {
    'to-r': '90deg',
    'to-l': '270deg',
    'to-t': '0deg',
    'to-b': '180deg',
    'to-br': '135deg',
    'to-tr': '45deg',
  }[direction];

  return `linear-gradient(${deg}, ${pink} 0%, ${purple} 50%, ${indigo} 100%)`;
}

/**
 * Générer une ombre avec couleur custom
 */
export function getColoredShadow(
  level: ShadowLevel,
  color: string = DESIGN_TOKENS.colors.neon.purple
): string {
  const shadowValue = DESIGN_TOKENS.shadows[level];
  if (level === 'none') return 'none';

  // Remplacer la couleur dans la définition de l'ombre
  return shadowValue.replace(/rgba\(168, 85, 247/g, `rgba(${hexToRgb(color)}`);
}

/**
 * Convertir hex en rgb
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '168, 85, 247'; // Fallback to purple
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * EXPORTS NOMMÉS (pour imports directs)
 */
export const colors = DESIGN_TOKENS.colors;
export const shadows = DESIGN_TOKENS.shadows;
export const spacing = DESIGN_TOKENS.spacing;
export const radius = DESIGN_TOKENS.radius;
export const typography = DESIGN_TOKENS.typography;
export const animations = DESIGN_TOKENS.animations;
export const zIndex = DESIGN_TOKENS.zIndex;
export const breakpoints = DESIGN_TOKENS.breakpoints;
