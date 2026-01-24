# Plan : Corrections CV Manquements V2

**Date** : 24 janvier 2026  
**Version cible** : 6.4.4  
**Basé sur** : Audit screen CV généré v6.4.3

---

## Problèmes Identifiés

1. **"Expérience clé" sans contexte** (CRITIQUE) - Cause trouvée dans `ai-adapter.ts`
2. **Réalisations tronquées** (HAUTE) - Format compact limite à 110 caractères
3. **Mots coupés** (MOYENNE) - CSS `list-inside` réduit l'espace
4. **Photo absente** (CRITIQUE) - Nécessite analyse logs

---

## Corrections à Implémenter

### Correction 1 : Filtrer "Expérience clé" sans contexte

**Fichier** : `lib/cv/ai-adapter.ts`

**Ligne** : 156-182 (fonction `buildExperiences`)

**Action** : Filtrer les expériences où `poste === "Expérience clé"` ET où les données essentielles manquent

```typescript
// Après ligne 182, avant return
const filteredExperiences = experiences.filter((exp) => {
    // Si c'est "Expérience clé" sans entreprise ni dates, masquer
    if (exp.poste === "Expérience clé" && (!exp.entreprise || exp.entreprise === "—" || !exp.date_debut)) {
        return false;
    }
    // Sinon, garder
    return true;
});

return filteredExperiences;
```

---

### Correction 2 : Augmenter limite format compact

**Fichier** : `lib/cv/adaptive-algorithm.ts`

**Ligne** : 115

**Action** : Augmenter de 110 à 250 caractères

```typescript
if (format === "compact") {
    const first = bullets[0];
    const compactLine = typeof first === "string" ? sliceText(first, 250) : ""; // 110 → 250
    // ...
}
```

---

### Correction 3 : Changer CSS list-inside → list-outside

**Fichier** : `components/cv/templates/ModernTemplate.tsx`

**Ligne** : 369

**Action** : Changer `list-inside` en `list-outside` et ajuster padding

```typescript
<ul className="text-slate-700 space-y-0.5 list-disc list-outside pl-5 text-[8pt] leading-relaxed">
```

---

### Correction 4 : Améliorer fallback photo

**Fichier** : `app/api/cv/generate/route.ts`

**Action** : Implémenter le fallback vers API photo si photoRef est absent

---

## Ordre d'Implémentation

1. Correction 1 : "Expérience clé" (CRITIQUE)
2. Correction 2 : Format compact (HAUTE)
3. Correction 3 : CSS list (MOYENNE)
4. Correction 4 : Photo fallback (CRITIQUE mais nécessite logs)

---

## Tests de Validation

Après corrections :
- ✅ Plus de "Expérience clé" sans contexte
- ✅ Réalisations complètes (pas de troncature à 110 caractères)
- ✅ Mots non coupés (list-outside)
- ✅ Photo visible (si présente dans RAG)
