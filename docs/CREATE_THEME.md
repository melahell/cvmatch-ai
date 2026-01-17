# Guide : Créer un Nouveau Thème CV

Ce guide explique comment ajouter un nouveau thème au système de génération de CV.

## Prérequis

Le système utilise des **Content Units** pour garantir que les CVs tiennent sur une page A4 :
- 1 page A4 = **200 units** maximum
- 1 unit ≈ **4mm**

## Étape 1 : Déclarer le thème dans theme-configs.ts

### 1.1 Ajouter l'ID au type

```typescript
// lib/cv/theme-configs.ts
export type CVThemeId = "modern" | "tech" | "classic" | "creative" | "compact_ats" | "votre_theme";
```

### 1.2 Ajouter la configuration

```typescript
export const CV_THEMES: Record<CVThemeId, CVThemeConfig> = {
    // ... autres thèmes
    
    votre_theme: {
        id: "votre_theme",
        name: "Nom Affiché",
        description: "Description du thème",
        
        page_config: {
            total_height_units: 200,      // Toujours 200 pour A4
            supports_two_pages: false,     // true si 2 pages autorisées
            two_pages_threshold: 210,      // Seuil pour passer à 2 pages
        },
        
        zones: {
            // Répartir 200 units entre les zones
            header:         { name: "header",         capacity_units: 12,  min_units: 8,  flex: false, flex_priority: 1,  overflow_strategy: "hide" },
            summary:        { name: "summary",        capacity_units: 10,  min_units: 5,  flex: true,  flex_priority: 5,  overflow_strategy: "compact" },
            experiences:    { name: "experiences",    capacity_units: 100, min_units: 50, flex: true,  flex_priority: 10, overflow_strategy: "compact" },
            skills:         { name: "skills",         capacity_units: 28,  min_units: 15, flex: true,  flex_priority: 7,  overflow_strategy: "compact" },
            formation:      { name: "formation",      capacity_units: 24,  min_units: 12, flex: true,  flex_priority: 6,  overflow_strategy: "compact" },
            projects:       { name: "projects",       capacity_units: 0,   min_units: 0,  flex: true,  flex_priority: 4,  overflow_strategy: "hide" },
            certifications: { name: "certifications", capacity_units: 12,  min_units: 0,  flex: true,  flex_priority: 3,  overflow_strategy: "compact" },
            languages:      { name: "languages",      capacity_units: 6,   min_units: 0,  flex: true,  flex_priority: 2,  overflow_strategy: "compact" },
            interests:      { name: "interests",      capacity_units: 0,   min_units: 0,  flex: true,  flex_priority: 1,  overflow_strategy: "hide" },
            footer:         { name: "footer",         capacity_units: 0,   min_units: 0,  flex: false, flex_priority: 1,  overflow_strategy: "hide" },
            margins:        { name: "margins",        capacity_units: 15,  min_units: 15, flex: false, flex_priority: 1,  overflow_strategy: "hide" },
            clients:        { name: "clients",        capacity_units: 0,   min_units: 0,  flex: true,  flex_priority: 1,  overflow_strategy: "hide" },
        },
        
        adaptive_rules: {
            min_detailed_experiences: 2,       // Minimum d'exp en format détaillé
            prefer_detailed_for_recent: true,  // Prioriser détail sur exp récentes
            compact_after_years: 8,            // Compacter après X années d'ancienneté
            skills_display_mode: "auto",       // "auto" | "full" | "compact"
            max_bullet_points_per_exp: 4,      // Max bullets par expérience
        },
        
        visual_config: {
            unit_to_mm: 4,                     // Ratio unit → mm
            spacing_multiplier: 1.0,           // Multiplicateur espacement
        },
    },
};
```

## Étape 2 : Créer le template React (optionnel)

Si votre thème a un design unique, créez un composant dans `components/cv/templates/`.

```tsx
// components/cv/templates/VotreThemeTemplate.tsx
"use client";

import React from "react";
import { TemplateProps } from "./index";

export default function VotreThemeTemplate({
    data,
    includePhoto = true,
    jobContext,
    dense = false
}: TemplateProps) {
    const { profil, experiences, competences, formations, langues } = data;

    return (
        <div
            className="cv-page bg-white"
            style={{
                width: '210mm',
                height: '297mm',
                overflow: 'hidden',
                // Votre design ici
            }}
        >
            {/* IMPORTANT: Ne pas slicer les données !
                Elles arrivent pré-adaptées par le CDC Pipeline */}
            
            {/* Header */}
            <header>
                <h1>{profil.prenom} {profil.nom}</h1>
                <p>{profil.titre_principal}</p>
            </header>
            
            {/* Experiences - afficher tel quel, déjà limité par l'algo */}
            {experiences?.map((exp, i) => (
                <div key={i}>
                    <h3>{exp.poste}</h3>
                    <p>{exp.entreprise}</p>
                    <ul>
                        {exp.realisations?.map((r, j) => (
                            <li key={j}>{typeof r === 'string' ? r : r.description}</li>
                        ))}
                    </ul>
                </div>
            ))}
            
            {/* Autres sections... */}
        </div>
    );
}
```

### 2.1 Enregistrer le template

```tsx
// components/cv/templates/index.ts
export { default as VotreThemeTemplate } from './VotreThemeTemplate';

// components/cv/CVRenderer.tsx
const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<TemplateProps>> = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
    // ...
    votre_theme: VotreThemeTemplate,  // Ajouter ici
};
```

## Étape 3 : Valider avec le script de calibration

```bash
npx tsx scripts/calibrate-units.ts
```

Vérifiez que votre thème passe les tests (< 200 units).

## Règle d'Or

> **Les templates ne font QUE du rendu.**  
> Tout le slicing et l'adaptation est géré par `adaptive-algorithm.ts`.

## Référence : Hauteurs des contenus

| Type | Units |
|------|-------|
| experience_detailed | 22 |
| experience_standard | 15 |
| experience_compact | 8 |
| experience_minimal | 4 |
| header_with_photo | 20 |
| header_with_contacts | 12 |
| header_minimal | 8 |
| formation_standard | 6 |
| skill_line | 2 |
| certification | 3 |
| language | 2 |

## Exemples de répartition

| Thème | Experiences | Skills | Formation | Margins |
|-------|-------------|--------|-----------|---------|
| classic | 100 | 28 | 24 | 15 |
| modern | 75 | 25 | 20 | 30 |
| compact_ats | 110 | 30 | 18 | 12 |
