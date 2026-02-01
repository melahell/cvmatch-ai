# Audit – Matching poste ↔ utilisateur (analyse, scoring, usages)

Objectif : comprendre comment l’app compare une offre à un profil, quels champs sont produits, où ils sont stockés, et où ils sont consommés (et donc où une perte peut survenir).

## 1) Sources & stockage
### 1.1 Profil utilisateur
- Source : `rag_metadata.completeness_details` (JSONB)
- Note : ce JSON peut être volumineux (expériences + réalisations + sources + contexte enrichi).

### 1.2 Analyses d’offres (match)
- Table : `job_analyses`
- Champs structurés : `match_report` (JSONB) + colonnes dérivées `strengths`, `gaps`, `missing_keywords`, etc.
- Le texte d’offre stocké est tronqué à 10 000 caractères (voir §2.3).

Référence DB : [01_tables.sql](file:///Users/gillesgozlan/Desktop/CV-Crush/01_tables.sql#L58-L103)

## 2) Génération du match (API)
### 2.1 Endpoint principal
Fichier : [app/api/match/analyze/route.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/match/analyze/route.ts)

Entrées supportées :
- `jobText` (texte brut)
- `jobUrl` (scraping HTML → extraction de texte principal)
- `fileData` (image/PDF → extraction via modèle vision)

### 2.2 Schéma de sortie
Validation Zod : [match-analysis.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/validations/match-analysis.ts#L58-L71)

Champs principaux :
- `job_title`, `company?`, `location?`
- `match_score` (0–100), `match_level`, `recommendation`
- `strengths[] { point, match_percent }`
- `gaps[] { point, severity, suggestion }`
- `missing_keywords[]`
- `key_insight`
- optionnels : `salary_estimate`, `coaching_tips`

Prompt IA : [prompts.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/ai/prompts.ts#L670-L739)

### 2.3 Pertes confirmées (troncations)
- Stockage DB : `job_description` est tronqué à 10 000 caractères avant insertion : [match/analyze/route.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/match/analyze/route.ts#L291-L307)
  - Effet : toute feature qui relit `job_analyses.job_description` (widgets/CV/preview) travaille sur une offre potentiellement amputée.

### 2.4 Pertes implicites (tokens)
- Le prompt injecte `JSON.stringify(userProfile, null, 2)` + l’offre. Si le profil est trop gros, la perte peut être implicite côté modèle (pas traçée).

## 3) Consommation du match (UI + CV)
### 3.1 Pages principales
- Création analyse : [dashboard/analyze/page.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/app/dashboard/analyze/page.tsx)
- Détail analyse : [dashboard/analyze/[id]/page.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/app/dashboard/analyze/%5Bid%5D/page.tsx)

### 3.2 Zone de comparaison (risque de perte d’affichage)
Plusieurs composants/pages attendent des champs legacy (`poste_cible`, `points_forts`, `points_amelioration`) :
- [dashboard/compare/page.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/app/dashboard/compare/page.tsx)
- [AnalysisInlinePreview.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/components/analyze/AnalysisInlinePreview.tsx)

Conséquence : même si l’analyse est correcte dans `match_report`, l’UI peut afficher des sections vides (perte “visuelle”).

### 3.3 Consommation dans la génération CV (risque de perte logique)
Certains endpoints CV/preview lisent `analysis_result?.match_report` au lieu de `match_report` :
- [generate-v2/route.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/cv/generate-v2/route.ts#L213-L221)
- [generate-widgets/route.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/cv/generate-widgets/route.ts#L173-L199)
- [preview/route.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/cv/preview/route.ts#L101-L115)

Conséquence : la génération peut ignorer silencieusement les `missing_keywords/strengths/gaps` du match.

## 4) Recommandations (priorisées)
1) Aligner tous les consommateurs sur `job_analyses.match_report` (supprimer `analysis_result?.match_report`).
2) Mettre à jour l’UI “compare” + preview pour le schéma actuel (ou ajouter un adaptateur retro-compat).
3) Réévaluer la troncation DB (10k) : stocker plus, ou stocker une version “full”, ou stocker les segments structurés (sections).
4) Optionnel : normaliser/compresser le profil envoyé au match (pour réduire pressure tokens) tout en conservant le signal.
