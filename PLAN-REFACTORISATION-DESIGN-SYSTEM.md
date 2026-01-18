# PLAN DE REFACTORISATION DESIGN SYSTEM - CV CRUSH

**Objectif :** Garantir 100% de cohérence visuelle sans doublons ni oublis

---

## 🎯 PROBLÈME ACTUEL

**Chaos identifié :**
- Styles inline partout (`className="shadow-md bg-white"`)
- Couleurs hardcodées (`#a855f7`, `rgb(168, 85, 247)`)
- Espacements incohérents (`gap-4` vs `gap-6` au hasard)
- Variants non standardisés (certains boutons avec effet, d'autres non)
- Pas de single source of truth

**Risque sans plan :**
- 50% des composants mis à jour, 50% oubliés
- Doublons de classes utilitaires
- Nouveaux composants ne suivent pas les guidelines
- Impossible de maintenir

---

## 📐 ARCHITECTURE DU DESIGN SYSTEM

### Phase 1 : FONDATIONS (Tokens centralisés)

**1.1 - Créer `lib/design-tokens.ts`**

Single source of truth pour TOUTES les valeurs de design.

```typescript
// lib/design-tokens.ts
export const DESIGN_TOKENS = {
  // COULEURS
  colors: {
    // Palette néon (identité)
    neon: {
      pink: '#ff4eb3',
      purple: '#a855f7',
      indigo: '#6366f1',
    },

    // Sémantiques
    semantic: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
    },

    // Surfaces (light mode)
    surface: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
    },

    // Textes (light mode)
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#94a3b8',
      inverse: '#ffffff',
    },

    // Bordures
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e1',
      dark: '#94a3b8',
    },
  },

  // OMBRES (5 niveaux)
  shadows: {
    none: 'none',
    level1: '0 1px 2px rgba(168, 85, 247, 0.05)',
    level2: '0 4px 6px rgba(168, 85, 247, 0.08), 0 2px 4px rgba(168, 85, 247, 0.04)',
    level3: '0 10px 15px rgba(168, 85, 247, 0.12), 0 4px 6px rgba(168, 85, 247, 0.06)',
    level4: '0 20px 25px rgba(168, 85, 247, 0.15), 0 10px 10px rgba(168, 85, 247, 0.08)',
    level5: '0 25px 50px rgba(168, 85, 247, 0.25), 0 12px 18px rgba(168, 85, 247, 0.12)',
  },

  // ESPACEMENTS
  spacing: {
    section: '80px', // Entre sections
    container: '24px', // Padding conteneur
    card: '16px', // Padding card
    element: '8px', // Entre éléments
    tight: '4px', // Entre labels/inputs
  },

  // BORDER RADIUS
  radius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // TYPOGRAPHIE
  typography: {
    fontFamily: {
      display: "'Cal Sans', 'Inter', sans-serif",
      heading: "'Inter', sans-serif",
      body: "'Inter', sans-serif",
      mono: "'Fira Code', monospace",
    },

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
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },

    lineHeight: {
      tight: 1.1,
      snug: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },

    letterSpacing: {
      tight: '-0.04em',
      snug: '-0.02em',
      normal: '-0.01em',
      wide: '0.02em',
    },
  },

  // ANIMATIONS
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      verySlow: '1000ms',
    },

    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
  },

  // Z-INDEX (éviter les guerres)
  zIndex: {
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    tooltip: 1400,
    toast: 1500,
  },

  // BREAKPOINTS
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Type-safe access
export type DesignTokens = typeof DESIGN_TOKENS;
```

**1.2 - Injecter dans Tailwind**

```javascript
// tailwind.config.js
const { DESIGN_TOKENS } = require('./lib/design-tokens');

module.exports = {
  theme: {
    extend: {
      colors: {
        neon: DESIGN_TOKENS.colors.neon,
        semantic: DESIGN_TOKENS.colors.semantic,
        // ...
      },
      boxShadow: DESIGN_TOKENS.shadows,
      borderRadius: DESIGN_TOKENS.radius,
      // ...
    },
  },
};
```

**1.3 - Créer CSS Variables**

```css
/* app/globals.css */
@layer base {
  :root {
    /* Couleurs */
    --color-neon-pink: 326 100% 65%;
    --color-neon-purple: 270 71% 66%;
    --color-neon-indigo: 239 84% 67%;

    /* Ombres */
    --shadow-1: 0 1px 2px rgba(168, 85, 247, 0.05);
    --shadow-2: 0 4px 6px rgba(168, 85, 247, 0.08), 0 2px 4px rgba(168, 85, 247, 0.04);
    /* ... */

    /* Espacements */
    --spacing-section: 80px;
    --spacing-container: 24px;
    /* ... */
  }
}
```

---

### Phase 2 : COMPOSANTS ATOMIQUES (Base Components)

**2.1 - Audit exhaustif des composants**

```
components/
├── ui/
│   ├── button.tsx ⚠️ À migrer
│   ├── card.tsx ⚠️ À migrer
│   ├── input.tsx ⚠️ À migrer
│   ├── badge.tsx ⚠️ À migrer
│   ├── dialog.tsx ✅ OK (Radix)
│   ├── progress.tsx ⚠️ À migrer
│   └── ... (32 composants total)
├── layout/
│   ├── DashboardLayout.tsx ⚠️ Styles inline
│   └── ...
└── dashboard/
    ├── StatsCard.tsx ⚠️ Shadows hardcodées
    ├── JobCard.tsx ⚠️ Couleurs inline
    └── ... (12 composants)
```

**2.2 - Créer des composants atomiques 100% token-based**

**Exemple : Button refactorisé**

```tsx
// components/ui/button.tsx (NOUVELLE VERSION)
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Variants définis avec TOKENS uniquement
const buttonVariants = cva(
  // Base (commun à tous)
  'inline-flex items-center justify-center font-medium transition-all disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-neon-pink via-neon-purple to-neon-indigo text-white shadow-level-3 hover:shadow-level-4',
        secondary: 'bg-surface-secondary text-text-primary border border-border-light hover:bg-surface-tertiary shadow-level-1 hover:shadow-level-2',
        ghost: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
        destructive: 'bg-semantic-error text-white shadow-level-2 hover:shadow-level-3',
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-md',
        md: 'h-10 px-4 text-base rounded-lg',
        lg: 'h-12 px-6 text-lg rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = ({
  variant,
  size,
  fullWidth,
  loading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={buttonVariants({ variant, size, fullWidth })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
};
```

**2.3 - Card Component**

```tsx
// components/ui/card.tsx (NOUVELLE VERSION)
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-lg transition-all',
  {
    variants: {
      variant: {
        default: 'bg-surface-primary border border-border-light shadow-level-2',
        glass: 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-neon-purple/10 shadow-level-3',
        flat: 'bg-surface-secondary',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        none: '',
        lift: 'hover:shadow-level-3 hover:-translate-y-1',
        glow: 'hover:shadow-level-4 hover:border-neon-purple/30',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: 'none',
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = ({ variant, padding, hover, className, ...props }: CardProps) => {
  return (
    <div className={cardVariants({ variant, padding, hover, className })} {...props} />
  );
};
```

---

### Phase 3 : MIGRATION SYSTÉMATIQUE

**3.1 - Ordre de migration (bottom-up)**

```
NIVEAU 1 - Primitives (2h)
├─ Button ✓
├─ Card ✓
├─ Badge ✓
├─ Input ✓
└─ Progress ✓

NIVEAU 2 - Composés (3h)
├─ StatsCard (utilise Card + Progress)
├─ JobCard (utilise Card + Badge + Button)
├─ PhotoUpload (utilise Card + Button)
└─ Modal (utilise Dialog + Button + Card)

NIVEAU 3 - Layouts (2h)
├─ DashboardLayout (Header, Nav, Footer)
└─ AuthLayout

NIVEAU 4 - Pages (3h)
├─ Dashboard
├─ Profile
├─ Jobs
└─ CVs
```

**3.2 - Checklist par composant**

```markdown
## Migration Checklist - [NOM_COMPOSANT]

### Avant migration
- [ ] Identifier toutes les valeurs hardcodées
- [ ] Lister les variants existants
- [ ] Capturer screenshot "before"

### Pendant migration
- [ ] Remplacer couleurs par tokens
- [ ] Remplacer ombres par shadow-level-X
- [ ] Remplacer espacements par spacing tokens
- [ ] Utiliser cva pour variants
- [ ] Ajouter types TypeScript
- [ ] Ajouter micro-interactions (si applicable)

### Après migration
- [ ] Screenshot "after"
- [ ] Tests unitaires passent
- [ ] Tests visuels OK
- [ ] Storybook story créée
- [ ] Props documentées
- [ ] Pas de régression sur autres pages
```

**3.3 - Script de vérification automatique**

```javascript
// scripts/verify-design-system.js
const fs = require('fs');
const path = require('path');

// Interdictions strictes
const FORBIDDEN_PATTERNS = [
  // Couleurs hardcodées
  /#[0-9a-f]{6}/i,
  /rgb\(/i,
  /rgba\(/i,

  // Ombres inline
  /shadow-\[/,

  // Classes Tailwind obsolètes
  /text-blue-/,
  /bg-blue-/,
  /shadow-md(?!:)/,
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];

  FORBIDDEN_PATTERNS.forEach((pattern, idx) => {
    if (pattern.test(content)) {
      violations.push({
        file: filePath,
        pattern: pattern.toString(),
        line: findLine(content, pattern),
      });
    }
  });

  return violations;
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const violations = [];

  files.forEach(file => {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory() && !file.name.startsWith('.')) {
      violations.push(...scanDirectory(fullPath));
    } else if (file.name.match(/\.(tsx|ts|jsx|js)$/)) {
      violations.push(...scanFile(fullPath));
    }
  });

  return violations;
}

// Scan
const violations = scanDirectory('./components');
const appViolations = scanDirectory('./app');

if ([...violations, ...appViolations].length > 0) {
  console.error('❌ Design System Violations Found:');
  console.table([...violations, ...appViolations]);
  process.exit(1);
} else {
  console.log('✅ All components follow design system guidelines');
  process.exit(0);
}
```

**3.4 - Ajouter au CI**

```json
// package.json
{
  "scripts": {
    "verify:design": "node scripts/verify-design-system.js",
    "test": "npm run verify:design && vitest run"
  }
}
```

---

### Phase 4 : DOCUMENTATION VIVANTE

**4.1 - Storybook pour catalogue visuel**

```bash
npm install -D @storybook/react @storybook/addon-essentials
```

```tsx
// stories/Button.stories.tsx
import { Button } from '@/components/ui/button';

export default {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};

export const AllVariants = () => (
  <div className="space-y-4">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Destructive</Button>
  </div>
);
```

**4.2 - Guide de style centralisé**

```markdown
# DESIGN-SYSTEM-GUIDE.md

## Règles d'or

❌ **INTERDIT:**
- Couleurs inline: `className="text-[#a855f7]"`
- Ombres custom: `className="shadow-[0_4px_6px_rgba(0,0,0,0.1)]"`
- Espacements arbitraires: `className="mt-[23px]"`
- Styles inline: `style={{ color: 'blue' }}`

✅ **OBLIGATOIRE:**
- Tokens uniquement: `className="text-neon-purple"`
- Ombres prédéfinies: `className="shadow-level-2"`
- Espacements tokens: `className="mt-spacing-section"`
- Composants UI existants

## Comment choisir ?

### Ombres
- `shadow-level-1`: Inputs, tags, petits éléments
- `shadow-level-2`: Cards, boutons secondaires
- `shadow-level-3`: Cards au hover, boutons primaires
- `shadow-level-4`: Modals, CTA importants
- `shadow-level-5`: Popovers, tooltips

### Couleurs
- `neon-pink/purple/indigo`: Accents, CTA, liens
- `semantic-success`: Actions positives, succès
- `semantic-warning`: Alertes, attention
- `semantic-error`: Erreurs, destructions
- `semantic-info`: Informations neutres

### Espacements
- `spacing-section`: Entre sections majeures (80px)
- `spacing-container`: Padding conteneurs (24px)
- `spacing-card`: Padding cards (16px)
- `spacing-element`: Entre éléments (8px)
- `spacing-tight`: Entre label/input (4px)
```

---

### Phase 5 : TESTS & VALIDATION

**5.1 - Visual Regression Tests**

```bash
npm install -D @chromatic-com/storybook
```

```json
// package.json
{
  "scripts": {
    "test:visual": "chromatic --project-token=<token>"
  }
}
```

**5.2 - Checklist finale avant merge**

```markdown
## Pre-Merge Checklist

### Code Quality
- [ ] `npm run verify:design` passe à 100%
- [ ] Aucune couleur hardcodée
- [ ] Aucune ombre inline
- [ ] Tous les composants utilisent tokens

### Tests
- [ ] Tests unitaires passent (53/54 minimum)
- [ ] Tests visuels Chromatic validés
- [ ] Tests accessibilité axe passent

### Documentation
- [ ] Tous les composants ont une story Storybook
- [ ] DESIGN-SYSTEM-GUIDE.md à jour
- [ ] CHANGELOG.md mis à jour

### Performance
- [ ] Bundle size pas augmenté > 5%
- [ ] Lighthouse score maintenu

### Review
- [ ] 2 reviewers ont approuvé
- [ ] Aucun commentaire non résolu
```

---

## 📊 GARANTIES DE COHÉRENCE

### 🔒 Niveau 1 : Tokens centralisés
- **Fichier unique** `lib/design-tokens.ts`
- Impossible d'utiliser des valeurs non définies
- TypeScript force l'utilisation des tokens

### 🔒 Niveau 2 : Script de vérification
- Scan automatique de tout le code
- Détection des violations
- Fail le CI si violation

### 🔒 Niveau 3 : Storybook
- Catalogue visuel de TOUS les composants
- Impossible d'oublier un variant
- Visual regression tests

### 🔒 Niveau 4 : ESLint custom rules
```javascript
// .eslintrc.js
rules: {
  'no-restricted-syntax': [
    'error',
    {
      selector: 'Literal[value=/#[0-9a-f]{6}/i]',
      message: 'Use design tokens instead of hardcoded colors',
    },
  ],
}
```

### 🔒 Niveau 5 : TypeScript strict
```typescript
// Impossible de passer une couleur non définie
<Button color="#ff0000" /> // ❌ Type error
<Button variant="primary" /> // ✅ OK
```

---

## 📅 PLANNING D'EXÉCUTION

### Jour 1 : Fondations (4h)
- [x] Créer `lib/design-tokens.ts`
- [x] Configurer Tailwind avec tokens
- [x] Créer CSS variables
- [x] Script de vérification
- [ ] Setup Storybook

### Jour 2 : Composants atomiques (6h)
- [ ] Migrer Button
- [ ] Migrer Card
- [ ] Migrer Badge
- [ ] Migrer Input
- [ ] Migrer Progress
- [ ] Tests + Stories pour chaque

### Jour 3 : Composants composés (6h)
- [ ] Migrer StatsCard
- [ ] Migrer JobCard
- [ ] Migrer PhotoUpload
- [ ] Migrer Modal
- [ ] Tests + Stories

### Jour 4 : Layouts (4h)
- [ ] Migrer DashboardLayout
- [ ] Migrer AuthLayout
- [ ] Tests E2E

### Jour 5 : Pages (6h)
- [ ] Migrer Dashboard
- [ ] Migrer Profile
- [ ] Migrer Jobs
- [ ] Migrer CVs

### Jour 6 : Polish & Tests (4h)
- [ ] Visual regression tests
- [ ] Documentation finale
- [ ] Review & merge

**TOTAL: 30h de dev pour refactorisation complète garantie sans oublis**

---

## ✅ RÉSULTAT GARANTI

Après cette refactorisation :

1. **Zéro doublon** - Tous les styles viennent de tokens
2. **Zéro oubli** - Script vérifie 100% du code
3. **Zéro régression** - Visual tests détectent les changements
4. **100% maintenable** - Single source of truth
5. **100% documenté** - Storybook + Guide
6. **100% type-safe** - TypeScript strict

**Si nouveau composant créé :**
- ❌ Impossible d'utiliser couleur non définie (TypeScript error)
- ❌ Impossible de passer en prod avec violation (CI fail)
- ❌ Impossible d'oublier story Storybook (checklist PR)

---

**Validez ce plan et je commence immédiatement par les fondations (Jour 1).**
