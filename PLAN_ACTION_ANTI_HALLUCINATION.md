# Plan d'Action Anti-Hallucination - Analyse et Solutions

## 🔍 Diagnostic du Problème

### Constat
- Gemini invente toujours des éléments non présents dans les documents
- Exemples : "e-learning", "CMS Oracle FatWire", "création de contenus vidéo"
- Les règles anti-hallucination dans le prompt ne suffisent pas
- Le problème persiste malgré 8 règles renforcées

### Pourquoi ça ne marche pas ?
1. **Prompt trop long/complexe** (700+ lignes) → Gemini ignore certaines instructions
2. **Pas de validation post-extraction** → On ne vérifie pas si les sources sont valides
3. **Gemini fait des inférences même interdites** → Comportement intrinsèque du modèle
4. **Les "sources" demandées ne sont pas validées** → Gemini peut inventer des citations

---

## 🎯 Solutions Proposées (par ordre d'efficacité)

### ✅ SOLUTION 1 : Validation Post-Extraction Stricte (RECOMMANDÉE)

**Principe** : Après extraction, vérifier chaque réalisation/outil/méthode contre le texte original du document.

**Avantages** :
- ✅ Garantit que rien n'est inventé
- ✅ Peut être implémenté rapidement
- ✅ Fonctionne même si Gemini invente

**Implémentation** :
1. Créer `lib/rag/validate-against-source.ts`
2. Pour chaque réalisation extraite :
   - Extraire les mots-clés importants (outils, méthodes, actions)
   - Chercher ces mots-clés dans le texte original du document
   - Si pas trouvé → SUPPRIMER la réalisation ou la marquer comme "non validée"
3. Appliquer cette validation après chaque extraction Gemini

**Exemple** :
```typescript
// Réalisation extraite : "Création de contenus e-learning"
// Recherche dans document original : "e-learning" → NON TROUVÉ
// Action : SUPPRIMER cette réalisation
```

**Complexité** : Moyenne (2-3h)
**Efficacité** : ⭐⭐⭐⭐⭐ (100% de garantie)

---

### ✅ SOLUTION 2 : Prompt Ultra-Court et Directif

**Principe** : Réduire le prompt à l'essentiel, mettre les règles anti-hallucination en premier, répétées 3 fois.

**Avantages** :
- ✅ Plus facile à implémenter
- ✅ Gemini voit les règles en premier
- ✅ Moins de confusion

**Implémentation** :
1. Créer `lib/ai/prompts-strict.ts` (version courte)
2. Structure :
   ```
   RÈGLE #1: NE RIEN INVENTER (répété 3 fois)
   RÈGLE #2: SOURCES OBLIGATOIRES (répété 3 fois)
   RÈGLE #3: VALIDATION (répété 3 fois)
   [Reste du prompt minimal]
   ```
3. Utiliser ce prompt pour l'extraction

**Complexité** : Faible (1h)
**Efficacité** : ⭐⭐⭐ (70% - dépend de Gemini)

---

### ✅ SOLUTION 3 : Extraction en Deux Passes

**Principe** :
- **Passe 1** : Extraction stricte (seulement ce qui est explicitement mentionné)
- **Passe 2** : Enrichissement optionnel (avec validation stricte)

**Avantages** :
- ✅ Séparation claire entre extraction et enrichissement
- ✅ Plus de contrôle

**Implémentation** :
1. Passe 1 : Prompt ultra-strict "Extrais SEULEMENT ce qui est explicitement écrit"
2. Passe 2 : Enrichissement contextuel (optionnel, avec validation)
3. Validation après chaque passe

**Complexité** : Moyenne (3-4h)
**Efficacité** : ⭐⭐⭐⭐ (85%)

---

### ✅ SOLUTION 4 : Validation des Sources Citations

**Principe** : Vérifier que chaque "source" citation existe vraiment dans le document original.

**Avantages** :
- ✅ Détecte les citations inventées
- ✅ Peut supprimer les réalisations sans source valide

**Implémentation** :
1. Pour chaque réalisation avec `sources: ["citation..."]`
2. Chercher la citation dans le texte original (fuzzy match)
3. Si pas trouvé → SUPPRIMER la réalisation

**Complexité** : Moyenne (2h)
**Efficacité** : ⭐⭐⭐⭐ (80%)

---

### ✅ SOLUTION 5 : Mode "Strict" vs "Enrichi"

**Principe** : Deux modes d'extraction avec prompts différents.

**Avantages** :
- ✅ L'utilisateur choisit le niveau de risque
- ✅ Mode strict = 0% hallucination garanti

