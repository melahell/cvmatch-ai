# Phase 4 - Améliorations RAG

**Version** : 6.2.6+  
**Date** : Janvier 2026  
**Statut** : Plan stratégique  
**Priorité** : Haute

---

## Objectif

Améliorer la qualité du RAG (Retrieval Augmented Generation) pour éliminer les duplications, enrichir le contexte, et améliorer les match scores de 15-25%.

---

## Problèmes Identifiés

### 1. Duplication RAG Critique

**Symptôme** : 60+ réalisations dupliquées pour une seule expérience après régénération.

**Exemple concret** :
- "Pilotage centralisé du portefeuille projets et ressources de la DSI via Orchestra" (×8)
- "Mise en place d'audits Qualité et refonte des méthodologies" (×10)
- Technologies: "Planisware, Planisware e7, e7, Orchestra, PPM Orchestra" (8 variations)

**Root Causes** :
1. Prompt Gemini sans consolidation (demande "TOUTES" les informations)
2. Threshold déduplication trop strict (0.85 → laisse passer doublons)
3. Mode MERGE uniquement (pas de REPLACE)
4. Bug deduplicate.ts (perte structure réalisations)

### 2. Manque Enrichissement Contextuel

**Problème** : Le RAG capture uniquement l'explicite, rate l'implicite.

**Manque** :
- Responsabilités implicites (ex: PMO → reporting, gouvernance)
- Compétences tacites (ex: gestion équipe → leadership)
- Soft skills déduites (ex: coordination → communication)

**Impact** : Match scores sous-optimaux, opportunités manquées.

### 3. Fusion Trop Stricte

**Problème** : Ne reconnaît pas les variations de noms d'entreprises.

**Exemple** :
- "BNP Paribas" vs "BNP" vs "BNP Paribas SA"
- "Volkswagen" vs "VW" vs "Volkswagen Group"

**Impact** : Duplication d'expériences, RAG fragmenté.

---

## Plan d'Action

### Jour 1 : Fix Duplication RAG (4-6h)

#### 1.1 Améliorer Prompt Gemini

**Fichier** : `lib/ai/prompts.ts`

**Changements** :
- Remplacer "TOUTES les informations" par "informations ESSENTIELLES"
- Ajouter règle de consolidation explicite
- Limiter à 8-12 réalisations max par expérience
- Prioriser réalisations avec impacts quantifiés

**Code à modifier** :
```typescript
// Ligne ~10
// AVANT
MISSION CRITIQUE: Extrais et structure TOUTES les informations avec RIGUEUR MAXIMALE

// APRÈS
MISSION CRITIQUE: Extrais et structure les informations ESSENTIELLES avec RIGUEUR MAXIMALE

⚠️  RÈGLE DE CONSOLIDATION (NOUVELLE):
- Identifie les réalisations similaires ou redondantes
- FUSIONNE-LES intelligemment en gardant TOUS les impacts quantifiés
- LIMITE: Maximum 8-12 réalisations PAR expérience (garde les + impactantes)
- Priorise: Réalisations avec impacts quantifiés > non quantifiés
```

#### 1.2 Ajuster Threshold Déduplication

**Fichier** : `lib/rag/merge-simple.ts`

**Changements** :
- Réduire threshold de 0.85 à 0.75
- Améliorer calcul similarité (Jaccard + Levenshtein)
- Ajouter normalisation avant comparaison

**Code à modifier** :
```typescript
// Ligne ~48, ~187
// AVANT
areSimilar(r.description || '', real.description || '', 0.85)

// APRÈS
areSimilar(r.description || '', real.description || '', 0.75) // Plus permissif
```

#### 1.3 Implémenter Mode REPLACE

**Fichier** : `app/api/rag/generate/route.ts`

**Changements** :
- Ajouter paramètre `mode` : "CREATE" | "MERGE" | "REPLACE"
- Mode REPLACE : Écrase RAG existant au lieu de fusionner
- Interface utilisateur : Boutons distincts "Compléter" vs "Régénérer"

