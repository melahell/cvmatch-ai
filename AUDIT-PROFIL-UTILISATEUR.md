# AUDIT COMPLET - Systeme de Profil Utilisateur CVMatch AI

**Date**: 2026-02-06
**Scope**: Creation profil, matching offre, generation CV, donnees induites

---

## 1. CATEGORIES DU PROFIL UTILISATEUR

Le profil utilisateur (`RAGMetadata` - `types/rag.ts:102-124`) est compose de **11 categories** :

| # | Categorie | Source | Fichier |
|---|-----------|--------|---------|
| 1 | **Profil (identite)** | Explicite | `types/rag.ts:53-65` |
| 2 | **Experiences** | Explicite | `types/rag.ts:31-44` |
| 3 | **Competences explicites** (techniques + soft_skills) | Explicite | `types/rag.ts:11-14` |
| 4 | **Competences inferees** (techniques + tools + soft_skills) | Explicite/Induit | `types/rag.ts:16-20` |
| 5 | **Formations** | Explicite | `types/rag.ts:46-51` |
| 6 | **Langues** | Explicite | `types/rag.ts:107` |
| 7 | **Projets** | Explicite | `types/rag.ts:67-74` |
| 8 | **Certifications** | Explicite | `types/rag.ts:109` |
| 9 | **References / Clients** | Explicite | `types/rag.ts:92-100` |
| 10 | **Contexte enrichi (INDUIT)** | Induit par IA | `types/rag-contexte-enrichi.ts:1-29` |
| 11 | **Quality metrics** | Calcule | `types/rag.ts:76-83` |

### Detail du contexte enrichi (induit) - 3 sous-categories :
- **Responsabilites implicites** : description + justification + confidence (60-100)
- **Competences tacites** : nom + type (technique/soft_skill/methodologie) + justification + confidence
- **Environnement de travail** : taille_equipe, contexte_projet, outils_standards

---

## 2. AUDIT MATCHING PROFIL vs OFFRE D'EMPLOI

Le matching (`getMatchAnalysisPrompt()` - `lib/ai/prompts.ts:647-740`) envoie le profil RAG complet en JSON a Gemini.

| # | Categorie | Utilise | Comment |
|---|-----------|:-------:|---------|
| 1 | Profil (identite) | OUI | JSON global |
| 2 | Experiences | OUI | JSON global |
| 3 | Competences explicites | OUI | JSON global |
| 4 | Competences inferees | OUI | JSON global |
| 5 | Formations | OUI | JSON global |
| 6 | Langues | OUI | JSON global |
| 7 | Projets | OUI | JSON global |
| 8 | Certifications | OUI | JSON global |
| 9 | References / Clients | OUI | JSON global |
| 10 | **Contexte enrichi** | **OUI** | **Section dediee** dans le prompt (lignes 648-668) |
| 11 | Quality metrics | NON | Metadonnee interne, pas pertinent pour le matching |

**Score : 10/11 categories (91%)**

Le contexte enrichi a une section dediee avec instruction explicite d'utiliser les responsabilites implicites et competences tacites comme atouts supplementaires.

---

## 3. AUDIT GENERATION DE CV

### Pipeline 1 : AI Widgets (V2 - principal) - `prompts.ts:380-644` + `ai-adapter.ts`

| # | Categorie | Traitee | Importance |
|---|-----------|:-------:|:----------:|
| 1 | Profil (identite) | OUI | HAUTE |
| 2 | Experiences | OUI | TRES HAUTE |
| 3 | Competences explicites | OUI | HAUTE |
| 4 | Competences inferees | **PARTIEL** | MOYENNE |
| 5 | Formations | OUI | MOYENNE |
| 6 | Langues | OUI | MOYENNE |
| 7 | Projets | OUI | MOYENNE |
| 8 | Certifications | OUI | MOYENNE |
| 9 | References / Clients | OUI | HAUTE |
| 10 | **Contexte enrichi** | **PARTIEL** | FAIBLE |

### Pipeline 2 : CV Optimization V2 (4 blocs) - `prompts.ts:745-1065`

