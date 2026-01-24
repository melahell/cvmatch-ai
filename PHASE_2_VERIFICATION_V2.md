# Phase 2 - Vérification et Complétion V2

## Objectif
S'assurer que toutes les fonctionnalités V2 sont bien connectées, fonctionnelles et testées. Valider l'intégration complète de l'architecture V2.

## État Actuel Identifié

### Cache Widgets
- `lib/cv/widget-cache.ts` : Fonctions `getWidgetsFromServerCache` et `saveWidgetsToServerCache` existent
- `app/api/cv/generate-widgets/route.ts` : Seulement `calculateOptimalMinScore` est importé, le cache n'est PAS utilisé
- **Gap** : Le cache serveur n'est pas intégré dans l'endpoint de génération

### Export JSON Widgets
- `app/dashboard/cv-builder/page.tsx` : Bouton "Export JSON" existe (lignes 550-560)
- Code présent : `link.download = widgets_${analysisId}_${date}.json`
- **À vérifier** : Fonctionnalité complète et format exporté

### Advanced Scoring
- `app/dashboard/cv-builder/page.tsx` : `convertWidgetsToCVWithAdvancedScoring` est utilisé (ligne 370)
- Condition : Utilisé si `jobContext` disponible
- **À vérifier** : Tous les critères (ATS, impact, recency, seniority) appliqués correctement

### Tests E2E
- `__tests__/e2e/cv-generation-v2.spec.ts` : Tests de base existent
- **Gap** : Tests de parcours complet et cache manquants

## Plan d'Action

### 1. Intégration Cache Widgets Serveur (1h)

**Fichier** : `app/api/cv/generate-widgets/route.ts`

**Actions** :
1. Importer les fonctions de cache manquantes :
   ```typescript
   import { 
       getWidgetsFromServerCache, 
       saveWidgetsToServerCache, 
       generateCacheKey, 
       hashJobDescription,
       calculateOptimalMinScore 
   } from "@/lib/cv/widget-cache";
   ```

2. Avant la génération des widgets (après ligne 132, après normalisation RAG) :
   - Générer la clé de cache : `analysisId + ragCompletenessScore + hashJobDescription`
   - Vérifier le cache avec `getWidgetsFromServerCache`
   - Si cache hit : retourner immédiatement avec flag `cached: true`

3. Après génération réussie des widgets (après ligne 181) :
   - Sauvegarder dans le cache avec `saveWidgetsToServerCache`
   - Inclure les métadonnées (analysisId, jobId, generatedAt, etc.)

**Code à ajouter** :
```typescript
// Après normalisation RAG (ligne ~132)
const ragCompletenessScore = ragData.completeness_score || 0;
const jobDescriptionHash = hashJobDescription(jobDescription);
const cacheKey = generateCacheKey(analysisId, ragCompletenessScore, jobDescriptionHash);

// Vérifier cache AVANT génération
const cachedWidgets = await getWidgetsFromServerCache(cacheKey);
if (cachedWidgets) {
    logger.debug("[generate-widgets] Cache HIT", { cacheKey, widgetsCount: cachedWidgets.widgets.widgets.length });
    return NextResponse.json({
        success: true,
        widgets: cachedWidgets.widgets,
        metadata: {
            ...cachedWidgets.metadata,
            cached: true,
        },
        jobOfferContext: parseJobOfferFromText(jobDescription),
    });
}

// ... génération widgets existante ...

// Après génération réussie (après ligne 181)
await saveWidgetsToServerCache(cacheKey, widgetsEnvelope, {
    analysisId,
    jobId: jobId || undefined,
    generatedAt: new Date().toISOString(),
    widgetsCount: widgetsEnvelope.widgets.length,
    model: widgetsEnvelope.meta?.model || "gemini-3-pro-preview",
});
logger.debug("[generate-widgets] Cache SAVED", { cacheKey });
```

**Validation** :
- Tester avec même analysisId + jobDescription → doit retourner cache
- Tester avec jobDescription modifiée → doit régénérer
- Vérifier logs pour cache hits

### 2. Vérification Export JSON Widgets (1h)

**Fichier** : `app/dashboard/cv-builder/page.tsx`

**Actions** :
1. Vérifier que le code d'export (lignes 550-560) fonctionne correctement
2. Tester le téléchargement du fichier JSON
3. Valider le format exporté :
   - Doit être un `AIWidgetsEnvelope` valide
   - Doit inclure tous les widgets avec leurs métadonnées
   - Doit être parsable et validable avec `validateAIWidgetsEnvelope`

