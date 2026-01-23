# Actions Disponibles dans CV Builder V2

## Accès au CV Builder

### Depuis la page d'analyse d'emploi
1. Aller sur `/dashboard/analyze/[id]` (page de résultat d'analyse)
2. Cliquer sur le bouton **"Générer avec V2 (Widgets)"** (bouton avec icône Sparkles)
3. Redirection automatique vers `/dashboard/cv-builder?analysisId=[id]`

## Actions Disponibles dans le CV Builder

### 1. Génération Widgets (Automatique)
- **Action** : Les widgets sont générés automatiquement au chargement de la page
- **Source** : API `/api/cv/generate-widgets`
- **Cache** : Les widgets sont sauvegardés dans localStorage (24h)
- **Indicateur** : Badge "X widgets" dans le header

### 2. Switch Thème Instantané
- **Action** : Cliquer sur un template dans la sidebar (Modern, Tech, Classic, Creative)
- **Performance** : <100ms (pas de re-génération, conversion côté client uniquement)
- **Cache** : Chaque template est mis en cache dans sessionStorage
- **Résultat** : Le CV se met à jour instantanément

### 3. Preview Multi-Thèmes Comparatif
- **Action** : Cliquer sur "Comparer templates" dans le header
- **Fonctionnalité** : Affichage côte à côte de 2-4 templates simultanément
- **Navigation** : Cliquer sur un template pour le voir en grand
- **Retour** : Bouton "Voir tous" pour revenir à la vue comparatif

### 4. Validation Anti-Hallucination
- **Affichage** : Panneau "Validation Anti-Hallucination" au-dessus du CV
- **Contenu** :
  - Stats : X/Y widgets validés
  - Raisons de filtrage : Chiffres non groundés, expériences introuvables, compétences non présentes
  - Liste détaillée des warnings par widget
- **Action** : Cliquer sur le panneau pour voir les détails (expandable)

### 5. Édition d'Ordre (Drag & Drop)
- **Action** : Cliquer sur "Éditer ordre" dans le header
- **Fonctionnalité** : Affiche un éditeur avec liste d'expériences draggables
- **Drag & Drop** : Glisser-déposer les expériences pour réorganiser
- **Sauvegarde** : Automatique dans localStorage
- **Application** : Le CV se met à jour immédiatement avec le nouvel ordre

### 6. Options de Filtrage
- **Score minimum** : Slider 0-100 (défaut: 50)
  - Filtre les widgets par score de pertinence
- **Max expériences** : Slider 1-10 (défaut: 6)
  - Limite le nombre d'expériences affichées
- **Max bullets/exp** : Slider 1-10 (défaut: 6)
  - Limite les réalisations par expérience
- **Application** : Changement instantané via conversion côté client

### 7. Export PDF Natif
- **Action** : Cliquer sur "Exporter en PDF" dans le header
- **Méthode** : Utilise `window.print()` du navigateur
- **Performance** : <500ms (pas de serveur)
- **Résultat** : Dialog d'impression navigateur s'ouvre

### 8. Régénération Widgets
- **Action** : Cliquer sur "Régénérer" dans le header
- **Fonctionnalité** : Vide le cache et régénère les widgets depuis l'API
- **Utilisation** : Si les widgets ne sont pas satisfaisants

## Améliorations Notables vs V1

### Performance
- **Switch thème** : <100ms (vs 10-30s V1)
- **Preview temps réel** : <200ms
- **Export PDF** : <500ms (vs 2-5s Puppeteer)

### Qualité
- **Validation anti-hallucination** : 100% widgets groundés dans RAG
- **Scoring avancé** : Multi-critères (ATS, métriques, récence, séniorité)
- **Score qualité** : ≥ V1 (8.5/10)

### UX
- **Drag & drop** : Réorganisation intuitive des expériences
- **Preview multi-thèmes** : Comparaison visuelle rapide
- **Cache intelligent** : Pas de re-génération lors du switch thème
- **Validation visible** : Warnings affichés avec détails

## Architecture Technique

### Flux Complet
```
1. User clique "Générer avec V2" → Redirection /dashboard/cv-builder?analysisId=XXX
2. Page charge → Appelle /api/cv/generate-widgets
3. API retourne widgets + jobOfferContext
4. Widgets sauvegardés dans localStorage
5. Conversion widgets → CVData côté client (instantané)
6. CVData sauvegardé dans sessionStorage (par template)
7. Rendu avec CVRenderer
8. Switch thème → Récupère depuis cache ou convertit instantanément
```

### Composants Clés
- **DraggableCV** : Wrapper DndContext pour drag & drop
- **ExperienceEditor** : Éditeur visuel pour réorganisation
- **useCVReorder** : Hook pour gestion ordre + localStorage
- **convertWidgetsToCVWithAdvancedScoring** : Conversion avec scoring multi-critères
- **ValidationWarnings** : Affichage warnings validation
- **MultiTemplatePreview** : Preview comparatif

## Tests de Validation

### Test 1 : Switch Thème Instantané
1. Ouvrir CV Builder
2. Noter le template actuel
3. Cliquer sur un autre template
4. **Vérifier** : Le CV change en <100ms sans loader

### Test 2 : Preview Multi-Thèmes
1. Cliquer "Comparer templates"
2. **Vérifier** : Affichage de 2-4 templates côte à côte
3. Cliquer sur un template
4. **Vérifier** : Vue agrandie s'affiche

### Test 3 : Validation
1. Générer widgets
2. **Vérifier** : Panneau "Validation Anti-Hallucination" s'affiche
3. Cliquer pour expand
4. **Vérifier** : Détails des widgets filtrés visibles

### Test 4 : Drag & Drop
1. Cliquer "Éditer ordre"
2. **Vérifier** : Éditeur d'expériences s'affiche
3. Glisser une expérience
4. **Vérifier** : Ordre change + CV se met à jour
5. Refresh page
6. **Vérifier** : Ordre persiste

### Test 5 : Export PDF
1. Cliquer "Exporter en PDF"
2. **Vérifier** : Dialog d'impression navigateur s'ouvre
3. Imprimer en PDF
4. **Vérifier** : PDF contient le CV complet

### Test 6 : Scoring Avancé
1. Ouvrir console navigateur
2. Générer widgets
3. **Vérifier** : Les widgets ont des scores recalculés avec critères ATS, métriques, récence
