import type { Config } from "tailwindcss";
import { DESIGN_TOKENS } from "./lib/design-tokens";

const config: Config = {
    darkMode: ["class"],
    content: [
          "./pages/**/*.{js,ts,jsx,tsx,mdx}",
          "./components/**/*.{js,ts,jsx,tsx,mdx}",
          "./app/**/*.{js,ts,jsx,tsx,mdx}",
        ],
    theme: {
    	extend: {
    		colors: {
    			// Design System Tokens (CV Crush)
    			neon: {
    				pink: "hsl(var(--cv-neon-pink))",
    				purple: "hsl(var(--cv-neon-purple))",
    				indigo: "hsl(var(--cv-neon-indigo))",
    			},
    			semantic: {
    				success: "hsl(var(--cv-success))",
    				warning: "hsl(var(--cv-warning))",
    				error: "hsl(var(--cv-danger))",
    				info: "hsl(var(--cv-accent))",
    			},
    			surface: {
    				primary: "hsl(var(--cv-surface-primary))",
    				secondary: "hsl(var(--cv-surface-secondary))",
    				tertiary: "hsl(var(--cv-surface-tertiary))",
    			},
    			cvText: { // Préfixe pour éviter conflit avec "text" Tailwind
    				primary: "hsl(var(--cv-text-primary))",
    				secondary: "hsl(var(--cv-text-secondary))",
    				tertiary: "hsl(var(--cv-text-tertiary))",
    				inverse: "hsl(var(--cv-text-inverse))",
    			},
    			cvBorder: { // Préfixe pour éviter conflit
    				light: "hsl(var(--cv-border-light))",
    				medium: "hsl(var(--cv-border-medium))",
    				dark: "hsl(var(--cv-border-dark))",
    				focus: "hsl(var(--cv-border-focus))",
    			},

    			// Shadcn/ui tokens (compatibilité existante)
    			primary: {
    				'50': '#eff6ff',
    				'500': '#3b82f6',
    				'600': '#2563eb',
    				'700': '#1d4ed8',
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},

    		// Ombres avec design tokens
    		boxShadow: {
    			'level-1': DESIGN_TOKENS.shadows.level1,
    			'level-2': DESIGN_TOKENS.shadows.level2,
    			'level-3': DESIGN_TOKENS.shadows.level3,
    			'level-4': DESIGN_TOKENS.shadows.level4,
    			'level-5': DESIGN_TOKENS.shadows.level5,
    		},

    		// Border radius avec design tokens
    		borderRadius: {
    			'none': DESIGN_TOKENS.radius.none,
    			'sm': DESIGN_TOKENS.radius.sm,
    			'md': DESIGN_TOKENS.radius.md,
    			'lg': DESIGN_TOKENS.radius.lg,
    			'xl': DESIGN_TOKENS.radius.xl,
    			'2xl': DESIGN_TOKENS.radius['2xl'],
    			'full': DESIGN_TOKENS.radius.full,
    			// Shadcn compatibility
    			DEFAULT: 'var(--radius)',
    		},

    		// Blur avec design tokens
    		backdropBlur: {
    			'sm': DESIGN_TOKENS.blur.sm,
    			'md': DESIGN_TOKENS.blur.md,
    			'lg': DESIGN_TOKENS.blur.lg,
    			'xl': DESIGN_TOKENS.blur.xl,
    			'2xl': DESIGN_TOKENS.blur['2xl'],
    			'3xl': DESIGN_TOKENS.blur['3xl'],
    		},

    		// Font family avec design tokens
    		fontFamily: {
    			sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
    			serif: ["var(--font-serif)", "ui-serif", "Georgia"],
    			display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "system-ui"],
    			heading: DESIGN_TOKENS.typography.fontFamily.heading.split(','),
    			body: DESIGN_TOKENS.typography.fontFamily.body.split(','),
    			mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
    		},

    		// Z-index avec design tokens
    		zIndex: {
    			dropdown: DESIGN_TOKENS.zIndex.dropdown.toString(),
    			sticky: DESIGN_TOKENS.zIndex.sticky.toString(),
    			fixed: DESIGN_TOKENS.zIndex.fixed.toString(),
    			'modal-backdrop': DESIGN_TOKENS.zIndex.modalBackdrop.toString(),
    			modal: DESIGN_TOKENS.zIndex.modal.toString(),
    			popover: DESIGN_TOKENS.zIndex.popover.toString(),
    			tooltip: DESIGN_TOKENS.zIndex.tooltip.toString(),
    			toast: DESIGN_TOKENS.zIndex.toast.toString(),
    		},

    		// Breakpoints custom
    		screens: {
    			'xs': DESIGN_TOKENS.breakpoints.xs,
    			'sm': DESIGN_TOKENS.breakpoints.sm,
    			'md': DESIGN_TOKENS.breakpoints.md,
    			'lg': DESIGN_TOKENS.breakpoints.lg,
    			'xl': DESIGN_TOKENS.breakpoints.xl,
    			'2xl': DESIGN_TOKENS.breakpoints['2xl'],
    		},
    		spacing: {
    			'safe': 'env(safe-area-inset-bottom)',
    			'safe-top': 'env(safe-area-inset-top)',
    			'safe-left': 'env(safe-area-inset-left)',
    			'safe-right': 'env(safe-area-inset-right)'
    		},
    		padding: {
    			'safe': 'env(safe-area-inset-bottom)',
    			'safe-top': 'env(safe-area-inset-top)',
    			'safe-left': 'env(safe-area-inset-left)',
    			'safe-right': 'env(safe-area-inset-right)'
    		},
    		keyframes: {
    			shimmer: {
    				'0%': { transform: 'translateX(-100%)' },
    				'100%': { transform: 'translateX(100%)' }
    			}
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