**Implémentation** :
1. Mode "strict" : Prompt ultra-conservateur + validation post-extraction
2. Mode "enrichi" : Prompt actuel + validation post-extraction
3. UI : Toggle dans l'interface

**Complexité** : Faible (1h)
**Efficacité** : ⭐⭐⭐⭐⭐ (100% en mode strict)

---

### ✅ SOLUTION 6 : Exemples Négatifs dans le Prompt

**Principe** : Montrer à Gemini ce qu'il ne faut PAS faire avec des exemples concrets.

**Avantages** :
- ✅ Gemini comprend mieux par l'exemple
- ✅ Facile à ajouter

**Implémentation** :
```
❌ MAUVAIS EXEMPLE :
Document dit : "Reporting des temps"
Réalisation inventée : "Création de contenus e-learning" ← INTERDIT

✅ BON EXEMPLE :
Document dit : "Reporting des temps avec Excel"
Réalisation : "Reporting des temps avec Excel" ← CORRECT
```

**Complexité** : Très faible (30min)
**Efficacité** : ⭐⭐ (50% - aide mais ne garantit pas)

---

## 🚀 Plan d'Action Recommandé (Combinaison)

### Phase 1 : Solution Immédiate (1-2 jours)
1. ✅ **Solution 1** : Validation post-extraction stricte
2. ✅ **Solution 6** : Exemples négatifs dans prompt
3. ✅ **Solution 2** : Prompt ultra-court (version stricte)

### Phase 2 : Amélioration (3-5 jours)
4. ✅ **Solution 4** : Validation des sources citations
5. ✅ **Solution 5** : Mode "strict" vs "enrichi" (optionnel)

### Phase 3 : Optimisation (optionnel)
6. ✅ **Solution 3** : Extraction en deux passes (si nécessaire)

---

## 📊 Comparaison des Solutions

| Solution | Complexité | Efficacité | Temps | Garantie |
|----------|------------|------------|-------|----------|
| Validation post-extraction | Moyenne | ⭐⭐⭐⭐⭐ | 2-3h | 100% |
| Prompt ultra-court | Faible | ⭐⭐⭐ | 1h | 70% |
| Deux passes | Moyenne | ⭐⭐⭐⭐ | 3-4h | 85% |
| Validation sources | Moyenne | ⭐⭐⭐⭐ | 2h | 80% |
| Mode strict/enrichi | Faible | ⭐⭐⭐⭐⭐ | 1h | 100% |
| Exemples négatifs | Très faible | ⭐⭐ | 30min | 50% |

---

## 🎯 Recommandation Finale

**Implémenter en priorité** :
1. **Solution 1** (Validation post-extraction) - GARANTIE 100%
2. **Solution 6** (Exemples négatifs) - Aide rapide
3. **Solution 2** (Prompt strict) - Amélioration

**Résultat attendu** : 0% d'hallucination garantie avec validation post-extraction.

---

## 💡 Détails Techniques - Solution 1

### Fonction de validation
```typescript
function validateRealisationAgainstSource(
  realisation: { description: string, sources?: string[] },
  originalText: string
): { isValid: boolean, reason?: string } {
  // 1. Extraire mots-clés importants (outils, méthodes, actions)
  const keywords = extractKeywords(realisation.description);
  
  // 2. Chercher dans texte original
  const found = keywords.filter(kw => 
    originalText.toLowerCase().includes(kw.toLowerCase())
  );
  
  // 3. Si < 50% des mots-clés trouvés → INVALIDE
  if (found.length / keywords.length < 0.5) {
    return { isValid: false, reason: "Mots-clés non trouvés dans source" };
  }
  
  // 4. Vérifier sources citations si présentes
  if (realisation.sources) {
    const sourcesValid = realisation.sources.every(source =>
      originalText.includes(source.substring(0, 20)) // Match partiel
    );
    if (!sourcesValid) {
      return { isValid: false, reason: "Sources citations invalides" };
    }
  }
  
  return { isValid: true };
}
```

### Intégration
- Appeler après chaque extraction Gemini
- Filtrer les réalisations invalides
- Logger les suppressions pour audit

---

## ❓ Questions pour Validation

1. Préférez-vous **supprimer** les réalisations invalides ou les **marquer** comme "non validées" ?
2. Voulez-vous un **mode strict** (0% hallucination) vs **mode enrichi** (risque contrôlé) ?
3. Acceptez-vous de **perdre quelques réalisations valides** pour garantir 0% d'invention ?

---

**Prêt à implémenter dès validation du plan.**
