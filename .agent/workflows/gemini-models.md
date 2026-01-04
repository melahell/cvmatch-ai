---
description: Configuration des modèles Gemini AI pour CVMatch
---

# Modèles Gemini - NE PAS CHANGER

## Modèles à utiliser (Gemini 3 - GA Dec 2025)

```
gemini-3-pro-preview    → Principal (meilleure qualité)
gemini-3-flash-preview  → Fallback (si pro rate-limited)
```

## ⛔ MODÈLES INTERDITS

- ~~gemini-1.5-*~~ → OBSOLÈTES, ne fonctionnent plus
- ~~gemini-2.0-*~~ → N'existent pas dans ce projet
- ~~gemini-2.5-*~~ → N'existent pas dans ce projet

## Fichier de configuration

`lib/ai/gemini.ts` contient :

```typescript
const MODEL_CASCADE = [
    "gemini-3-pro-preview",      // Best quality
    "gemini-3-flash-preview",    // Fallback if pro rate-limited
];

export const models = {
    flash: genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }),
    pro: genAI.getGenerativeModel({ model: "gemini-3-pro-preview" }),
    vision: genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }),
};
```

## Gestion des quotas

Le système de cascade fait automatiquement :
1. Essaie `gemini-3-pro-preview`
2. Si erreur 429 (quota) → passe à `gemini-3-flash-preview`
