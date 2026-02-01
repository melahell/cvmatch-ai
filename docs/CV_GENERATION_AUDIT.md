# Audit – Génération de CV (pipelines, templates, pertes)

Objectif : cartographier les pipelines de génération de CV, identifier où des informations sont filtrées/transformées/perdues, et distinguer **pertes intentionnelles** (fit à 1 page / règles template) vs **pertes accidentelles** (bugs, dérives de schéma, omissions de rendu).

## 1) Schémas de données
### 1.1 Profil RAG (source)
- Source DB : `rag_metadata.completeness_details` (JSONB)
- Taxonomie détaillée : [RAG_PROFILE_TAXONOMY.md](file:///Users/gillesgozlan/Desktop/CV-Crush/docs/RAG_PROFILE_TAXONOMY.md)

### 1.2 CVData (format templates)
- Type utilisé par les templates : [CVData](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates/index.ts#L3-L44)
- Alias utilisé côté bridge : `RendererResumeSchema = CVData` : [renderer-schema.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/renderer-schema.ts)

## 2) Pipelines de génération

Note : l’endpoint historique `/api/cv/generate` est maintenant un alias qui appelle `/api/cv/generate-v2`.

### 2.1 Pipeline V2 (Widgets → bridge → fit)
Entrée : profil RAG + job + matchAnalysis

Fichiers clés :
- Endpoint : [generate-v2/route.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/cv/generate-v2/route.ts)
- Génération widgets : [generate-widgets.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/generate-widgets.ts)
- Scoring avancé : [advanced-scoring.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/advanced-scoring.ts)
- Bridge widgets→CVData : [ai-adapter.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/ai-adapter.ts)
- Fit template : [validator.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/validator.ts)

Étapes (simplifiées) :
1) Générer des widgets (LLM) “scorés”
2) Optionnel : re-scoring avancé (ATS/recency/metrics…)
3) Convertir widgets → `CVData` (bridge déterministe)
4) Fit au template (`fitCVToTemplate`) → adaptation “units” (`adaptCVToThemeUnits`)

Points de pertes typiques :
- Bridge : projection (les champs RAG “riches” non mappés disparaissent mécaniquement)
- Fit/adapt : trimming spatial (souvent la perte dominante)

## 3) Où l’information se perd (loss points)

### 3.1 Normalisation RAG → CVData (caps + filtres)
Implémentation : [normalizeData.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/normalizeData.ts)

Perte par filtres (qualité / cohérence) :
- Filtre d’expériences “trop incomplètes” (>= 2 champs essentiels requis parmi poste/entreprise/date) : [normalizeData.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/normalizeData.ts#L423-L445)
- Filtre de réalisations : suppression des éléments vides après sanitation / `display === false` : [normalizeData.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/normalizeData.ts#L362-L385)

Perte par quotas (hard caps) :
- Paramètres max (exp, réalisations/exp, skills, formations, langues, certifs…) : [normalizeData.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/normalizeData.ts#L256-L266)
- Application des `slice()` : [normalizeData.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/normalizeData.ts#L641-L674)

Projection de champs (drop structurel) :
- La sortie `CVData` ne conserve qu’un sous-ensemble “template-ready” du profil (contact + pitch + photo) : [normalizeData.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/normalizeData.ts#L730-L743)

### 3.2 Fit au template et adaptation “spatiale”
Implémentation :
- Fit : [fitCVToTemplate](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/validator.ts#L188-L365)
- Adaptation par unités : [adaptCVToThemeUnits](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/adaptive-algorithm.ts)

Mécanisme :
- `fitCVToTemplate` sélectionne des expériences (tri/dedup/heuristiques) puis applique des limites “logiques” et enfin appelle `adaptCVToThemeUnits`.
- `adaptCVToThemeUnits` ajuste le contenu en fonction des capacités du thème (unités disponibles par zone) :
  - limite bullets/exp selon `theme.adaptive_rules.max_bullet_points_per_exp` : [adaptive-algorithm.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/adaptive-algorithm.ts#L179-L180)
  - dégrade le format d’expériences (detailed→standard→compact→minimal), puis peut exclure des expériences si overflow : [adaptive-algorithm.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/adaptive-algorithm.ts#L213-L322)
  - tronque le résumé (260 → 180 → vide) pour rentrer : [adaptive-algorithm.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/adaptive-algorithm.ts#L265-L285)
  - trim compétences / formations / langues / certifs / clients par capacité : [adaptive-algorithm.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/adaptive-algorithm.ts#L324-L387)

Conclusion : la plus grosse “perte” dans le rendu final est généralement due à l’adaptation par capacité, pas au scoring.

### 3.3 Bridge Widgets → CVData (V2)
Implémentation : [convertAndSort](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/ai-adapter.ts#L243-L370)

Nature de la perte :
- Projection forte : le bridge reconstruit uniquement les sections du schéma `CVData` (profil/exp/skills/…).
- Les champs RAG non mappés (ex: détails de références, champs “riches” d’expérience) ne peuvent pas être récupérés au stade template.
- Filtrage par score possible (minScore, per-section), mais désactivé par défaut (`minScore=0`, advancedFilteringEnabled=false) : [ai-adapter.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/ai-adapter.ts#L63-L74)

## 4) Templates & rendu
Audit détaillé : [TEMPLATES_AUDIT.md](file:///Users/gillesgozlan/Desktop/CV-Crush/docs/TEMPLATES_AUDIT.md) (à générer/compléter).

Le rendu peut “perdre” des champs même si la donnée est présente dans `CVData` :
- liens profil (linkedin/github/portfolio) non rendus par certains templates
- soft skills non rendues par certains templates
- lieu d’expérience non rendu par certains templates

## 5) Autres étapes pouvant introduire de la perte
- Consolidation IA JSON (risque de reformulation / suppression implicite) : [consolidate/route.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/cv/consolidate/route.ts)
- Export PDF serveur (puppeteer) : rendu peut masquer des problèmes si l’attente du signal d’UI timeoute : [pdf/route.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/cv/%5Bid%5D/pdf/route.ts#L94-L115)

## 6) Checklist “perte intentionnelle vs bug”
- Intentionnel : caps pour tenir sur 1 page, trimming par unités, `display:false`, heuristiques template.
- Suspect (bug) : champ présent dans DB mais non consommé (dérive de schéma), champ présent dans `CVData` mais jamais rendu (omission template), écrasement lors d’une sauvegarde (éditeur CV), troncations DB trop agressives.
