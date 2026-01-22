# 🚨 PROBLÈME IDENTIFIÉ : CONTRADICTION DANS LE PROMPT

## Le prompt utilisé est bien `getRAGExtractionPrompt` dans `lib/ai/prompts.ts`

✅ **Vérifié** : Le prompt est bien utilisé dans `generate-incremental` (ligne 232)

## ❌ MAIS : Le prompt contient des CONTRADICTIONS MAJEURES

### Contradiction #1 : "Ne rien inventer" vs "Déploie en détails"

**Ligne 28** : "⛔ INTERDICTION ABSOLUE d'inventer quoi que ce soit"
**Ligne 150-151** : "tu DOIS déployer cette responsabilité en détails opérationnels"
**Ligne 156** : "Outils: logiciels, plateformes, technologies utilisées (si mentionnés **ou probables**)" ← **PROBLÈME ICI !**

### Contradiction #2 : "Minimum 6 réalisations" pousse à inventer

**Ligne 148** : "⚠️ CONTRAINTE STRICTE: Minimum 6 réalisations par expérience"
**Ligne 42** : "transforme-la en 4 à 8 réalisations CONCRÈTES"

Si le document ne mentionne que 3 réalisations, Gemini va **inventer** pour atteindre 6.

### Contradiction #3 : Exemples de déploiement inventent des détails

**Ligne 162-168** : Exemple "Reporting des temps" → déploie en 5 réalisations avec "Excel et PowerBI"

Si le document ne mentionne PAS "Excel" ou "PowerBI", Gemini va les inventer en suivant l'exemple.

---

## 🎯 SOLUTION : Corriger les contradictions

### Option A : Supprimer les instructions de "déploiement" (STRICT)
- Supprimer ligne 150-158 (RÈGLES DE DÉPLOIEMENT)
- Supprimer ligne 160-184 (EXEMPLES DE DÉPLOIEMENT)
- Garder seulement : "Extrais ce qui est écrit, ne déploie pas"

### Option B : Clarifier que déploiement = seulement ce qui est explicite
- Modifier ligne 156 : "Outils: **UNIQUEMENT si mentionnés explicitement**" (supprimer "ou probables")
- Modifier ligne 148 : "Minimum 6 réalisations **SI le document en contient assez**"
- Modifier exemples : Ajouter "⚠️ Ces exemples supposent que les outils sont mentionnés dans le document"

### Option C : Deux modes (recommandé)
- Mode STRICT : Pas de déploiement, extraction littérale
- Mode ENRICHI : Déploiement mais avec validation post-extraction

---

## 📊 Impact

**Actuellement** : Gemini suit les instructions de "déploiement" et invente des détails pour :
- Atteindre le minimum de 6 réalisations
- Suivre les exemples de déploiement
- Ajouter des outils "probables"

**Résultat** : Hallucinations systématiques malgré les règles anti-hallucination.

---

## ✅ RECOMMANDATION

**Option B + Validation post-extraction** :
1. Corriger les contradictions dans le prompt (Option B)
2. Ajouter validation post-extraction (vérifier chaque réalisation contre le texte original)

**Temps estimé** : 2-3h
**Efficacité** : 100% (garantie avec validation)
