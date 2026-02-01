# CDC - 23 AXES DE GÉNÉRATION CV

**Version** : 1.0  
**Date** : 1er février 2026  
**Basé sur** : Audit complet du système CV réalisé en janvier 2026  
**Note moyenne de l'audit** : 4.1/10  
**Statut** : Cahier des charges pour corrections et améliorations

---

## TABLE DES MATIÈRES

1. [Doctrine et Principes Fondamentaux](#1-doctrine-et-principes-fondamentaux)
2. [Les 23 Axes d'Audit](#2-les-23-axes-daudit)
3. [Tableau Récapitulatif](#3-tableau-récapitulatif)
4. [Plan d'Action Priorisé](#4-plan-daction-priorisé)
5. [Exclusions](#5-exclusions)
6. [Annexes](#6-annexes)

---

## 1. DOCTRINE ET PRINCIPES FONDAMENTAUX

### 1.1 Vision Globale

CV-Crush repose sur une doctrine claire : **permettre à l'utilisateur de créer le CV parfait** en exploitant au maximum ses données, avec un contrôle total sur le résultat final.

### 1.2 Les 5 Piliers de la Doctrine

#### Pilier 1 : RAG Exhaustif - "Tout conserver, zéro doublon"

```
RÈGLE : Aucune information unique ne doit être perdue.
        Les doublons sont mergés intelligemment au premier import.
```

- Le RAG (Retrieval Augmented Generation) est la **source de vérité unique**
- Chaque import (CV PDF, LinkedIn PDF, DOCX) enrichit le RAG sans écraser
- Les doublons sont détectés et fusionnés (même entreprise, mêmes dates = merge)
- L'information originale de l'utilisateur est sacrée

#### Pilier 2 : Reformulation à 2 Niveaux

```
Niveau 1 - RAG (qualité) : Corrections orthographe, formulations améliorées
                          → Devient la nouvelle version RAG

Niveau 2 - CV Final (fit) : Reformulation adaptée à l'offre ciblée
                           → Appliquée uniquement à la génération
```

- Au niveau RAG : on corrige les erreurs pour améliorer la qualité de l'information
- Au niveau CV : on reformule pour matcher 100% avec l'offre d'emploi
- Les deux niveaux sont distincts et ne se mélangent pas

#### Pilier 3 : Scoring Exhaustif

```
RÈGLE : Chaque élément du RAG doit être scoré.
        Chaque type d'élément doit avoir son slider de score minimum.
```

- Toutes les expériences, compétences, formations sont scorées (0-100)
- Le scoring est multi-critères : pertinence offre, ATS, impact, récence, séniorité
- L'utilisateur peut filtrer par score minimum pour chaque section

#### Pilier 4 : Contrôle Utilisateur Total

```
Mode Simple  : Slider global de score minimum
Mode Avancé  : Accès à TOUS les paramètres par section
```

- L'utilisateur a toujours le dernier mot
- Mode global pour les utilisateurs pressés
- Mode avancé pour le contrôle fin (max expériences, max skills, etc.)
- Drag & drop pour réorganiser les éléments

#### Pilier 5 : Traçabilité End-to-End

```
CV Final → Widget → RAG Source → Document Original
```

- Chaque élément du CV final peut être tracé jusqu'à sa source
- Les widgets contiennent des références vers le RAG (`rag_experience_id`)
- Transparence totale sur l'origine des informations

### 1.3 Pipeline de Données

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PIPELINE CV-CRUSH                                 │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │   IMPORT     │  CV PDF, LinkedIn PDF, DOCX
  │   Fichiers   │  
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  EXTRACTION  │  Texte brut (pas d'OCR actuellement)
  │    Texte     │  Troncature 100K tokens
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │ CONSTRUCTION │  IA Gemini génère le RAG structuré
  │     RAG      │  Merge doublons, normalisation entreprises
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │ ENRICHISSEMENT│ Compétences tacites, soft skills déduites
  │  Contextuel  │  (contexte_enrichi)
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │   ANALYSE    │  Extraction keywords, scoring sectoriel
  │    OFFRE     │  Match RAG vs Offre
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  GÉNÉRATION  │  Widgets scorés avec métadonnées
  │   WIDGETS    │  Score pertinence 0-100
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │   SCORING    │  5 critères : pertinence, ATS, impact, récence, séniorité
  │   AVANCÉ     │  Filtrage par score minimum
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │    BRIDGE    │  Conversion widgets → CVData
  │  Client-side │  Enrichissement depuis RAG
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  TEMPLATE    │  Modern, Tech, Classic, Creative
  │   FITTING    │  Système de zones adaptatives (CDC_06)
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │    EXPORT    │  PDF, Word, JSON, Markdown
  │    Final     │
  └──────────────┘
```

---

## 2. LES 23 AXES D'AUDIT

### AXES CRITIQUES (Note ≤ 3/10) - Priorité HAUTE

---

#### AXE 1 : Import & Extraction de Fichiers

**Note : 3/10** | **Priorité : HAUTE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Gestion d'erreur par fichier | Aucune validation de type fichier à l'upload |
| Texte extrait mis en cache en base | Pas d'OCR (CV scannés = vide) |
| Troncature intelligente (70% début / 30% fin) | Pas de support DOC, RTF, ODT |
| | Pas de limite taille/nombre fichiers |
| | Fichiers à texte vide non signalés |

**Impact Doctrine** : Violation du pilier "Tout conserver" - les CV scannés perdent 100% de leur contenu.

**Corrections requises** :
1. Ajouter OCR via Tesseract ou service cloud (Google Vision)
2. Valider les types MIME avant upload
3. Supporter DOC/RTF/ODT via libreoffice-convert
4. Ajouter limite de taille (10MB) et nombre de fichiers (20)
5. Alerter l'utilisateur si extraction retourne du vide

---

#### AXE 6 : Stockage & Persistance du RAG

**Note : 3/10** | **Priorité : HAUTE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Merge fuzzy entreprises (85% similarité) | Zéro versioning / pas de rollback |
| Combined similarity (Levenshtein 60% + Jaccard 40%) | `itemsUpdated` toujours à 0 (TODO non implémenté) |
| Rejections utilisateur préservées | `conflicts` toujours vide |
| | Profil scalaire = "last wins" (nom mal extrait écrase le bon) |
| | Langues : "incoming overwrites" (B2 peut écraser C2) |
| | Pas de concurrency control (2 onglets = data perdue) |

**Impact Doctrine** : Violation de "Tout conserver" - des informations peuvent être écrasées sans historique.

**Corrections requises** :
1. Implémenter versioning RAG (table `rag_versions` avec diff)
2. Stratégie merge intelligente pour scalaires (garder le plus complet)
3. Pour langues : garder le niveau le plus élevé
4. Ajouter verrouillage optimiste (version counter)
5. Implémenter la détection de conflits

---

#### AXE 16 : Export PDF / JSON

**Note : 3/10** | **Priorité : HAUTE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| JSON export propre (CVData + widgets + metadata) | PDF perd les styles Tailwind dans l'iframe |
| downloadBlob gère Blob + Buffer | `exportCVToPDFWithHtml2Pdf` (meilleure méthode) = dead code |
| | Word export manque langues, certifications, clients |
| | Markdown export traite langues comme objet au lieu d'array |
| | Pas de multi-page (overflow hidden = contenu coupé) |
| | Loading state PDF reset après 1s quel que soit l'état |

**Impact Doctrine** : L'utilisateur ne peut pas exporter correctement son CV optimisé.

**Corrections requises** :
1. Utiliser Puppeteer/Playwright pour PDF (styles préservés)
2. Activer `exportCVToPDFWithHtml2Pdf` si meilleure qualité
3. Compléter Word export (langues, certifs, clients)
4. Corriger Markdown export pour langues (array)
5. Supporter multi-pages proprement

---

#### AXE 19 : Sécurité & Authentification

**Note : 3/10** | **Priorité : HAUTE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Auth systématique via `requireSupabaseUser` | Rate limiter in-memory (inutile sur serverless) |
| Bearer token extraction propre | Endpoints différents requêtent tables différentes pour tier |
| Tiers free/pro/team structurés | Cache tokens illimité en mémoire (memory leak) |
| PKCE flow côté client | Admin client utilisé au lieu de user client (bypass RLS) |
| | `debug: true` dans body = n'importe qui voit les internals |
| | Pas de validation format UUID sur analysisId |

**Impact Doctrine** : Risques de sécurité et d'abus de l'API.

**Corrections requises** :
1. Migrer rate limiting vers Upstash Redis
2. Unifier la récupération du tier utilisateur
3. Limiter le cache tokens (LRU avec TTL)
4. Supprimer ou protéger le mode debug
5. Valider les UUIDs avec Zod

---

#### AXE 21 : Transit & Suivi de la Data (DOCTRINE)

**Note : 3/10** | **Priorité : CRITIQUE**

**Pertes de données identifiées à chaque étape :**

| Étape | Perte |
|-------|-------|
| Upload → Extraction | CV scannés = vide (pas d'OCR), DOCX tables = structure perdue |
| Extraction → RAG | Troncature 100K tokens, cap 14 réalisations/exp, expansion IA peut évincer contenu explicite |
| RAG → Widgets | Compression si >50K tokens, github/portfolio exclus du contact, contexte_enrichi tronqué |
| Widgets → CVData | Projets totalement perdus, `contexte` et `technologies` pas dans CVData, score 0 gonflé à 50 |
| CVData → Template | Classic ignore linkedin/github/portfolio/soft_skills, seul Modern affiche secteurs clients |
| Traçabilité | Widget → RAG : partielle (sources optionnelles), RAG → Document : inexistante |

**Conformité Doctrine :**
- ❌ "Tout conserver, zéro doublon" : caps arbitraires, compressions, projets perdus
- ❌ "Reformulation qualité au RAG" : pas de correction orthographe
- ⚠️ "Tout scoré" : widgets scorés mais scoring IA non calibré + bugs
- ⚠️ "Contrôle utilisateur fin" : 7 sliders sur ~12 possibles
- ❌ "Traçable de bout en bout" : trous à chaque étape

**Corrections requises** :
1. Supprimer les caps arbitraires ou les rendre configurables
2. Ajouter champ `projects` dans CVData
3. Rendre `sources` obligatoire dans les widgets
4. Harmoniser les templates (tous affichent les mêmes champs)
5. Implémenter traçabilité RAG → Document original

---

#### AXE 23 : Options de Personnalisation

**Note : 3/10** | **Priorité : HAUTE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Score global + per-section avec toggle avancé | 5 options `limitsBySection` codées mais pas dans l'UI |
| Drag & drop réorganisation | `dense` mode hardcodé à false |
| Widget editor pour modifier les scores | `includePhoto` hardcodé à true |
| Template switcher instantané | Pas de réorganisation des sections |
| | Pas de toggle show/hide par section |
| | Pas de contrôle longueur du pitch |
| | Pas de sélection langue de sortie |
| | Pas de contrôle nombre de pages |
| | Pas de personnalisation couleurs/fonts |
| | Pas de fitting automatique à la page |

**Impact Doctrine** : Violation du pilier "Contrôle utilisateur total".

**Corrections requises** :
1. Exposer les 5 sliders `limitsBySection` dans l'UI (maxSkills, maxFormations, maxLanguages, maxCertifications, maxProjects)
2. Ajouter toggle pour `dense` mode
3. Ajouter toggle pour `includePhoto`
4. Ajouter réorganisation des sections par drag & drop
5. Ajouter toggle show/hide par section
6. Ajouter slider longueur pitch
7. Ajouter fitting automatique "tenir en 1 page"

---

### AXES MOYENS (Note 4-5/10) - Priorité MOYENNE

---

#### AXE 2 : Construction du RAG

**Note : 5/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Prompt d'extraction exige l'exhaustivité | Limites contradictoires ("max 15-20" vs "max 14") |
| Anti-hallucination avec `is_inferred` et `inference_justification` | Aucune validation Zod sur sortie Gemini |
| 3 modes de merge (creation, completion, regeneration) | `deduplicateRAG()` pas appelée automatiquement |
| `rejected_inferred` préservé à travers regenerations | "Expand 1 phrase en 6-12 réalisations" + cap 14 = infos explicites évincées |
| | Pas de retry si Gemini retourne JSON malformé |

**Corrections requises** :
1. Harmoniser les caps (un seul paramètre configurable)
2. Ajouter validation Zod sur sortie Gemini
3. Appeler `deduplicateRAG()` automatiquement après génération
4. Ajouter retry avec parsing JSON relaxé

---

#### AXE 3 : Normalisation & Nettoyage du RAG

**Note : 4/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Normalisation entreprises (~75 alias) | Aucune correction orthographique |
| IDs stables déterministes par hash | Aucune normalisation qualité texte |
| Consolidation clients (~160 entrées) | Levenshtein implémenté 3x dans 3 fichiers |
| Gestion multi-format dates | Deux fonctions `normalizeCompanyName` différentes |
| | Pas de standardisation certifications |
| | Niveaux de langues non standardisés |

**Corrections requises** :
1. Ajouter correction orthographique (LanguageTool ou équivalent)
2. Unifier les implémentations Levenshtein
3. Standardiser les certifications (PMP = "Project Management Professional (PMP)")
4. Standardiser les niveaux de langues (mapping vers CECRL)

---

#### AXE 5 : Quality Scoring du RAG

**Note : 4/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Approche 3 dimensions (complétude 30% / qualité 50% / impact 20%) | Quantification vérifie seulement `impact`, pas `description` |
| Détection chiffres robuste | Aucun scoring pour `contexte_enrichi` ni `projets` |
| | Skills ne compte que techniques (soft_skills = 0/20) |
| | Langues = scoring binaire (1 langue = 5 langues) |
| | Expériences saturent à 4 |

**Corrections requises** :
1. Vérifier quantification aussi dans les descriptions
2. Scorer `contexte_enrichi` et `projets`
3. Inclure soft_skills dans le scoring
4. Scoring progressif pour langues
5. Ne pas saturer les expériences

---

#### AXE 7 : Analyse d'Offre d'Emploi

**Note : 5/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| 3 inputs (fichier/image, URL, texte brut) | URL scraping cassé sur sites JS-rendered |
| Validation Zod complète du rapport de match | Pas de parsing structuré (années, salaire, contrat, remote) |
| Dégradation gracieuse si Zod partiel | Score 100% IA sans guardrail |
| `contexte_enrichi` injecté dans prompt match | Job description tronquée en base mais complète envoyée à l'IA |
| | Aucun cache (même offre = 2 appels IA) |

**Corrections requises** :
1. Utiliser Playwright pour scraping JS-rendered
2. Ajouter parsing structuré des offres
3. Ajouter guardrails sur le score (calibration)
4. Implémenter cache pour analyses d'offres

---

#### AXE 8 : Matching RAG vs Offre

**Note : 4/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Scoring sectoriel robuste (10 secteurs) | Deux systèmes de scoring déconnectés (IA vs déterministe) |
| Cap de +25 sur boost sectoriel | Détection sectorielle dupliquée avec logique différente |
| Récence gère postes actuels | `ExperienceForScoring` attend `date_debut/date_fin` mais RAG utilise `debut/fin` |
| | `contexte_enrichi` non utilisé dans scoring déterministe |
| | clients, certifications, langues, formations, projets jamais matchés |

**Corrections requises** :
1. Unifier les deux systèmes de scoring
2. Harmoniser les noms de champs dates
3. Utiliser `contexte_enrichi` dans le scoring
4. Matcher toutes les sections (clients, certifs, langues, etc.)

---

#### AXE 10 : Système de Scoring des Widgets

**Note : 4/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Score clampé 0-100 à chaque étape | Score 100% IA sans calibration |
| Boost sectoriel post-génération | **Bug `|| 50`** : score absent gonflé à 50 (confirmé dans le code) |
| Default 50 si score absent | Pas de guardrails (30% max des widgets à 90+) |
| | Boost sectoriel peut saturer le haut (95 + 10 → 100) |

**Bug confirmé** : Le code contient `widget.relevance_score || 50` à 6 endroits, gonflant artificiellement les scores manquants.

**Corrections requises** :
1. Remplacer `|| 50` par gestion explicite des scores manquants
2. Ajouter calibration du scoring IA
3. Implémenter guardrails de distribution
4. Éviter saturation du boost sectoriel

---

#### AXE 11 : Advanced Scoring Multi-Critères

**Note : 5/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| 5 dimensions (relevance 40%, ATS 30%, metrics 15%, recency 10%, seniority 5%) | **Bug recency** : calcule la DURÉE, pas l'ancienneté (confirmé) |
| ATS scoring solide (+20 par keyword manquant) | Scoring avancé désactivé si jobOffer absent |
| Metrics récompense la quantification | Seniority = heuristique fragile |
| | Poids non configurables par l'utilisateur |

**Bug confirmé** : `calculateRecencyScore` calcule `end - start` (durée de l'expérience) au lieu de `now - end` (ancienneté). Une expérience de 10 ans terminée hier reçoit score 20 au lieu de 100.

**Corrections requises** :
1. Corriger le calcul recency (ancienneté = now - end)
2. Activer scoring avancé même sans offre (mode générique)
3. Améliorer heuristique seniority
4. Rendre les poids configurables

---

#### AXE 12 : Bridge Client-Side (Widgets → CVData)

**Note : 5/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Toutes les sections majeures mappées | Projets complètement perdus (collectés puis jetés) |
| RAG enrichit les widgets manquants | Validation ne filtre plus rien (`validWidgets: widgets`) |
| Fallback RAG si Gemini oublie une expérience | Classification soft skills = keyword matching naïf |
| Nettoyage + déduplication clients robuste | Parsing header expérience fragile (split sur " - ") |
| | Bug `|| 50` dans ce fichier aussi |

**Corrections requises** :
1. Ajouter champ `projects` dans CVData et le mapper
2. Réactiver la validation des widgets
3. Améliorer classification soft skills
4. Robustifier parsing header expérience

---

#### AXE 13 : Contrôles Utilisateur & Filtrage

**Note : 5/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Score global slider (0-100) en temps réel | Pas de slider pour max skills, formations, langues, certifications |
| Filtrage avancé par section (6 sections) | Pas de toggle pour elevator pitch |
| Diagnostics panel | Poids scoring avancé non configurables |
| Drag & drop pour réordonner expériences | Pas de toggle certifications dans filtres avancés |
| Widget editor pour modifier scores | |

**Corrections requises** :
1. Ajouter les sliders manquants (voir Axe 23)
2. Ajouter toggle pitch (montrer/masquer, longueur)
3. Rendre les poids configurables
4. Ajouter toggle certifications

---

#### AXE 14 : Template Fitting A4

**Note : 4/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Dégradation fair (back-to-front par pertinence) | `DEFAULT_LIMITS` à 99/999 → `sliceToLimits` = no-op |
| Loss report transparent | `autoCompressCV` = dead code (jamais appelée) |
| Troncature respecte frontières de mots | Skills fitting coupe soft skills en premier |
| | Contenu peut toujours déborder après l'algo |
| | Format compact garde 1er bullet (pas forcément le meilleur) |

**Corrections requises** :
1. Définir des limites réalistes dans `DEFAULT_LIMITS`
2. Activer `autoCompressCV` ou supprimer le dead code
3. Ne pas prioriser soft skills en dernier
4. Garantir le non-débordement post-algo
5. Format compact : garder le bullet avec meilleur score

---

#### AXE 15 : Rendu des Templates

**Note : 5/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| 4 templates React avec rendu conditionnel | Incohérence entre templates (Classic ignore linkedin/github/portfolio/soft_skills) |
| Contrainte A4 (210mm × 297mm) bien appliquée | `sanitizeText()` copié-collé 4x identique |
| Photo avec fallback initiales | `console.log` en production dans ModernTemplate |
| Dense mode correctement implémenté | `_relevance_score` accédé via `as any` |
| | Seul ModernTemplate affiche secteurs clients |

**Corrections requises** :
1. Harmoniser les templates (tous affichent tous les champs)
2. Factoriser `sanitizeText()` dans un utilitaire
3. Supprimer les console.log
4. Typer `_relevance_score` proprement
5. Tous les templates affichent secteurs clients

---

#### AXE 17 : Système de Cache

**Note : 4/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Architecture 3 niveaux serveur + 2 client | Deux systèmes serveur concurrents avec clés incompatibles |
| Invalidation client par version | Clé L1 utilise `ragCompletenessScore` (float instable) |
| Cleanup localStorage | Pas d'invalidation cache quand RAG mis à jour |
| TTL cohérents | Client cache retry omet le champ `version` |
| | Tables L2/L3 peut-être non créées en base |

**Corrections requises** :
1. Unifier les systèmes de cache serveur
2. Ne pas utiliser de float dans les clés de cache
3. Invalider le cache lors des mises à jour RAG
4. Corriger le champ `version` dans retry client
5. Vérifier/créer les tables de cache

---

#### AXE 18 : Gestion d'Erreurs & Résilience

**Note : 4/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| RAG endpoint : cascade IA (Pro → Flash) avec 4 retries | Zéro retry dans endpoints CV (generate-widgets, generate-v2) |
| Error codes cohérents | Error tracking envoie `userId: "unknown"` et `durationMs: Date.now()` |
| Try/catch par étape dans generate-v2 | `error.message` brut exposé au client |
| `userMessage` user-friendly sur certaines erreurs | Tout-ou-rien : si étape 3/5 échoue, rien retourné |
| | Grounding validation = cosmétique (log + metadata, jamais bloquant) |

**Corrections requises** :
1. Ajouter retry dans endpoints CV
2. Corriger error tracking (userId, durationMs)
3. Ne pas exposer error.message brut
4. Retourner les résultats partiels si possible
5. Rendre grounding validation bloquante

---

#### AXE 20 : Architecture Globale & Séparation des Responsabilités

**Note : 5/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| RAG / CV / AI bien séparés dans lib/ | ~82K lignes de dead code (Method 1 entière) |
| Prompts centralisés dans prompts.ts | `ai-adapter.ts` = 930 lignes (trop gros) |
| Hooks single-purpose bien nommés | `lib/cv/index.ts` n'exporte que Method 1 |
| API routes groupées logiquement | 8+ console.log de debug en production |
| | 3 endpoints CV sans nettoyage |
| | Duplication : sanitizeText ×4, normalizeKey ×2, Levenshtein ×3 |

**Corrections requises** :
1. Supprimer ou isoler le dead code (Method 1)
2. Splitter `ai-adapter.ts` en modules
3. Mettre à jour `lib/cv/index.ts` pour V2
4. Supprimer console.log de production
5. Factoriser le code dupliqué

---

#### AXE 22 : Templates CV & Mapping des Données

**Note : 4/10** | **Priorité : MOYENNE**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Dates peuplées depuis RAG (multi-format) | 6+ champs fantômes sur expériences (`contexte`, `technologies`, `_relevance_score`, `actuel`) |
| Clients peuplés de sources multiples | `CVData` type ne reflète pas la réalité |
| | `contexte` et `technologies` uniquement via RAG fallback |
| | ClassicTemplate ignore linkedin/github/portfolio/soft_skills |
| | Seul ModernTemplate rend `clients_references.secteurs` |
| | Pas de champ `projects` dans CVData |

**Corrections requises** :
1. Ajouter les champs manquants au type `CVData`
2. Générer `contexte` et `technologies` dans les widgets
3. Harmoniser les templates
4. Ajouter `projects` dans CVData

---

### AXES CORRECTS (Note 6-7/10) - À Maintenir

---

#### AXE 4 : Enrichissement Contextuel

**Note : 7/10** | **Priorité : BASSE (maintenir)**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Séparation propre explicite/inféré (`contexte_enrichi`) | `soft_skills_deduites` référencé dans prompt mais absent du schéma |
| Seul endroit avec validation Zod de sortie IA | Pas de dédoublonnage skills explicites vs tacites |
| Non-bloquant (si échoue, pipeline continue) | Pas de contrôle utilisateur sur enrichissement |
| Confidence score obligatoire (min 60) + justification | Même modèle cher que l'extraction |

**Améliorations optionnelles** :
1. Ajouter `soft_skills_deduites` au schéma Zod
2. Dédoublonner skills explicites vs tacites
3. Permettre à l'utilisateur de rejeter une compétence tacite
4. Utiliser un modèle moins cher pour l'enrichissement

---

#### AXE 9 : Génération de Widgets IA

**Note : 6/10** | **Priorité : BASSE (maintenir)**

| Ce qui marche | Ce qui manque / est cassé |
|---------------|---------------------------|
| Couverture 8 catégories | Compression RAG >50K tokens peut perdre des données silencieusement |
| Anti-hallucination forte (sources obligatoires dans prompt) | Aucune vérification que TOUTES les expériences ont des widgets |
| Checklist explicite d'IDs d'expériences | `sources` optionnel dans schéma Zod |
| Validation Zod de l'envelope | `quality.grounded` optionnel et jamais vérifié |
| | `project_item` défini mais jamais traité par bridge |

**Améliorations optionnelles** :
1. Alerter si compression RAG appliquée
2. Vérifier couverture 100% des expériences
3. Rendre `sources` obligatoire
4. Vérifier `quality.grounded`
5. Traiter `project_item` dans le bridge

---

## 3. TABLEAU RÉCAPITULATIF

| # | Axe | Note | Priorité | Problèmes Clés |
|---|-----|------|----------|----------------|
| 1 | Import & Extraction | 3/10 | HAUTE | Pas d'OCR, pas de DOC/RTF/ODT |
| 2 | Construction RAG | 5/10 | MOYENNE | Caps contradictoires, pas de validation Zod |
| 3 | Normalisation RAG | 4/10 | MOYENNE | Pas de correction ortho, code dupliqué |
| 4 | Enrichissement Contextuel | 7/10 | BASSE | Bon - à maintenir |
| 5 | Quality Scoring RAG | 4/10 | MOYENNE | Scoring incomplet, saturation |
| 6 | Stockage & Persistance | 3/10 | HAUTE | Pas de versioning, merge fragile |
| 7 | Analyse Offre | 5/10 | MOYENNE | Scraping JS cassé, pas de cache |
| 8 | Matching RAG vs Offre | 4/10 | MOYENNE | 2 systèmes déconnectés, champs dates |
| 9 | Génération Widgets IA | 6/10 | BASSE | Bon - compression silencieuse |
| 10 | Scoring Widgets | 4/10 | MOYENNE | Bug `\|\| 50`, pas de calibration |
| 11 | Advanced Scoring | 5/10 | MOYENNE | Bug recency (durée vs ancienneté) |
| 12 | Bridge Client-Side | 5/10 | MOYENNE | Projets perdus, validation désactivée |
| 13 | Contrôles Utilisateur | 5/10 | MOYENNE | Sliders manquants |
| 14 | Template Fitting A4 | 4/10 | MOYENNE | Limites no-op, dead code |
| 15 | Rendu Templates | 5/10 | MOYENNE | Incohérences entre templates |
| 16 | Export PDF/JSON | 3/10 | HAUTE | PDF perd styles, Word incomplet |
| 17 | Système de Cache | 4/10 | MOYENNE | 2 systèmes concurrents |
| 18 | Gestion Erreurs | 4/10 | MOYENNE | Zéro retry endpoints CV |
| 19 | Sécurité | 3/10 | HAUTE | Rate limiter serverless inutile |
| 20 | Architecture Globale | 5/10 | MOYENNE | ~82K dead code, duplication |
| 21 | Transit Data (Doctrine) | 3/10 | CRITIQUE | Pertes à chaque étape |
| 22 | Templates & Mapping | 4/10 | MOYENNE | Champs fantômes, CVData incomplet |
| 23 | Personnalisation | 3/10 | HAUTE | 5 options codées non exposées |

**Moyenne : 4.1/10**

---

## 4. PLAN D'ACTION PRIORISÉ

### Phase 1 : Corrections CRITIQUES (Axes à 3/10)

**Objectif** : Atteindre conformité doctrine minimale

#### Sprint 1.1 : Transit Data & Doctrine (Axe 21)
- [ ] Supprimer les caps arbitraires ou les rendre configurables
- [ ] Ajouter champ `projects` dans `CVData` et le mapper
- [ ] Rendre `sources` obligatoire dans les widgets (schéma Zod)
- [ ] Harmoniser les templates (tous affichent tous les champs)

#### Sprint 1.2 : Import & Extraction (Axe 1) - PARTIELLEMENT TERMINÉ
- [ ] Ajouter validation types MIME avant upload
- [x] Implémenter OCR ✅ (`lib/ocr/tesseract-ocr.ts` avec Tesseract.js)
- [x] Ajouter support DOCX/RTF ✅ (`lib/parsers/office-parser.ts` avec mammoth)
- [ ] Support DOC/ODT (requiert LibreOffice serveur)
- [ ] Alerter si extraction retourne du vide

#### Sprint 1.3 : Stockage RAG (Axe 6)
- [ ] Implémenter versioning RAG (table `rag_versions`)
- [ ] Stratégie merge intelligente (garder le plus complet)
- [ ] Verrouillage optimiste (version counter)

#### Sprint 1.4 : Export (Axe 16)
- [ ] Migrer vers Puppeteer pour PDF (styles préservés)
- [ ] Compléter Word export (langues, certifs, clients)
- [ ] Corriger Markdown export (langues array)

#### Sprint 1.5 : Sécurité (Axe 19)
- [ ] Migrer rate limiting vers Upstash Redis
- [ ] Supprimer/protéger mode debug
- [ ] Valider UUIDs avec Zod

#### Sprint 1.6 : Personnalisation (Axe 23) - PARTIELLEMENT TERMINÉ
- [x] Exposer les 5 sliders `limitsBySection` dans l'UI ✅ (session précédente)
- [x] Ajouter toggle `dense` mode ✅ (session précédente)
- [x] Ajouter toggle `includePhoto` ✅ (session précédente)
- [x] Ajouter fitting automatique 1 page ✅ (`lib/cv/auto-fit.ts`)

---

### Phase 2 : Corrections IMPORTANTES (Axes 4-5/10)

**Objectif** : Améliorer qualité et fiabilité

#### Sprint 2.1 : Bugs Critiques
- [ ] **Corriger bug `|| 50`** : Remplacer par gestion explicite (6 fichiers)
- [ ] **Corriger bug recency** : `now - end` au lieu de `end - start`
- [ ] Activer `deduplicateRAG()` automatiquement après génération

#### Sprint 2.2 : Scoring & Matching (Axes 8, 10, 11)
- [ ] Unifier les deux systèmes de scoring (IA + déterministe)
- [ ] Harmoniser noms de champs dates (`debut/fin` vs `date_debut/date_fin`)
- [ ] Ajouter calibration du scoring IA
- [ ] Rendre les poids configurables par l'utilisateur

#### Sprint 2.3 : Construction RAG (Axes 2, 3)
- [ ] Harmoniser les caps (un seul paramètre)
- [ ] Ajouter validation Zod sur sortie Gemini
- [ ] Unifier les implémentations Levenshtein (3 → 1)
- [ ] Standardiser niveaux de langues (CECRL)

#### Sprint 2.4 : Bridge & Templates (Axes 12, 15, 22)
- [ ] Réactiver validation des widgets
- [ ] Factoriser `sanitizeText()` dans un utilitaire
- [ ] Ajouter les champs manquants au type `CVData`
- [ ] Harmoniser tous les templates

#### Sprint 2.5 : Cache & Erreurs (Axes 17, 18)
- [ ] Unifier les systèmes de cache serveur
- [ ] Ajouter retry dans endpoints CV
- [ ] Ne pas exposer `error.message` brut

#### Sprint 2.6 : Architecture (Axe 20) - PARTIELLEMENT TERMINÉ
- [x] Supprimer dead code deprecated ✅ (`DynamicLimits`, `calculateDynamicLimits`)
- [ ] Splitter `ai-adapter.ts` en modules (971 lignes restantes)
- [ ] Supprimer les console.log de production

---

### Phase 3 : Optimisations (Axes 6-7/10)

**Objectif** : Excellence et polish

#### Sprint 3.1 : Enrichissement (Axe 4)
- [ ] Ajouter `soft_skills_deduites` au schéma Zod
- [ ] Dédoublonner skills explicites vs tacites
- [ ] Permettre rejet de compétence tacite

#### Sprint 3.2 : Génération Widgets (Axe 9)
- [ ] Alerter si compression RAG appliquée
- [ ] Vérifier couverture 100% des expériences
- [ ] Rendre `sources` obligatoire
- [ ] Traiter `project_item` dans le bridge

---

### Phase 4 : Intégration Reactive Resume (NOUVEAU)

**Objectif** : Améliorer l'export PDF et bénéficier de l'écosystème open-source

#### Sprint 4.1 : Export PDF via Chromium Headless
- [x] Auditer l'implémentation Puppeteer existante (`app/api/cv/[id]/pdf/route.ts`) ✅
- [x] Corriger les problèmes de styles perdus dans l'export PDF ✅ (overflow:visible, break-inside-avoid)
- [x] Implémenter le support multi-pages proprement ✅ (CSS @page + break rules)
- [ ] Optionnel : Évaluer le service Printer de Reactive Resume

#### Sprint 4.2 : Adoption Templates Reactive Resume ✅ TERMINÉ
- [x] Évaluer les 13 templates Reactive Resume (MIT License) ✅
- [x] Adapter 3 templates au format CVData ✅ (Onyx, Pikachu, Bronzor)
- [x] Créer convertisseur `convertToRRSchema()` ✅ (`lib/cv/reactive-resume-converter.ts`)
- [x] Intégrer dans CVRenderer et TEMPLATES registry ✅

**Templates ajoutés** :
- Onyx (sidebar professionnel)
- Pikachu (header coloré moderne)
- Bronzor (minimaliste élégant)

#### Sprint 4.3 : Export JSON Resume (Interopérabilité) ✅ TERMINÉ
- [x] Implémenter export vers JSON Resume standard ✅ (`lib/cv/json-resume-converter.ts`)
- [x] Implémenter import depuis JSON Resume ✅ (`convertFromJSONResume()`)
- [x] Stocker les métadonnées CV-Crush dans extensions ✅ (`meta.cvCrush`)
- [x] API endpoints créés ✅ (`/api/cv/[id]/json-resume`, `/api/cv/import-json-resume`)

**Architecture hybride implémentée** :
```
CVData (riche) → Scoring/Filtrage → Preview → Validation utilisateur
                                                       ↓
                                            convertToJSONResume()
                                                       ↓
                                            Templates RR (futur)
```

**Référence** : https://github.com/amruthpillai/reactive-resume (34.9k stars, MIT License)

---

### Annexe E : Format JSON Resume - Analyse

#### Pour
| Avantage | Détail |
|----------|--------|
| Standard ouvert | Reconnu par LinkedIn, Indeed, 50+ outils |
| Interopérabilité | Import/export universel |
| Schema validé | Validation JSON Schema officielle |
| Écosystème | 100+ thèmes compatibles |
| Portabilité | L'utilisateur garde son CV partout |

#### Contre
| Inconvénient | Détail |
|--------------|--------|
| Moins flexible | Pas de champs custom natifs |
| Migration | Conversion données existantes requise |
| Widgets IA | Non prévu dans le standard |
| Metadata | Scoring/traçabilité via extensions |

#### Recommandation
**Approche hybride** :
- Garder le format interne riche (scoring, sources, contexte_enrichi)
- Ajouter export JSON Resume pour interopérabilité
- Utiliser les extensions JSON Resume pour les métadonnées CV-Crush

---

## 5. EXCLUSIONS

### API LinkedIn

**Décision** : Non implémentée

**Raison** : Coût élevé de l'API LinkedIn (abonnement payant requis)

**Alternative** : L'export PDF depuis LinkedIn est suffisant et gratuit
- L'utilisateur exporte son profil LinkedIn en PDF
- Il l'uploade comme n'importe quel autre document
- L'extraction PDF fonctionne correctement pour ce format

---

## 6. ANNEXES

### Annexe A : Bugs Confirmés dans le Code

#### Bug 1 : Score `|| 50` - CORRIGÉ ✅

**Localisation** : 6 fichiers, 6 occurrences

```typescript
// AVANT (BUGUÉ)
Math.min(100, (widget.relevance_score || 50) + applySectorScoringBoost(...))
const relevanceScore = widget.relevance_score || 50;

// APRÈS (CORRIGÉ)
Math.min(100, (widget.relevance_score ?? 0) + applySectorScoringBoost(...))
const relevanceScore = widget.relevance_score ?? 0;
```

**Correction appliquée** : Tous les `|| 50` remplacés par `?? 0` dans :
- `lib/cv/generate-widgets.ts`
- `lib/cv/advanced-scoring.ts`
- `lib/cv/hybrid-generator.ts`

---

#### Bug 2 : Calcul Recency - CORRIGÉ ✅

**Localisation** : `lib/cv/advanced-scoring.ts`

```typescript
// AVANT (BUGUÉ) - Calculait la DURÉE
const months = (end - start);
yearsAgo = months / 12;

// APRÈS (CORRIGÉ) - Calcule l'ANCIENNETÉ
const end = exp.actuel || !exp.fin ? new Date() : new Date(exp.fin || exp.date_fin);
const now = new Date();
const monthsAgo = (now - end);
yearsAgo = monthsAgo / 12;
if (exp.actuel) return 100; // Expérience actuelle = score max
```

**Correction appliquée** : La fonction `calculateRecencyScore` calcule maintenant correctement le temps écoulé depuis la fin de l'expérience.

---

### Annexe B : Options `limitsBySection` - CORRIGÉ ✅

**Localisation** : `app/dashboard/cv-builder/page.tsx`

**Toutes les options sont maintenant exposées dans l'UI** :
- ✅ `maxSkills` - Slider ajouté (0-30)
- ✅ `maxFormations` - Slider ajouté (0-10)
- ✅ `maxLanguages` - Slider ajouté (0-10)
- ✅ `maxCertifications` - Slider ajouté (0-15)
- ✅ `maxProjects` - Slider ajouté (0-10)
- ✅ `maxClientsPerExperience` - Slider existant
- ✅ `maxClientsReferences` - Slider existant

**Toggles ajoutés** :
- ✅ `includePhoto` - Toggle pour afficher/masquer la photo
- ✅ `denseMode` - Toggle pour mode compact

---

### Annexe C : Fichiers de Code Dupliqué - PARTIELLEMENT CORRIGÉ

| Fonction | Fichiers | Statut |
|----------|----------|--------|
| `sanitizeText()` | 4 templates | ✅ Factorisé dans `lib/cv/sanitize-text.ts` |
| `normalizeKey()` | 2 fichiers | ⏳ À faire |
| Levenshtein | 3 fichiers | ✅ `fuzzy-matcher.ts` utilise maintenant `string-similarity.ts` |
| `normalizeCompanyName()` | 2 fichiers | ⏳ À unifier |

---

### Annexe D : Glossaire

| Terme | Définition |
|-------|------------|
| **RAG** | Retrieval Augmented Generation - Structure de données enrichie du profil utilisateur |
| **Widget** | Élément de contenu scoré généré par l'IA (bullet point, skill, formation, etc.) |
| **Bridge** | Module de conversion widgets → CVData côté client |
| **CVData** | Structure de données consommée par les templates de rendu |
| **Doctrine** | Ensemble des 5 piliers fondamentaux de CV-Crush |
| **ATS** | Applicant Tracking System - Logiciel de tri automatique de CV |
| **CECRL** | Cadre Européen Commun de Référence pour les Langues (A1-C2) |

---

**FIN DU CDC - 23 AXES DE GÉNÉRATION CV**

Version : 1.0  
Date : 1er février 2026  
Statut : Prêt pour implémentation

