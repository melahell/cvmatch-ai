# Types du projet CV-Crush

Ce dossier centralise les définitions TypeScript liées au RAG, au profil et aux CV.

## RAG (données profil / contexte)

### `rag-complete.ts` — Schéma RAG stocké

**Source de vérité pour les données RAG persistées.** Le type principal est le schéma ultra-complet (profil, expériences, compétences, formations, clients, certifications, etc.). C’est ce schéma qui est utilisé pour le stockage et la récupération du contexte utilisateur.

- Utilisé par : API RAG (generate, update, versions), merge, déduplication, stockage Supabase.

### `rag.ts` — Types de base RAG

Types réutilisables pour le RAG : `Competences`, `CompetencesExplicit`, `CompetencesInferred`, `Experience`, `InferredSkill`, etc. Format plus léger que RAGComplete, utilisé pour les échanges et les traitements intermédiaires.

- Utilisé par : builders CV, normalisation, composants qui consomment du RAG sans besoin du schéma complet.

### `rag-contexte-enrichi.ts` — Contexte enrichi et options induites

- **ContexteEnrichi** : responsabilités implicites, compétences tacites, environnement de travail (données déduites du RAG explicite).
- **InducedDataOptions** : options de filtrage pour la génération de CV (mode `all` / `high_confidence` / `none`, seuil de confiance, inclusion responsabilités/compétences tacites/env de travail).

Utilisé par : **generate-v2** (API CV), UI profil et tout flux qui combine RAG + données induites pour produire un CV.

---

## CV

### `cv-optimized.ts` — Schéma CV optimisé

Schéma pour les CV générés « optimisés » : pertinence par expérience, quantifications structurées, keywords ATS, métadonnées de génération (template, niveau de séniorité, secteur, etc.).

- Utilisé par : génération de CV ciblés, scoring ATS, exports.

### Type CV éditeur / rendu

Le type **CVData** utilisé par l’éditeur et le rendu des templates (données personnelles, compétences, expériences au format écran) est défini dans **`@/components/cv/templates`**, pas dans ce dossier. Voir `components/cv/templates/index.ts` et les types associés aux templates.

---

## Autres

### `index.ts`

Exporte **UserProfile**, **JobAnalysis** et d’autres types métier (analyse de poste, matching, etc.). Point d’entrée pour les types « app » hors RAG/CV.

---

## Résumé des imports courants

| Besoin                         | Fichier à importer              |
|--------------------------------|----------------------------------|
| Données RAG stockées / complètes | `@/types/rag-complete`           |
| Types de base RAG (Experience, Competences…) | `@/types/rag`                    |
| Contexte enrichi + options induites | `@/types/rag-contexte-enrichi`   |
| Schéma CV optimisé / génération | `@/types/cv-optimized`           |
| Données CV éditeur (écran)     | `@/components/cv/templates`      |
| Profil utilisateur / analyse job | `@/types` ou `@/types/index`     |