**Code à ajouter** :
```typescript
interface RAGGenerationRequest {
  // ... existing fields
  mode?: "CREATE" | "MERGE" | "REPLACE";
}

// Dans le handler
if (mode === "REPLACE") {
  // Écraser RAG existant
  await supabase
    .from("rag_metadata")
    .update({ completeness_details: newRAG })
    .eq("user_id", userId);
} else if (mode === "MERGE") {
  // Fusionner (logique existante)
  // ...
}
```

#### 1.4 Fix Bug deduplicate.ts

**Fichier** : `lib/rag/deduplicate.ts`

**Problème** : Perte structure réalisations lors déduplication.

**Solution** : Préserver structure complète, dédupliquer uniquement contenu.

**Validation** :
- Test : RAG avec 60+ doublons → doit réduire à 8-12 réalisations
- Vérifier : Structure préservée, impacts quantifiés conservés

---

### Jour 2 : Enrichissement Contextuel (6-8h)

#### 2.1 Créer Types Contexte Enrichi

**Fichier** : `types/rag-contexte-enrichi.ts` (nouveau)

**Structure** :
```typescript
interface ContexteEnrichi {
  responsabilites_implicites: Array<{
    description: string;
    justification: string; // Phrase source qui justifie
    confidence: number; // 60-100
  }>;
  competences_tacites: Array<{
    nom: string;
    type: "technique" | "soft_skill" | "methodologie";
    justification: string;
    confidence: number;
  }>;
  environnement_travail: {
    taille_equipe?: string;
    contexte_projet?: string;
    outils_standards?: string[];
  };
}
```

#### 2.2 Implémenter Prompt Enrichissement

**Fichier** : `lib/ai/prompts.ts`

**Ajouter** : `getContexteEnrichiPrompt(ragData: RAGData)`

**Prompt** :
```
Analyse le profil RAG suivant et identifie les éléments implicites :

1. RESPONSABILITÉS IMPLICITES :
   - Pour chaque expérience, déduis les responsabilités logiquement induites
   - Ex: PMO → reporting, gouvernance, coordination
   - Ex: Dev Lead → code review, mentoring, architecture decisions
   - Justifie chaque déduction avec une phrase source

2. COMPÉTENCES TACITES :
   - Identifie les compétences non explicitement mentionnées mais logiques
   - Ex: Gestion équipe → leadership, communication
   - Ex: Coordination projets → organisation, planification

3. ENVIRONNEMENT TRAVAIL :
   - Dédus la taille d'équipe, contexte projet, outils standards
   - Ex: Startup → équipe réduite, polyvalence
   - Ex: Grande entreprise → processus structurés, outils enterprise
```

#### 2.3 Créer Fonction Génération

**Fichier** : `lib/rag/contexte-enrichi.ts`

**Fonction** :
```typescript
export async function generateContexteEnrichi(
  ragData: RAGData
): Promise<ContexteEnrichi> {
  const prompt = getContexteEnrichiPrompt(ragData);
  const response = await generateWithGemini({ prompt, model: "gemini-3-pro-preview" });
  // Parse et valider avec Zod
  return parseContexteEnrichi(response);
}
```

#### 2.4 Intégrer dans Pipeline

**Fichier** : `app/api/rag/generate/route.ts`

**Changements** :
- Après génération RAG initial, appeler `generateContexteEnrichi`
- Fusionner contexte enrichi dans `completeness_details`
- Sauvegarder dans `rag_metadata`

**Code** :
```typescript
// Après génération RAG
const ragData = parseRAGResponse(geminiResponse);

// Générer contexte enrichi
const contexteEnrichi = await generateContexteEnrichi(ragData);

// Fusionner
ragData.contexte_enrichi = contexteEnrichi;

// Sauvegarder
await saveRAGMetadata(userId, ragData);
```

#### 2.5 Mettre à Jour Matching

**Fichier** : `lib/ai/prompts.ts` → `getMatchAnalysisPrompt`

