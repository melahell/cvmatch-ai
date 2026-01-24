# Roadmap Post V2 - CV-Crush

**Version actuelle** : 6.2.4  
**Date** : Janvier 2026  
**Statut** : V2 Architecture complète, optimisations en cours

---

## État des Lieux - Audit Réel

### ✅ Fonctionnalités V2 Implémentées

#### Architecture V2 Core
- ✅ **Widgets Schema** (`lib/cv/ai-widgets.ts`) : Schéma JSON atomique avec scoring
- ✅ **AI Adapter** (`lib/cv/ai-adapter.ts`) : Conversion widgets → RendererResumeSchema
- ✅ **Widget Generator** (`lib/cv/generate-widgets.ts`) : Génération via Gemini avec validation
- ✅ **API V2** (`app/api/cv/generate-v2/route.ts`) : Endpoint complet avec rate limiting
- ✅ **Client Bridge** (`lib/cv/client-bridge.ts`) : Conversion côté client avec options avancées

#### Cache & Performance V2
- ✅ **Widget Cache Serveur** (`lib/cv/widget-cache.ts`) : Cache Supabase avec TTL 24h
- ✅ **Client Cache** (`lib/cv/client-cache.ts`) : localStorage/sessionStorage avec expiration
- ✅ **Optimal MinScore** : Calcul dynamique basé sur RAG completeness score

#### Visualisation & Édition
- ✅ **Widget Score Visualizer** (`components/cv/WidgetScoreVisualizer.tsx`) : Stats et détails par section
- ✅ **Widget Editor** (`components/cv/WidgetEditor.tsx`) : Ajout/modification/suppression widgets
- ✅ **Validation Warnings** (`components/cv/ValidationWarnings.tsx`) : Avertissements anti-hallucination

#### RAG Améliorations
- ✅ **Fuzzy Matching** (`lib/rag/fuzzy-matcher.ts`) : Normalisation entreprises, similarité chaînes, déduplication
- ✅ **Contexte Enrichi** (`lib/rag/contexte-enrichi.ts`) : Responsabilités implicites, compétences tacites, soft skills déduites
- ✅ **Merge Intelligent** (`lib/rag/merge-simple.ts`) : Fusion avec respect rejected_inferred

#### Templates
- ✅ **Modern Spacious** : Template complet dans `lib/cv/template-engine.ts`
- ✅ **Compact ATS** : Template complet dans `lib/cv/template-engine.ts`
- ✅ **Multi-Template Preview** (`components/cv/MultiTemplatePreview.tsx`) : Comparaison côte à côte

#### UX & Accessibilité
- ✅ **Tooltips** : Ajoutés sur textes tronqués (JobCard, CVCard, RecentActivity)
- ✅ **Aria-labels** : Boutons icon-only avec labels accessibles
- ✅ **Focus Management** : Gestion focus modals (DashboardLayout)
- ✅ **Metadata SEO** : Layouts avec metadata pour pages dashboard
- ✅ **JSON-LD** : FAQPage schema sur page d'accueil
- ✅ **CSP** : Content-Security-Policy dans `next.config.js`

#### Tests
- ✅ **Tests Unitaires** : `__tests__/cv/generate-widgets.test.ts`, `__tests__/cv/ai-adapter.test.ts`
- ✅ **Tests E2E** : `__tests__/e2e/cv-generation-v2.spec.ts`, `__tests__/e2e/performance.spec.ts`
- ✅ **Playwright Config** : Configuration complète pour tests E2E

---

## Gaps Identifiés - À Améliorer

### 🔴 Priorité Haute - Performance & Qualité

#### 1. Mémoïsation React Incomplète
**Fichiers concernés** :
- `hooks/useRAGData.ts` : Dépendances useEffect à optimiser
- `hooks/useDashboardData.ts` : Dépendances useEffect à optimiser
- `hooks/useJobAnalyses.ts` : Dépendances useEffect à optimiser
- `app/dashboard/page.tsx` : Certains calculs non mémorisés

**Action** : Ajouter `useMemo` et `useCallback` pour éviter re-renders inutiles

#### 2. Supabase Client Singleton
**Fichier** : `lib/supabase.ts`

**Problème** : Instanciations multiples de clients Supabase peuvent impacter performance

**Action** : Implémenter pattern singleton pour clients Supabase

#### 3. Console.log en Production
**Fichiers** : Multiples fichiers avec `console.log` non conditionnels

**Action** : Utiliser script `scripts/cleanup-console-logs.sh` et logger conditionnel basé sur `NODE_ENV`

#### 4. Lazy Loading Restant
**Fichiers** :
- `components/dashboard/DashboardCharts.tsx` : Déjà dynamique mais vérifier
- `components/cv/CVRenderer.tsx` : Potentiel lazy loading

**Action** : Auditer et ajouter `next/dynamic` où nécessaire

---

### 🟡 Priorité Moyenne - Évolutions V2

#### 5. Cache Widgets Utilisation
**Fichier** : `app/api/cv/generate-widgets/route.ts`

