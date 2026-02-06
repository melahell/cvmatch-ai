# Audit Screen CV Généré - Version 6.4.3

**Date** : 24 janvier 2026  
**Version** : 6.4.3  
**Template** : Modern  
**Interface** : CV Builder V2

---

## 🔴 PROBLÈMES CRITIQUES PERSISTANTS

### 1. **PHOTO DE PROFIL TOUJOURS ABSENTE** ❌

**Symptôme observé** : Placeholder "GG" affiché au lieu de la photo de profil.

**Statut** : Correction implémentée mais problème persiste

**Hypothèses** :
- La photo n'est toujours pas récupérée depuis le RAG
- La conversion storage ref → signed URL échoue toujours
- Le fallback vers API photo n'est pas implémenté
- La photo n'existe pas dans le RAG de l'utilisateur

**Action requise** : Vérifier les logs de diagnostic pour identifier la cause exacte

---

### 2. **RÉALISATIONS ENCORE TRONQUÉES** ❌

**Symptôme observé** : Les bullet points sont toujours coupés au milieu des mots/phrases :
- "...l'allocation des ress ou"
- "...véthodologie de gestion"
- "...qualité (Audit), coordination o"
- "...Pictage"

**Statut** : Limites augmentées mais problème persiste

**Analyse** :
- Les limites ont été augmentées (8→20, detailed 5→12)
- Mais les réalisations sont toujours coupées
- Le problème semble être au niveau du **rendu CSS** ou de la **troncature des textes individuels**

**Causes possibles** :
1. **Troncature au niveau caractère** : Les réalisations individuelles sont peut-être tronquées avant d'être passées au template
2. **CSS overflow** : Les `<li>` avec `list-disc list-inside` peuvent avoir des contraintes de largeur qui coupent le texte
3. **Troncature dans normalizeData** : La fonction `truncateRealisation` pourrait tronquer même si `maxRealisationLength: 999`
4. **Troncature dans adaptive-algorithm** : La fonction `sliceText` est utilisée pour le format "compact" et pourrait être utilisée ailleurs

**Fichiers à vérifier** :
- `components/cv/normalizeData.ts` : fonction `truncateRealisation`
- `lib/cv/adaptive-algorithm.ts` : fonction `sliceText` et utilisation
- `components/cv/templates/ModernTemplate.tsx` : CSS des `<li>` avec `list-disc list-inside`

---

### 3. **"EXPÉRIENCE CLÉ" SANS CONTEXTE** ❌❌❌

**Symptôme observé** : Sections "Expérience clé" affichées **SANS** :
- Titre de poste
- Nom d'entreprise
- Période (dates)

**Impact** : CRITIQUE - Ces sections sont inutiles et nuisent à la qualité du CV

**Analyse** :
- Le filtre que nous avons ajouté devrait masquer ces expériences (minimum 2 champs sur 3)
- Mais elles apparaissent quand même dans le CV
- Cela suggère que :
  1. Le filtre ne fonctionne pas correctement
  2. Les données arrivent avec des valeurs vides mais non-null (espaces, chaînes vides)
  3. Le filtre est appliqué trop tard dans le pipeline
  4. "Expérience clé" est généré par l'IA et n'est pas une vraie expérience structurée

**Hypothèse principale** : "Expérience clé" semble être un **widget généré par l'IA** dans le CV Builder, pas une expérience normale du RAG. Il faut vérifier :
- Comment les widgets sont convertis en expériences
- Si les widgets "Expérience clé" ont les champs requis
- Si le filtre s'applique aux widgets convertis

**Fichiers à vérifier** :
- `lib/cv/client-bridge.ts` : Conversion widgets → CVData
- `app/dashboard/cv-builder/page.tsx` : Génération des widgets
- `components/cv/ExperienceEditor.tsx` : Édition des expériences

---

### 4. **MOTS COUPÉS AU MILIEU** ❌

**Symptôme observé** : Les mots sont coupés de manière visible :
- "ress ou" (probablement "ressources ou")
- "véthodologie" (probablement "méthodologie")
- "Pictage" (probablement "Pilotage")

**Statut** : Corrections CSS ajoutées mais problème persiste

**Analyse** :
- Les règles CSS `word-break: break-word` ont été ajoutées
- Mais le problème persiste
- Cela suggère que :
  1. Les règles CSS ne sont pas appliquées correctement
  2. Il y a une troncature JavaScript qui coupe avant le rendu CSS
  3. La classe `list-inside` avec `list-disc` crée des contraintes de largeur