**Changements** :
- Inclure `contexte_enrichi` dans le prompt de matching
- Utiliser responsabilités implicites pour calculer match score
- Intégrer compétences tacites dans keywords matching

**Validation** :
- Test : Match scores doivent augmenter de 15-25% avec contexte enrichi
- Vérifier : Responsabilités implicites utilisées dans matching

---

### Jour 3 : Fusion Intelligente (3-4h)

#### 3.1 Normalisation Noms Entreprises

**Fichier** : `lib/rag/normalize-company.ts` (existe déjà, améliorer)

**Améliorations** :
- Ajouter variations communes (ex: "BNP" → "BNP Paribas")
- Détecter acronymes (ex: "VW" → "Volkswagen")
- Gérer suffixes (ex: "SA", "Ltd", "Inc")

**Code** :
```typescript
export function normalizeCompanyName(name: string): string {
  // Variations connues
  const variations: Record<string, string> = {
    "BNP": "BNP Paribas",
    "VW": "Volkswagen",
    "MS": "Microsoft",
    // ...
  };
  
  // Normaliser
  let normalized = name.trim();
  
  // Vérifier variations
  if (variations[normalized]) {
    return variations[normalized];
  }
  
  // Supprimer suffixes
  normalized = normalized.replace(/\s+(SA|Ltd|Inc|Corp)$/i, "");
  
  return normalized;
}
```

#### 3.2 Améliorer Similarité Chaînes

**Fichier** : `lib/rag/string-similarity.ts` (existe déjà, améliorer)

**Améliorations** :
- Combiner Jaccard + Levenshtein + normalisation
- Poids adaptatifs selon longueur chaînes
- Gérer variations accents, casse, ponctuation

**Code** :
```typescript
export function calculateStringSimilarity(
  str1: string,
  str2: string
): number {
  // Normaliser
  const n1 = normalizeForMatch(str1);
  const n2 = normalizeForMatch(str2);
  
  // Jaccard similarity
  const jaccard = calculateJaccardSimilarity(n1, n2);
  
  // Levenshtein (normalisé par longueur max)
  const maxLen = Math.max(n1.length, n2.length);
  const levenshtein = 1 - (levenshteinDistance(n1, n2) / maxLen);
  
  // Combiner (poids adaptatifs)
  const weight = maxLen > 20 ? 0.6 : 0.4; // Jaccard plus important pour longues chaînes
  return jaccard * weight + levenshtein * (1 - weight);
}
```

#### 3.3 Déduplication Sémantique

**Fichier** : `lib/rag/deduplicate.ts`

**Améliorations** :
- Utiliser similarité sémantique (embeddings) en plus de similarité textuelle
- Grouper réalisations similaires avant déduplication
- Préserver meilleure version (plus détaillée, avec chiffres)

**Code** :
```typescript
export function deduplicateRealisations(
  realisations: Realisation[]
): Realisation[] {
  // Grouper par similarité
  const groups: Realisation[][] = [];
  
  for (const real of realisations) {
    let added = false;
    for (const group of groups) {
      const similarity = calculateStringSimilarity(
        real.description,
        group[0].description
      );
      if (similarity > 0.75) {
        group.push(real);
        added = true;
        break;
      }
    }
    if (!added) {
      groups.push([real]);
    }
  }
  
  // Fusionner chaque groupe (garder meilleure version)
  return groups.map(group => {
    // Prioriser : avec chiffres > détaillé > autre
    return group.reduce((best, current) => {
      if (current.impact && !best.impact) return current;
      if (current.description.length > best.description.length) return current;
      return best;
    });
  });
}
```

#### 3.4 Tests Edge Cases

**Tests à créer** :
- `__tests__/rag/deduplicate.test.ts`
- `__tests__/rag/normalize-company.test.ts`
- `__tests__/rag/string-similarity.test.ts`