**Problème** : Le cache serveur (`widget-cache.ts`) existe mais n'est peut-être pas utilisé dans l'endpoint

**Action** : Vérifier intégration cache dans `generate-widgets` et activer si manquant

#### 6. Export JSON Widgets Bruts
**Fichier** : `app/dashboard/cv-builder/page.tsx`

**Statut** : Bouton "Export JSON" mentionné dans le code mais à vérifier fonctionnalité complète

**Action** : Tester et compléter si nécessaire

#### 7. Advanced Scoring Intégration
**Fichiers** :
- `lib/cv/advanced-scoring.ts` : Existe
- `lib/cv/ats-scorer.ts` : Existe
- `app/dashboard/cv-builder/page.tsx` : Vérifier utilisation

**Action** : S'assurer que scoring avancé (ATS, impact, recency, seniority) est bien utilisé

---

### 🟢 Priorité Basse - Features & Polish

#### 8. Migration Prompts V2
**Fichier** : `lib/ai/prompts.ts`

**Problème** : TODO ligne 964 mentionne migration vers `getCVOptimizationPromptV2`

**Action** : Auditer et migrer progressivement si nécessaire

#### 9. Tests E2E Coverage
**Fichiers** : `__tests__/e2e/`

**Statut** : Tests de base existent, mais coverage peut être étendue

**Action** : Ajouter tests pour parcours utilisateur complets (upload doc → génération CV → export PDF)

#### 10. Documentation Utilisateur
**Fichiers** : `README.md`, `ARCHITECTURE_V2.md`

**Action** : Mettre à jour avec nouvelles fonctionnalités V2 et guides utilisateur

---

## Plan d'Action Recommandé

### Phase 1 : Optimisations Performance (4-6h)
**Objectif** : Améliorer score Lighthouse 95 → 98-100/100

1. **Mémoïsation React** (2h)
   - Optimiser `useRAGData`, `useDashboardData`, `useJobAnalyses`
   - Ajouter `useMemo`/`useCallback` dans `app/dashboard/page.tsx`

2. **Supabase Singleton** (1h)
   - Implémenter pattern singleton dans `lib/supabase.ts`

3. **Nettoyage Console.log** (1h)
   - Exécuter script cleanup et remplacer par logger conditionnel

4. **Lazy Loading Audit** (1h)
   - Vérifier et ajouter `next/dynamic` où nécessaire

**Résultat attendu** : Score Lighthouse 98-100/100, meilleure performance globale

---

### Phase 2 : Vérification & Complétion V2 (3-4h)
**Objectif** : S'assurer que toutes les fonctionnalités V2 sont bien connectées

1. **Cache Widgets Intégration** (1h)
   - Vérifier utilisation dans `app/api/cv/generate-widgets/route.ts`
   - Activer si manquant

2. **Export JSON Widgets** (1h)
   - Tester fonctionnalité complète
   - Corriger si nécessaire

3. **Advanced Scoring Vérification** (1h)
   - Vérifier utilisation scoring avancé dans cv-builder
   - S'assurer que tous les critères (ATS, impact, recency, seniority) sont appliqués

4. **Tests E2E Complémentaires** (1h)
   - Ajouter tests pour parcours complets
   - Tests de régression pour nouvelles features

**Résultat attendu** : V2 100% fonctionnel et testé

---

### Phase 3 : Polish & Documentation (2-3h)
**Objectif** : Finaliser et documenter

1. **Migration Prompts** (1h)
   - Auditer TODO dans `lib/ai/prompts.ts`
   - Migrer si nécessaire

2. **Documentation** (1-2h)
   - Mettre à jour `README.md` avec V2
   - Ajouter guides utilisateur si nécessaire
   - Documenter nouvelles APIs

**Résultat attendu** : Documentation à jour, code maintenable

---

## Métriques de Succès

### Performance
- ✅ Lighthouse Score : 98-100/100 (actuellement ~95)
- ✅ First Contentful Paint : < 1.5s
- ✅ Time to Interactive : < 3.5s

### Qualité Code
- ✅ 0 console.log en production
- ✅ Tous les hooks React optimisés
- ✅ Coverage tests > 80%

### Fonctionnalités V2
- ✅ Cache widgets fonctionnel
- ✅ Export JSON widgets disponible
- ✅ Advanced scoring appliqué
- ✅ Tous les composants V2 intégrés

---

## Prochaines Étapes Immédiates

1. **Valider avec utilisateur** : Prioriser Phase 1, 2 ou 3 ?
2. **Créer tickets** : Découper en tâches spécifiques
3. **Exécuter** : Commencer par la phase prioritaire

---

## Notes

- La plupart des fonctionnalités V2 sont **déjà implémentées**
- Les gaps sont principalement des **optimisations** et **vérifications**
- Le focus devrait être sur **performance** et **polish** plutôt que nouvelles features
- Les tests E2E existent mais peuvent être étendus pour plus de confiance
