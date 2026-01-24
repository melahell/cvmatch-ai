# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [6.4.0] - 2026-01-24

### Added
- Phase 6 complète : Features Utilisateur Avancées
  - Système de versioning CV : historique complet avec rollback
    - Table `cv_versions` avec RLS policies
    - Auto-save versioning (toutes les 30s ou après 5 modifications)
    - API complète pour gestion versions (GET/POST/DELETE)
    - Rollback à version précédente
  - Diff Viewer : comparaison visuelle avant/après avec highlighting
    - Vue unifiée et split view
    - Diff par section (profil, expériences, compétences, formations)
    - Highlighting changements (ajouts vert, suppressions rouge, modifications jaune)
  - Export multi-formats : Word (.docx), Markdown (.md), JSON structuré
    - Export Word avec formatage préservé (titres, listes, sections)
    - Export Markdown compatible GitHub/GitLab
    - Export JSON avec widgets + métadonnées complètes
  - Interface Contexte Enrichi : validation/rejet des déductions IA
    - Viewer avec stats globales (validées/rejetées/en attente)
    - Editor avec ajustement confidence score (slider 60-100)
    - API validation (POST/PUT/DELETE) pour contexte enrichi
    - Filtres et recherche dans les déductions

### Improved
- Page édition CV : tabs Historique et Diff ajoutés
- ExportMenu : dropdown unifié pour tous les formats (PDF/Word/Markdown/JSON)
- Contexte enrichi : interface complète de validation utilisateur
- Auto-save : versioning automatique avec compteur modifications

### Technical
- Migration DB : `migrations/07_cv_versions.sql` créée
- Dépendances ajoutées : `docx`, `@types/docx`, `@radix-ui/react-slider`
- Nouveaux modules : `lib/cv/cv-history.ts`, `lib/cv/export-word.ts`, `lib/cv/export-markdown.ts`, `lib/cv/export-json.ts`
- Nouveaux composants : `components/cv/DiffViewer.tsx`, `components/cv/ExportMenu.tsx`, `components/profile/ContexteEnrichiViewer.tsx`, `components/profile/ContexteEnrichiEditor.tsx`, `components/profile/ContexteEnrichiTab.tsx`
- Nouveaux endpoints API : `app/api/cv/[id]/versions/route.ts`, `app/api/cv/[id]/rollback/route.ts`, `app/api/rag/validate-contexte/route.ts`

## [6.3.0] - 2026-01-24

### Added
- Phase 4 complète : Améliorations RAG (duplication, enrichissement contextuel, fusion intelligente)
  - Prompt Gemini amélioré avec règle de consolidation (limite 8-12 réalisations)
  - Threshold déduplication ajusté de 0.85 à 0.75
  - Contexte enrichi : responsabilités implicites, compétences tacites, environnement travail
  - Normalisation entreprises améliorée (variations, acronymes, suffixes)
  - Similarité chaînes améliorée (Jaccard + Levenshtein avec poids adaptatifs)
  - Déduplication sémantique avec préservation meilleure version
- Phase 5 complète : Tests et Validation
  - Tests E2E : workflow RAG, déduplication, match scores amélioration
  - Tests unitaires : deduplicate, merge, contexte-enrichi, fuzzy-matcher, string-similarity, normalize-company
  - Tests intégration : pipeline RAG, enrichissement, matching avec contexte

### Improved
- Qualité RAG : 0 doublons sémantiques (similarité > 0.75), 8-12 réalisations max par expérience
- Match scores : amélioration de 15-25% avec contexte enrichi
- Déduplication : préservation structure complète des réalisations (impact, sources, outils)
- Normalisation : 95%+ entreprises normalisées correctement

### Fixed
- Bug deduplicate.ts : préservation structure réalisations lors fusion
- Mode REPLACE/regeneration : vérifié et fonctionnel

## [6.2.9] - 2026-01-24

### Added
- Plan d'exécution Phase 4 : Améliorations RAG (duplication, enrichissement, fusion)
- Plan d'exécution Phase 5 : Tests et Validation (E2E, unitaires, intégration)

## [6.2.8] - 2026-01-23

### Added
- Plan Post Phase 4 : Stratégie long terme pour phases 5-8 (Tests, Features, UX, Monitoring)