4. Améliorer si nécessaire :
   - Ajouter gestion d'erreurs
   - Vérifier que le nom de fichier est correct
   - S'assurer que le toast de confirmation fonctionne

**Code actuel (lignes 545-560)** :
```typescript
const dataStr = JSON.stringify(state.widgets, null, 2);
const dataBlob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = `widgets_${analysisId}_${new Date().toISOString().split('T')[0]}.json`;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
URL.revokeObjectURL(url);
toast.success("Widgets JSON exportés", { duration: 2000 });
```

**Améliorations possibles** :
- Ajouter try/catch pour gérer les erreurs
- Valider que `state.widgets` existe avant export
- Vérifier que le format est valide avant export

### 3. Vérification Advanced Scoring (1h)

**Fichiers** :
- `app/dashboard/cv-builder/page.tsx` (ligne 370)
- `lib/cv/advanced-scoring.ts`
- `lib/cv/ats-scorer.ts`

**Actions** :
1. Vérifier que `convertWidgetsToCVWithAdvancedScoring` est appelé quand `jobContext` existe
2. Vérifier que tous les critères sont appliqués :
   - ATS scoring (keywords matching)
   - Impact scoring (métriques, chiffres)
   - Recency scoring (dates récentes)
   - Seniority scoring (niveau d'expérience)

3. Tester avec différents scénarios :
   - Avec jobContext complet
   - Sans jobContext (fallback)
   - Avec différents profils RAG

4. Ajouter logs pour vérification :
   - Logger les scores calculés
   - Logger quel scoring est utilisé (avancé vs simple)

**Code à vérifier** :
```typescript
// Dans app/dashboard/cv-builder/page.tsx ligne 370
if (jobContext) {
    const { cvData: cv, validation } = convertWidgetsToCVWithAdvancedScoring(
        widgets,
        ragData,
        jobContext,
        normalizedOptions,
        true // enableAdvancedScoring
    );
    // Vérifier que cvData contient bien les widgets triés par score avancé
}
```

**Validation** :
- Logger les scores calculés pour vérification
- Comparer résultats avec/sans advanced scoring
- Vérifier que les widgets sont bien triés par score final

### 4. Tests E2E Complémentaires (1h)

**Fichiers** : `__tests__/e2e/`

**Actions** :
1. Ajouter test pour cache widgets :
   - Générer widgets une première fois
   - Régénérer avec mêmes paramètres → doit utiliser cache
   - Vérifier que la réponse contient `cached: true`

2. Améliorer test export JSON existant :
   - Vérifier que le fichier téléchargé est valide JSON
   - Valider que le contenu est un `AIWidgetsEnvelope` valide

3. Ajouter test pour parcours complet :
   - Upload document → génération RAG → analyse offre → génération CV V2 → export PDF
   - Vérifier chaque étape

4. Ajouter test de performance :
   - Mesurer temps avec cache vs sans cache
   - Vérifier que le cache améliore les performances

**Tests à créer/améliorer** :
```typescript
// __tests__/e2e/v2-cache.spec.ts (nouveau)
test('Widgets cache fonctionne', async ({ page }) => {
    // Générer widgets première fois
    // Régénérer avec mêmes paramètres
    // Vérifier cached: true dans réponse
});

// Améliorer __tests__/e2e/cv-generation-v2.spec.ts
test('should export valid JSON widgets', async ({ page }) => {
    // Générer widgets
    // Cliquer export JSON
    // Vérifier téléchargement fichier
    // Valider contenu avec validateAIWidgetsEnvelope
});

// __tests__/e2e/v2-full-workflow.spec.ts (nouveau)
test('Parcours complet V2', async ({ page }) => {
    // Upload → RAG → Analyse → CV V2 → PDF
});
```

## Métriques de Succès

- Cache widgets : Réduction temps réponse de 50%+ pour requêtes identiques
- Export JSON : Fichier valide téléchargé avec tous les widgets
- Advanced scoring : Widgets triés correctement selon critères multiples
- Tests E2E : Coverage > 80% pour fonctionnalités V2
- Aucune régression : Tous les tests existants passent

## Ordre d'Exécution

1. **Cache Widgets** (1h) - Impact performance immédiat
2. **Export JSON** (1h) - Validation fonctionnalité existante
3. **Advanced Scoring** (1h) - Vérification qualité
4. **Tests E2E** (1h) - Assurance qualité long terme

**Temps total estimé** : 4h
