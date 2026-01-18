# SETUP STORYBOOK POUR CV CRUSH

**Note:** Le setup automatique a échoué (problème réseau). Configuration manuelle requise.

## Installation

```bash
npm install --save-dev @storybook/nextjs@latest @storybook/addon-links@latest @storybook/addon-essentials@latest @storybook/addon-interactions@latest @storybook/addon-a11y@latest
```

## Configuration

### 1. Créer `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../components/**/*.stories.@(js|jsx|ts|tsx)',
    '../app/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../'),
      };
    }
    return config;
  },
};

export default config;
```

### 2. Créer `.storybook/preview.ts`

```typescript
import type { Preview } from '@storybook/react';
import '../app/globals.css'; // Import des styles Tailwind + tokens

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
        { name: 'neon', value: '#1e1b4b' },
      ],
    },
  },
};

export default preview;
```

### 3. Créer une story d'exemple: `components/ui/button.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Loader2, Plus, Download } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'Style variant du bouton',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Taille du bouton',
    },
    loading: {
      control: 'boolean',
      description: 'Affiche un spinner de chargement',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Prend toute la largeur disponible',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Bouton Principal',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Bouton Secondaire',
    variant: 'secondary',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Bouton Ghost',
    variant: 'ghost',
    size: 'md',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Supprimer',
    variant: 'destructive',
    size: 'md',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus className="w-4 h-4 mr-2" />
        Créer
      </>
    ),
    variant: 'primary',
    size: 'md',
  },
};

export const Loading: Story = {
  args: {
    children: 'Chargement...',
    variant: 'primary',
    size: 'md',
    loading: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Bouton pleine largeur',
    variant: 'primary',
    size: 'md',
    fullWidth: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};
```

## Scripts package.json

Les scripts ont déjà été ajoutés par le setup automatique:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## Utilisation

1. **Lancer Storybook en développement:**
```bash
npm run storybook
```
Ouvre `http://localhost:6006`

2. **Build Storybook pour production:**
```bash
npm run build-storybook
```
Génère dans `storybook-static/`

## Créer une nouvelle story

```typescript
// components/ui/card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    children: <div>Contenu de la card</div>,
  },
};

export const Glass: Story = {
  args: {
    variant: 'glass',
    padding: 'lg',
    hover: 'glow',
    children: <div>Card glassmorphism</div>,
  },
};
```

## Accessibilité

L'addon `@storybook/addon-a11y` est inclus. Il affiche automatiquement les problèmes d'accessibilité dans l'onglet "Accessibility" de Storybook.

## Intégration CI/CD

### 1. Visual Regression Tests avec Chromatic (optionnel)

```bash
npm install --save-dev chromatic
npx chromatic --project-token=<token>
```

### 2. Build Storybook dans CI

```yaml
# .github/workflows/storybook.yml
name: Build Storybook
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build-storybook
```

## État actuel

- ✅ Scripts ajoutés au package.json
- ⚠️ Dépendances Storybook non installées (problème réseau)
- ⚠️ Configuration `.storybook/` à créer manuellement
- ⚠️ Stories d'exemple à créer

## Prochaines étapes

1. Installer les dépendances Storybook manuellement
2. Créer les fichiers de configuration
3. Créer des stories pour tous les composants UI
4. Optionnel: Setup Chromatic pour visual regression tests

---

**Note:** Storybook est optionnel pour le reste de la refactorisation. Le design system fonctionne sans lui, mais il facilite grandement la documentation et les tests visuels.