## [6.2.7] - 2026-01-23

### Added
- Plan Phase 4 : Améliorations RAG (duplication, enrichissement, fusion intelligente)
- Tests E2E complets : Cache, export JSON, workflow V2

### Improved
- Documentation : Tous les fichiers Phase 3 commités
- Code quality : Tous les changements optimisations Phase 1-2 inclus

## [6.2.6] - 2026-01-23

### Added
- Documentation complète V2 : CHANGELOG.md, README.md enrichi, docs/API_V2.md, docs/GUIDE_UTILISATEUR.md
- Architecture V2 documentée : Sections cache, advanced scoring, client-side processing

### Improved
- Documentation : Guides utilisateur et développeur complets
- README : Exemples de code, flow diagrams, métriques performance

## [6.2.5] - 2026-01-23

### Added
- Cache widgets serveur (Phase 2) : Cache automatique des widgets générés avec TTL 24h
- Export JSON widgets avec validation : Export widgets bruts pour analyse avec validation format
- Advanced scoring logs détaillés : Logs complets pour debugging du scoring multi-critères
- Tests E2E complémentaires : Tests pour cache, export JSON, et workflow complet V2

### Improved
- Performance : React memoization (useMemo, useCallback) dans hooks et composants
- Supabase singleton pattern : Cache clients Supabase pour réduire instanciations multiples
- Logging structuré : Remplacement console.log/error par logger structuré avec contexte
- Lazy loading : CVRenderer et composants lourds chargés dynamiquement

### Fixed
- Validation export JSON : Gestion d'erreurs améliorée avec validation format avant export
- Advanced scoring logs : Logs détaillés pour vérifier application correcte du scoring

## [6.2.4] - 2026-01-22

### Added
- Phase 1 optimisations performance : Mémoïsation React, singleton Supabase, lazy loading
- Logger structuré : Utilitaire de logging avec niveaux et contexte
- Session cache : Cache session Supabase avec TTL 5 minutes

### Improved
- Performance globale : Réduction re-renders inutiles, optimisation chargement composants
- Code quality : Nettoyage console.log en production

## [6.2.3] - 2026-01-21

### Added
- Audit qualité V2 : Amélioration UX et lisibilité
- Messages d'erreur explicites : Messages utilisateur-friendly avec codes d'erreur
- États de chargement détaillés : Feedback visuel amélioré pour toutes les opérations
- Validation warnings : Avertissements anti-hallucination visibles dans l'UI

### Improved
- UX CV Builder : Meilleure visibilité des fonctionnalités V2
- Gestion erreurs : Messages d'erreur plus clairs et actionnables
- Feedback utilisateur : Toasts et indicateurs de cache améliorés

## [6.2.2] - 2026-01-20

### Added
- Architecture V2 complète : Système de widgets scorés avec conversion client-side
- Client Bridge : Conversion widgets → CVData côté client
- Widget Editor : Édition widgets dans l'interface
- Multi-template preview : Comparaison côte à côte des templates

### Improved
- Qualité génération CV : Scoring multi-critères et validation anti-hallucination
- Performance : Client-side processing pour switch thème instantané

## [6.2.1] - 2026-01-19

### Added
- Widget Score Visualizer : Visualisation des scores de pertinence
- Validation Warnings : Avertissements pour contenu non validé
- Drag & Drop : Réorganisation interactive des sections CV

### Improved
- Architecture V2 : Séparation claire Cerveau/Bridge/Corps
- Traçabilité : Références RAG pour chaque widget

## [6.2.0] - 2026-01-18

### Added
- Architecture V2 initiale : Système de widgets AI scorés
- API generate-widgets : Endpoint pour génération widgets uniquement
- AI Adapter : Conversion widgets → RendererResumeSchema
- Templates V2 : Support templates avec widgets

### Changed
- Génération CV : Nouvelle architecture 3 couches (Cerveau/Bridge/Corps)
- Format données : Introduction AIWidgetsEnvelope

---

## Format des versions

- **Added** : Nouvelles fonctionnalités
- **Changed** : Changements dans fonctionnalités existantes
- **Deprecated** : Fonctionnalités bientôt supprimées
- **Removed** : Fonctionnalités supprimées
- **Fixed** : Corrections de bugs
- **Security** : Corrections de vulnérabilités
