# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

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