| # | Categorie | Traitee | Importance |
|---|-----------|:-------:|:----------:|
| 1 | Profil (identite) | OUI | HAUTE |
| 2 | Experiences | OUI | TRES HAUTE |
| 3 | Competences | OUI | HAUTE |
| 4 | Formations | OUI | HAUTE |
| 5 | Langues | OUI | MOYENNE |
| 6 | Certifications | OUI | HAUTE |
| 7 | References / Clients | OUI | HAUTE |
| 8 | **Projets** | **ABSENT** | MANQUANT |
| 9 | **Contexte enrichi** | **PARTIEL** | FAIBLE |

---

## 4. AUDIT PARTIE "INDUITE" (Contexte Enrichi)

### 4.1 Generation

- **Fichier** : `lib/rag/contexte-enrichi.ts:68-104`
- **Prompt** : `lib/ai/prompts.ts:1116-1198`
- Le RAG complet est analyse par Gemini
- Chaque deduction a une justification (citation exacte) et un score de confiance (60-100)
- Validation Zod stricte
- L'utilisateur peut valider/rejeter chaque element

### 4.2 Devenir dans le CV

#### Competences tacites (`ai-adapter.ts:712-730`) :
- **INCLUSES** dans le CV avec seuils de confiance :
  - soft_skill : incluses si confidence >= 80
  - technique/methodologie : incluses si confidence >= 70
- Ajoutees a la liste des competences du CV
- Les competences rejetees par l'utilisateur sont exclues

#### Soft skills deduites (`ai-adapter.ts:732-736`) :
- **INCLUSES** directement dans les soft_skills du CV

#### Responsabilites implicites :
- **NON TRAITEES** dans `ai-adapter.ts` - jamais injectees dans le CV

#### Environnement de travail :
- **NON TRAITE** dans `ai-adapter.ts` - jamais injecte dans le CV

#### Dans le prompt CV V2 (`prompts.ts:930-933`) :
- Autorise pour enrichir le vocabulaire mais sans traitement structure
- Laisse Gemini decider, pas de garantie d'exploitation

---

## 5. PROBLEMES IDENTIFIES

| Severite | Probleme | Detail |
|----------|----------|--------|
| **CRITIQUE** | Responsabilites implicites perdues dans le CV | Generees et stockees mais jamais injectees dans le pipeline CV (`ai-adapter.ts` ne les traite pas) |
| **IMPORTANT** | Environnement de travail perdu dans le CV | Genere mais non utilise dans la generation CV |
| **IMPORTANT** | Projets absents du Pipeline CV V2 | Le schema de sortie du bloc 4 (`prompts.ts:949-1037`) n'a pas de section projets |
| **MOYEN** | Competences inferees non explicitement traitees dans prompt Widgets | Le prompt mentionne le contexte enrichi en section 8 mais pas les `competences.inferred` directement |
| **FAIBLE** | Seuils de confidence inconsistants | Matching: pas de seuil, CV widgets: 70-80, contexte enrichi: 60 minimum |

---

## 6. TABLEAU RECAPITULATIF

| Categorie | Profil | Matching | CV Widgets | CV V2 | Score |
|-----------|:------:|:--------:|:----------:|:-----:|:-----:|
| Profil/Identite | 100% | 100% | 100% | 100% | **100%** |
| Experiences | 100% | 100% | 100% | 100% | **100%** |
| Competences explicites | 100% | 100% | 100% | 100% | **100%** |
| Competences inferees | 100% | 100% | 70% | 80% | **88%** |
| Formations | 100% | 100% | 100% | 100% | **100%** |
| Langues | 100% | 100% | 100% | 100% | **100%** |
| Projets | 100% | 100% | 100% | 0% | **75%** |
| Certifications | 100% | 100% | 100% | 100% | **100%** |
| References/Clients | 100% | 100% | 100% | 100% | **100%** |
| Resp. implicites (induit) | 100% | 100% | 0% | ~30% | **58%** |
| Comp. tacites (induit) | 100% | 100% | 80% | ~30% | **78%** |
| Env. travail (induit) | 100% | 100% | 0% | 0% | **50%** |

### Score global de couverture : **87%**

La partie induite est le principal point faible : bien generee, bien utilisee dans le matching, mais sous-exploitee dans la generation de CV.