**Cas à tester** :
- Variations noms entreprises (BNP, BNP Paribas, BNP Paribas SA)
- Réalisations similaires mais formulées différemment
- Réalisations avec/sans chiffres (prioriser avec chiffres)
- Chaînes très longues vs courtes

---

## Métriques de Succès

### Duplication RAG
- **Avant** : 60+ doublons par expérience
- **Après** : 0 doublons sémantiques (similarité > 0.75)
- **Qualité** : 8-12 réalisations max par expérience

### Match Scores
- **Avant** : Match scores moyens
- **Après** : +15-25% amélioration moyenne
- **Validation** : Test sur 10+ analyses d'offres

### Enrichissement Contextuel
- **Couverture** : 80%+ expériences avec contexte enrichi
- **Qualité** : Justifications pertinentes (confidence > 70)
- **Impact** : Utilisation dans matching validée

### Fusion Intelligente
- **Normalisation** : 95%+ entreprises normalisées correctement
- **Déduplication** : 0 expériences dupliquées après fusion
- **Similarité** : Calculs précis (tests unitaires passent)

---

## Fichiers à Modifier/Créer

### Modifications
- `lib/ai/prompts.ts` : Prompt RAG amélioré + prompt enrichissement
- `lib/rag/merge-simple.ts` : Threshold ajusté
- `lib/rag/deduplicate.ts` : Fix bug + amélioration
- `lib/rag/normalize-company.ts` : Normalisation améliorée
- `lib/rag/string-similarity.ts` : Similarité améliorée
- `app/api/rag/generate/route.ts` : Mode REPLACE + intégration enrichissement

### Créations
- `types/rag-contexte-enrichi.ts` : Types contexte enrichi
- `lib/rag/contexte-enrichi.ts` : Génération contexte enrichi
- `__tests__/rag/deduplicate.test.ts` : Tests déduplication
- `__tests__/rag/normalize-company.test.ts` : Tests normalisation
- `__tests__/rag/string-similarity.test.ts` : Tests similarité
- `__tests__/rag/contexte-enrichi.test.ts` : Tests enrichissement

---

## Ordre d'Exécution

1. **Jour 1** : Fix Duplication (4-6h)
   - Prompt Gemini amélioré
   - Threshold ajusté
   - Mode REPLACE implémenté
   - Bug deduplicate.ts fixé
   - Tests validation

2. **Jour 2** : Enrichissement Contextuel (6-8h)
   - Types créés
   - Prompt enrichissement
   - Fonction génération
   - Intégration pipeline
   - Mise à jour matching
   - Tests qualité

3. **Jour 3** : Fusion Intelligente (3-4h)
   - Normalisation entreprises
   - Similarité améliorée
   - Déduplication sémantique
   - Tests edge cases

**Temps total estimé** : 13-18h (2-3 jours)

---

## Validation Finale

### Checklist
- [ ] RAG généré sans duplication (test manuel)
- [ ] Match scores améliorés de 15-25% (tests automatisés)
- [ ] Contexte enrichi présent dans 80%+ expériences
- [ ] Normalisation entreprises fonctionnelle
- [ ] Tests unitaires passent (coverage > 80%)
- [ ] Tests E2E passent (génération RAG complète)

### Tests de Régression
- Vérifier que génération RAG existante fonctionne toujours
- Vérifier que matching existant fonctionne toujours
- Vérifier que génération CV fonctionne toujours

---

## Notes

- **Backward Compatibility** : Les changements doivent être rétrocompatibles
- **Migration** : Pas de migration nécessaire (nouveaux champs optionnels)
- **Performance** : Enrichissement contextuel ajoute ~5-10s à génération RAG
- **Coûts** : Enrichissement contextuel ajoute ~20% tokens Gemini

---

## Références

- `AUDIT_RAG_DUPLICATION.md` : Audit complet duplication
- `PLAN_IMPLEMENTATION_RAG_FIXES.md` : Plan détaillé fixes
- `ragCDC.md` : Cahier des charges RAG
- `RAG_STANDARD_FORMAT.md` : Format standard RAG