**Causes possibles** :
- `list-inside` place le bullet à l'intérieur, réduisant l'espace pour le texte
- Les réalisations sont tronquées dans `normalizeData.ts` ou `adaptive-algorithm.ts` avant d'arriver au template
- La fonction `sliceText` coupe au niveau caractère même avec nos améliorations

**Fichiers à vérifier** :
- `components/cv/templates/ModernTemplate.tsx` ligne 369 : `<ul className="... list-disc list-inside ...">`
- `components/cv/normalizeData.ts` : fonction `truncateRealisation`
- `lib/cv/adaptive-algorithm.ts` : fonction `sliceText` et où elle est utilisée

---

### 5. **TYPO DANS COMPÉTENCES** ⚠️

**Symptôme observé** : "Plarsaware" au lieu de "Planisware"

**Impact** : Mineur mais indique un problème de normalisation/sanitization

**Cause possible** : Problème dans la fonction `sanitizeText` qui ajoute des espaces incorrectement

---

## 🔍 ANALYSE TECHNIQUE APPROFONDIE

### Problème "Expérience clé" sans contexte

**Hypothèse** : Les widgets générés par l'IA créent des "Expérience clé" qui sont des réalisations groupées sans contexte d'expérience.

**Vérification nécessaire** :
1. Examiner la structure des widgets générés par `/api/cv/generate-widgets`
2. Vérifier comment `convertWidgetsToCV` transforme les widgets en expériences
3. Identifier si "Expérience clé" est un type de widget spécial ou une expérience normale avec données manquantes

**Solution potentielle** :
- Si "Expérience clé" est un widget spécial, il faut soit :
  - L'enrichir avec les données d'expérience (poste, entreprise, dates)
  - Le masquer s'il n'a pas ces données
  - Le convertir en réalisations d'une expérience existante plutôt qu'une expérience séparée

---

### Problème réalisations tronquées

**Hypothèse** : Les réalisations sont tronquées à deux niveaux :
1. **Limite de caractères par réalisation** : Chaque réalisation individuelle est limitée en longueur
2. **CSS overflow** : Le rendu CSS coupe le texte même si la réalisation est complète

**Vérification nécessaire** :
1. Vérifier si `truncateRealisation` dans `normalizeData.ts` tronque réellement
2. Vérifier si `sliceText` est utilisé pour tronquer les réalisations (pas seulement pour format compact)
3. Vérifier les contraintes CSS des `<li>` avec `list-disc list-inside`

**Solution potentielle** :
- Si `truncateRealisation` tronque : Supprimer la troncature ou augmenter drastiquement la limite
- Si `sliceText` est utilisé : S'assurer qu'il n'est utilisé que pour format "compact"
- Si CSS : Changer `list-inside` en `list-outside` ou ajuster les marges/padding

---

### Problème photo

**Vérification nécessaire** :
1. Vérifier les logs de diagnostic pour voir où la photo est perdue
2. Vérifier si le fallback vers API photo est implémenté
3. Vérifier si la photo existe dans le RAG de l'utilisateur

---

## 📋 PLAN D'ACTION IMMÉDIAT

### Priorité 1 : "Expérience clé" sans contexte (CRITIQUE)

1. **Identifier l'origine** :
   - Chercher dans `lib/cv/client-bridge.ts` comment les widgets sont convertis
   - Vérifier la structure des widgets générés
   - Identifier si "Expérience clé" est un type spécial

2. **Corriger** :
   - Si widget spécial : Enrichir avec données d'expérience ou masquer
   - Si expérience normale : Améliorer le filtre pour détecter les valeurs vides/espaces

### Priorité 2 : Réalisations tronquées (HAUTE)

1. **Identifier la cause** :
   - Vérifier `truncateRealisation` dans `normalizeData.ts`
   - Vérifier toutes les utilisations de `sliceText`
   - Vérifier les contraintes CSS

2. **Corriger** :
   - Supprimer toute troncature de réalisations individuelles
   - Ajuster CSS pour éviter overflow
   - Changer `list-inside` en `list-outside` si nécessaire

### Priorité 3 : Photo (CRITIQUE mais nécessite logs)

1. **Analyser les logs** de la prochaine génération
2. **Implémenter le fallback** vers API photo si pas déjà fait
3. **Vérifier** la présence de la photo dans le RAG

### Priorité 4 : Mots coupés (MOYENNE)

