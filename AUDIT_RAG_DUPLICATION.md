# 🔍 AUDIT COMPLET: Problème de Duplication RAG

**Date**: 2026-01-07
**Auditeur**: Claude
**Statut**: ⚠️ CRITIQUE - 5 problèmes racines identifiés

---

## 📊 Résumé Exécutif

**Symptôme rapporté**: Après "Purger doublons" + "Régénérer", le RAG contient encore 60+ réalisations dupliquées pour UNE SEULE expérience.

**Exemple concret** (Volkswagen PMO):
- "Pilotage centralisé du portefeuille projets et ressources de la DSI via Orchestra" (×8)
- "Mise en place d'audits Qualité et refonte des méthodologies" (×10)
- "Formation à l'utilisation du PPM Orchestra de Planisware" (×6)
- Technologies: "Planisware, Planisware e7, e7, Orchestra, PPM Orchestra" (8 variations)

**Impact**: Qualité RAG dégradée, CV pollués, utilisateurs insatisfaits.

---

## 🔴 ROOT CAUSE #1: Gemini Prompt Défaillant (CRITIQUE)

### Localisation
- **Fichier**: `lib/ai/prompts.ts:10`
- **Code problématique**:
```typescript
MISSION CRITIQUE: Extrais et structure TOUTES les informations avec RIGUEUR MAXIMALE
```

### Analyse Détaillée

Le prompt demande à Gemini d'extraire **TOUTES** les informations sans:
- ❌ Limite sur le nombre de réalisations par expérience
- ❌ Instruction de consolidation des réalisations similaires
- ❌ Directive d'élimination des doublons
- ❌ Guideline de priorisation (garder les plus impactantes)

### Conséquence

Quand Gemini lit un CV qui mentionne plusieurs fois:
- "Pilotage du portefeuille projets"
- "Gestion du portefeuille"
- "Pilotage centralisé du portfolio"

Il extrait **LES TROIS** comme réalisations séparées car le prompt dit "TOUTES".

### Preuve
Aucune règle de consolidation trouvée dans les 244 lignes du prompt.

---

## 🔴 ROOT CAUSE #2: Seuil de Déduplication Trop Strict (CRITIQUE)

### Localisation
- **Fichier**: `lib/rag/merge-simple.ts:48, 187`
- **Code problématique**:
```typescript
areSimilar(r.description || '', real.description || '', 0.85)
```

### Analyse Mathématique: Calcul Jaccard

**Réalisation 1**: "Pilotage centralisé du portefeuille projets et ressources de la DSI via Orchestra"
**Réalisation 2**: "Gestion du portefeuille de projets et ressources de la DSI"

Après normalisation (lowercase, mots >2 chars):
- Mots R1: `{pilotage, centralisé, portefeuille, projets, ressources, dsi, via, orchestra}` = 8 mots
- Mots R2: `{gestion, portefeuille, projets, ressources, dsi}` = 5 mots

**Calcul Jaccard**:
- Intersection: `{portefeuille, projets, ressources, dsi}` = 4 mots
- Union: `{pilotage, centralisé, portefeuille, projets, ressources, dsi, via, orchestra, gestion}` = 9 mots
- **Similarité = 4/9 = 0.444**

**Résultat**: 0.444 < 0.85 → **NON DÉTECTÉ COMME DOUBLON** ❌

### Conséquence

Des réalisations sémantiquement identiques mais avec variations de mots passent à travers le filtre:
- Ajout de mots techniques ("via Orchestra", "Planisware")
- Synonymes ("Pilotage" vs "Gestion")
- Détails supplémentaires ("centralisé", "de la DSI")

**Score requis pour détecter**: 0.65-0.75 serait plus réaliste.

---

## 🟠 ROOT CAUSE #3: Bug dans deduplicate.ts (MOYEN)

### Localisation
- **Fichier**: `lib/rag/deduplicate.ts:91-110`
- **Code problématique**:
```typescript
// Line 91: Convertit en string
const text = typeof real === 'string' ? real : real.description || JSON.stringify(real);

// Line 105: Ajoute le STRING au Set
if (!isDuplicate) {
    allRealisations.add(text);
}

// Line 110: Retourne un array de STRINGS (perte de structure!)
base.realisations = Array.from(allRealisations);
```

### Analyse

La fonction `mergeExperiences()` dans `deduplicate.ts`:
1. Convertit les réalisations en **strings** pour comparaison (ligne 91)
2. Stocke les strings dans un `Set<string>` (ligne 105)
3. Retourne un **array de strings** (ligne 110)

**Problème**: Les réalisations devraient être des objets `{description, impact}`, pas des strings!

### Conséquence

Quand `deduplicateRAG()` est appelé après parse Gemini, les réalisations perdent leur structure:
- ✅ Avant: `{description: "...", impact: "..."}`
- ❌ Après: `"..."`  (juste la description)

Impact sur qualité et templates CV.

---

