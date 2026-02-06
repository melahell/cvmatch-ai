# Audit : doublons et optimisations – CV-Crush

**Date :** 6 février 2026  
**Dernière mise à jour :** post-correctifs (état actuel)  
**Objectif :** Repérer les doublons qui peuvent court-circuiter le bon fonctionnement, et proposer des optimisations.

---

## État des correctifs appliqués

| Catégorie | Statut | Action réalisée |
|-----------|--------|-----------------|
| Merge RAG | Corrigé | `lib/cv/rag-merge.ts` supprimé. Source unique : `lib/rag/merge-simple.ts`. |
| API generate | Corrigé | Alias documenté dans `app/api/cv/generate/route.ts` ; URL canonique `/api/cv/generate-v2`. |
| Types ContexteEnrichi | Corrigé | `types/rag-enhanced.ts` archivé dans `docs/specs/rag-enhanced-archive.ts`. |
| Conversion RAG→CV | Corrigé | `ragToCVData` supprimée de `lib/data/demo/converters.ts`. Deux chemins restants : `normalizeRAGToCV` (éditeur/renderer), `ragToCVData` (lib/utils, démo). |
| Upload vs extraction | Corrigé | MIME et extensions alignés dans `app/api/rag/upload/route.ts` sur `lib/rag/text-extraction.ts` (RTF/ODT retirés, images ajoutées). |
| Templates CV | Corrigé | `CV_TEMPLATES` dérivé de `TEMPLATES` dans `components/cv/templates` ; `TemplateGallery` importe depuis cette source unique. |
| Type CVData (types/index) | Corrigé | Interface `CVData` supprimée de `types/index.ts` (source de vérité : `components/cv/templates`). |

---

## 1. Résumé exécutif (reste à faire / suivi)

| Catégorie | Problème | Impact | Priorité |
|-----------|----------|--------|----------|
| Logs en prod | console.log dans normalizeRAGToCV | Bruit, perf mineure | P3 |
| Scripts | Copie de normalizeRAGData dans test-structure.js | Dérive possible | P3 |
| Constantes | Deux emplacements (lib/constants.ts vs lib/constants/) | Confusion source de vérité | P3 |
| Documentation | Fichiers AUDIT à la racine ; clarifier types RAG | Lisibilité | P2/P3 |

---

## 2. Doublons traités (référence)

Les points 2.1 à 2.4 et 3.1 ont été corrigés (voir tableau « État des correctifs appliqués » en tête de document). Il ne reste qu’un seul merge RAG (`lib/rag/merge-simple.ts`), un alias documenté pour l’API generate, deux chemins de conversion RAG→CV (normalizeRAGToCV + ragToCVData dans lib/utils), les types rag-enhanced archivés dans docs/specs, et les MIME upload alignés sur l’extraction.

---

## 3. Code mort et dérive restants

- **`scripts/test-structure.js`** : contient une “Copie de normalizeRAGData”. À terme, importer depuis `@/lib/utils/normalize-rag` (ou exécuter le script via Node avec résolution de modules) pour éviter la dérive.

---

## 4. Optimisations recommandées

### 4.1 Logs en production

**Constat :** `components/cv/normalizeData.ts` contient de nombreux `console.log` / `console.warn` (ex. “Exp i: X realisations before filter”). Utile en dev, bruyant en prod.

**Recommandation :** Utiliser le logger existant (`@/lib/utils/logger`) avec niveau (ex. `logger.debug`) et désactiver en prod ou selon l’env, ou entourer les logs par `if (process.env.NODE_ENV === 'development')`.

### 4.2 Constantes

- **`lib/constants.ts`** et **`lib/constants/*`** (ex. `app-constants.ts`) : deux emplacements. Vérifier qu’il n’y a pas de duplication de valeurs (ex. seuils, limites) et, à long terme, centraliser dans `lib/constants/` avec des sous-fichiers par domaine (app, cv, rag, etc.).

### 4.3 Documentation à la racine

- Nombreux fichiers **AUDIT*.md** à la racine (17+). Pour garder un projet lisible :
  - Déplacer les audits dans **`docs/audits/`** (ou `docs/archive/`) et garder à la racine un **AUDIT_INDEX.md** qui liste et pointe vers eux.
  - Ou fusionner les rapports obsolètes dans un seul “Archive des audits” et ne garder à la racine que le dernier rapport actif (ex. celui-ci).

### 4.4 Types RAG

- **types/** : `rag.ts`, `rag-complete.ts`, `rag-contexte-enrichi.ts`, `rag-enhanced.ts`, `cv-optimized.ts`. Clarifier dans un README ou dans les fichiers :
  - Quel type est la “source de vérité” pour le RAG stocké (ex. RAGComplete).
  - Quels types sont utilisés par quelles routes (generate, generate-v2, rag/generate, etc.) pour éviter d’introduire un type “presque pareil” qui court-circuite le bon flux.

---

## 5. Plan d’action restant

| Priorité | Action | Effort |
|----------|--------|--------|
| P2 | Déplacer ou archiver les AUDIT*.md à la racine (docs/audits/ + index) | Faible |
| P3 | Remplacer console.log par logger dans normalizeRAGToCV | Faible |
| P3 | Script test-structure : utiliser normalizeRAGData du projet au lieu d’une copie | Faible |
| P3 | Centraliser / documenter constantes (lib/constants vs lib/constants/) | Faible |

---

## 6. Synthèse

Les correctifs P1/P2 (merge RAG, API generate, conversion RAG→CV, types ContexteEnrichi, upload MIME, templates, CVData) ont été appliqués. Le projet a un seul point d’entrée pour le merge RAG, une conversion RAG→CV clarifiée, des types ContexteEnrichi sans collision, une upload alignée sur l’extraction, et une source unique pour les templates CV. Les actions restantes (logs, scripts, doc) améliorent la maintenabilité sans risque de court-circuit.