1. **Vérifier** que les règles CSS sont bien appliquées
2. **Ajuster** `list-inside` → `list-outside` si nécessaire
3. **Vérifier** qu'aucune troncature JavaScript ne coupe avant le rendu

---

## 🎯 PROCHAINES ÉTAPES

1. **Générer un CV de test** et analyser les logs de diagnostic
2. **Identifier l'origine de "Expérience clé"** dans le CV Builder
3. **Vérifier toutes les troncatures** de réalisations
4. **Corriger les problèmes identifiés**
5. **Tester et valider**

---

---

## 🔍 DÉCOUVERTES TECHNIQUES

### Origine de "Expérience clé" ✅ TROUVÉ

**Fichier** : `lib/cv/ai-adapter.ts` - fonction `buildExperiences` lignes 168-170

**Cause racine identifiée** :
```typescript
if (!poste) {
    poste = "Expérience clé";  // ← ICI LE PROBLÈME
}
```

**Analyse** :
- Les expériences sont construites à partir de widgets `experience_header` et `experience_bullet`
- Si un widget `experience_header` n'existe pas ou a un `text` vide, `headerText` est `undefined` ou vide
- La fonction `buildExperiences` crée quand même une expérience avec `poste = "Expérience clé"` (ligne 169)
- L'entreprise devient `"—"` (ligne 176) et `date_debut` est vide `""` (ligne 177)
- Ces expériences passent le filtre car `poste = "Expérience clé"` n'est pas vide, mais elles n'ont pas de contexte utile

**Solution** : Filtrer ces expériences dans `buildExperiences` avant de les retourner

**Code concerné** :
- `lib/cv/ai-adapter.ts` lignes 108-156 : `buildExperiences` ne vérifie pas si `headerText` existe avant de créer l'expérience
- Ligne 150-156 : Les expériences sont créées même si `headerText` est `undefined`

**Solution** : Filtrer les expériences sans `headerText` dans `buildExperiences` OU enrichir avec données du RAG si disponibles

---

### Troncature format "compact"

**Fichier** : `lib/cv/adaptive-algorithm.ts` ligne 115

**Problème** : Le format "compact" utilise `sliceText(first, 110)` - **110 caractères est très court** et explique les coupures visibles.

**Code** :
```typescript
if (format === "compact") {
    const first = bullets[0];
    const compactLine = typeof first === "string" ? sliceText(first, 110) : "";
    return { ...exp, realisations: compactLine ? [compactLine] : [] };
}
```

**Impact** : Si une expérience est en format "compact", la première réalisation est tronquée à 110 caractères, ce qui explique les coupures comme "...l'allocation des ress ou"

**Solution** : Augmenter la limite de 110 à au moins 200-250 caractères pour le format compact

---

### CSS `list-inside` réduit l'espace

**Fichier** : `components/cv/templates/ModernTemplate.tsx` ligne 369

**Problème** : `list-disc list-inside` place le bullet à l'intérieur, réduisant l'espace disponible pour le texte.

**Code** :
```typescript
<ul className="... list-disc list-inside ...">
```

**Impact** : Même si les réalisations ne sont pas tronquées en JavaScript, le CSS peut couper le texte si la largeur est insuffisante.

**Solution** : Changer `list-inside` en `list-outside` et ajuster les marges/padding

---

## 📋 PLAN D'ACTION RÉVISÉ

### Priorité 1 : "Expérience clé" sans contexte (CRITIQUE)

**Fichier** : `lib/cv/ai-adapter.ts`

**Action** :
1. Filtrer les expériences sans `headerText` dans `buildExperiences`
2. OU enrichir avec données du RAG si `rag_experience_id` est présent
3. Appliquer le filtre existant (minimum 2 champs) aussi dans `buildExperiences`

### Priorité 2 : Format "compact" tronque à 110 caractères (HAUTE)

**Fichier** : `lib/cv/adaptive-algorithm.ts` ligne 115

**Action** : Augmenter la limite de 110 à 250 caractères pour le format compact

### Priorité 3 : CSS `list-inside` (MOYENNE)

**Fichier** : `components/cv/templates/ModernTemplate.tsx` ligne 369

**Action** : Changer `list-inside` en `list-outside` et ajuster les marges

### Priorité 4 : Photo (CRITIQUE mais nécessite logs)

**Action** : Analyser les logs de la prochaine génération

---

**Note** : Cet audit est basé sur l'analyse du screen fourni et du code. Des vérifications supplémentaires avec les logs seront nécessaires pour confirmer chaque problème.