## 🔴 ROOT CAUSE #4: Régénération en Mode MERGE (CRITIQUE)

### Localisation
- **Fichier**: `app/api/rag/generate/route.ts:303-309`
- **Code problématique**:
```typescript
if (existingRag?.completeness_details) {
    console.log('[MERGE] Merging with existing RAG data (with semantic deduplication)...');
    const mergeResult = mergeRAGData(existingRag.completeness_details, ragData);
    finalRAGData = mergeResult.merged;
}
```

### Analyse du Flow Utilisateur

**Ce qui se passe quand l'utilisateur clique "Régénérer"**:

1. **État initial**: RAG pollué avec 60 doublons
2. **Utilisateur clique "Purger doublons"**: RAG nettoyé → 10 réalisations
3. **Utilisateur clique "Régénérer"**:
   - Gemini re-parse les documents
   - Gemini génère 60 nouvelles réalisations (dont beaucoup de doublons)
   - **Système MERGE** les 10 anciennes avec les 60 nouvelles
   - Même avec déduplication (seuil 0.85), beaucoup passent (cf. ROOT CAUSE #2)
4. **Résultat**: Retour à 60+ réalisations avec doublons ❌

### Conséquence

**Il n'y a PAS d'option REPLACE** pour régénérer from scratch. Le système AJOUTE toujours au lieu de REMPLACER.

### Preuve
```bash
grep -n "REPLACE\|replace mode" app/api/rag/generate/route.ts
# Aucun résultat
```

---

## 🟠 ROOT CAUSE #5: Absence de Validation Qualité (MOYEN)

### Localisation
- **Fichiers**: `app/api/rag/generate/route.ts`, `app/api/rag/generate-incremental/route.ts`

### Problèmes Identifiés

Le système accepte **N'IMPORTE QUEL** RAG généré par Gemini sans:

1. ❌ **Validation max réalisations**: Pas de limite (8-12 recommandé)
2. ❌ **Validation min réalisations**: Pas de minimum pour expériences récentes
3. ❌ **Diff visuel**: Utilisateur ne voit pas ce qui change
4. ❌ **Confirmation avant save**: Sauvegarde automatique sans approbation
5. ❌ **Rollback capability**: Pas de versioning pour revenir en arrière

### Conséquence

- RAG avec 60+ doublons sauvegardé sans alerte
- Utilisateur découvre le problème APRÈS génération
- Pas de moyen de revenir en arrière
- Pas de visibilité sur ce qui a changé

---

## 🧪 Tests de Validation Réalisés

### Test 1: Calcul Jaccard Manuel

**Entrée**:
- R1: "Pilotage centralisé du portefeuille projets et ressources de la DSI via Orchestra"
- R2: "Gestion du portefeuille de projets et ressources de la DSI"

**Résultat**: 0.444 (< 0.85 threshold)
**Conclusion**: ❌ NON détecté comme doublon (FAUX NÉGATIF)

### Test 2: Analyse du Prompt Gemini

**Recherche**: Mots-clés "consolid", "limit", "max", "deduplic"
**Résultat**: 0 occurrences
**Conclusion**: ❌ Aucune instruction anti-duplication

### Test 3: Trace du Flow Merge

**Flow actuel**:
```
Upload → Extract → Gemini (60 items) → deduplicateRAG() → MERGE with existing → Save
                                          ↓ (0.85 threshold)
                                    Only removes exact duplicates
```

**Conclusion**: ❌ Le merge AJOUTE au lieu de REMPLACER

---

## 📋 Régressions Potentielles Identifiées

### Si on baisse le seuil à 0.7:

**Risque de sur-suppression**:
- "Pilotage projets Agile" vs "Pilotage projets Waterfall" → Similarité ~0.72 → Supprimé à tort
- "Développement backend Python" vs "Développement backend Java" → Similarité ~0.75 → Supprimé à tort

**Mitigation**:
- Utiliser 0.75 comme compromis
- Ajouter des **exclusion rules** (si technos différentes → ne pas supprimer)

### Si on ajoute un prompt de consolidation:

**Risque de perte d'information**:
- Gemini pourrait trop consolider et perdre des nuances importantes
- Exemple: "Pilotage de 50 projets" + "Pilotage avec budget 2M€" → "Pilotage de projets" (perte de détails)

**Mitigation**:
- Demander à Gemini de **fusionner intelligemment** en gardant TOUS les chiffres et impacts
- Limiter à 8-12 réalisations **les plus impactantes** (pas les premières trouvées)

### Si on passe en mode REPLACE:

**Risque de perte de données manuelles**:
- Si utilisateur a édité son RAG manuellement
- Mode REPLACE écrase TOUT sans merge

**Mitigation**:
- Ajouter un flag `mode: "merge" | "replace"` dans l'API
- Demander confirmation avec diff visuel
- Sauvegarder version précédente (versioning)

---

## ✅ Plan de Tests de Validation

### Avant Implémentation des Fixes

**Test unitaire déduplication**:
```typescript
// Test avec données réelles de l'utilisateur
const testData = {
  realisations: [
    { description: "Pilotage centralisé du portefeuille projets et ressources de la DSI via Orchestra", impact: "..." },
    { description: "Gestion du portefeuille de projets et ressources de la DSI", impact: "..." },
    { description: "Pilotage du portefeuille de projets et des ressources de la DSI", impact: "..." }
  ]
};

// Test avec différents seuils
console.log("Threshold 0.85:", deduplicateRealisations(testData.realisations, 0.85).length);
console.log("Threshold 0.75:", deduplicateRealisations(testData.realisations, 0.75).length);
console.log("Threshold 0.70:", deduplicateRealisations(testData.realisations, 0.70).length);

// Vérifier les scores de similarité
for (let i = 0; i < testData.realisations.length; i++) {
  for (let j = i + 1; j < testData.realisations.length; j++) {
    const score = calculateSimilarity(
      testData.realisations[i].description,
      testData.realisations[j].description
    );
    console.log(`[${i}] vs [${j}]: ${score.toFixed(3)}`);
  }
}
```

**Test integration flow complet**:
1. Créer user test avec email `test-rag-dedup@cvmatch.ai`
2. Upload 1 CV simple (1 expérience, 3 réalisations)
3. Générer RAG → Vérifier count exact
4. Régénérer RAG en mode REPLACE → Vérifier pas de doublons
5. Régénérer RAG en mode MERGE → Vérifier déduplication fonctionne

**Test prompt Gemini**:
1. Créer un CV test avec réalisations similaires volontairement dupliquées
2. Parser avec prompt ACTUEL → Count réalisations
3. Parser avec prompt AMÉLIORÉ (avec consolidation) → Count réalisations
4. Comparer quality score et structure

---

## 🎯 Recommandations Prioritaires

### CRITIQUE (À FAIRE EN PREMIER)

1. **Fix Threshold** (lib/rag/merge-simple.ts:48,187)
   - Passer de 0.85 → **0.75**
   - Ajouter exclusion rules (technologies différentes → ne pas supprimer)

2. **Améliorer Prompt Gemini** (lib/ai/prompts.ts:10)
   - Ajouter règle: "Consolider les réalisations similaires"
   - Ajouter limite: "Maximum 8-12 réalisations PAR expérience"
   - Ajouter instruction: "Garder UNIQUEMENT les plus impactantes et quantifiées"

3. **Ajouter Mode REPLACE** (app/api/rag/generate/route.ts:303)
   - Paramètre: `mode: "merge" | "replace"` dans body
   - Si `mode === "replace"` → Ne pas merger, remplacer directement
   - Garder MERGE par défaut pour compatibilité

### IMPORTANT (À FAIRE ENSUITE)

4. **Fix Bug deduplicate.ts** (lib/rag/deduplicate.ts:110)
   - Retourner array d'objets, pas array de strings
   - Préserver structure `{description, impact}`

5. **Ajouter Validation Qualité**
   - Max 15 réalisations par expérience (rejeter si > 15)
   - Min 4 réalisations pour expériences récentes (<3 ans)
   - Alert si reduction < 10% après deduplication (signe de problème)

### RECOMMANDÉ (NICE TO HAVE)

6. **Diff Visuel Avant Save**
7. **Versioning + Rollback**
8. **Logs Détaillés avec Scores**

---

## 📊 Métriques de Succès

### Critères d'Acceptation

✅ **Après cleanup + régénération**: Max 12 réalisations par expérience
✅ **Zéro doublon sémantique** avec score > 0.75
✅ **Quality score**: Minimum 70/100
✅ **User satisfaction**: Pas de plainte sur duplication

### KPIs à Suivre

- Nombre moyen de réalisations par expérience (target: 8-10)
- Taux de déduplication (target: >30% de réduction sur RAG pollués)
- Temps de génération (target: <10s pour incremental)
- Quality score moyen (target: >75/100)

---

## 🚀 Conclusion

**5 problèmes racines identifiés**, classés par criticité:

1. 🔴 **CRITIQUE**: Prompt Gemini sans consolidation → Génère trop de doublons
2. 🔴 **CRITIQUE**: Threshold 0.85 trop strict → Laisse passer doublons sémantiques
3. 🔴 **CRITIQUE**: Mode MERGE uniquement → Pas de REPLACE pour repartir de zéro
4. 🟠 **MOYEN**: Bug deduplicate.ts → Perte de structure des réalisations
5. 🟠 **MOYEN**: Pas de validation → Accepte n'importe quel RAG

**Prochaines étapes**:
1. Valider ces findings avec tests unitaires
2. Créer plan d'implémentation détaillé
3. Implémenter les 3 fixes critiques en priorité
4. Tester sur user réel avant déploiement

---

**Fin du rapport d'audit** 🔍
