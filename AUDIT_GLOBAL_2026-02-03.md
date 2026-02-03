# 🔍 Audit global CV-Crush

**Date:** 3 février 2026  
**Version projet:** 6.4.6  
**Cible déploiement:** Vercel (Next.js 14, App Router)  

## Conclusion (décision + prochaines actions)

**Décision:** ✅ GO prod, avec garde-fous. Le produit est déployable et les flux critiques sont cohérents. Les risques restants sont majoritairement opérationnels (serverless/IA/PDF) et doivent être encadrés.

**3 actions à faire avant/pendant mise en prod:**
1. **Configurer Upstash Redis** en prod (sinon rate-limit non fiable en multi-instances).
2. **Revoir les timeouts Vercel** des routes IA susceptibles de dépasser (matching/optimisation, pas seulement RAG).
3. **Valider l’export PDF “serveur”** sur un panel de variantes (compact/standard/aéré) pour éviter les débordements.

**3 actions post-prod (quick wins):**
1. Remplacer progressivement les `console.*` des routes critiques par `logger` pour garder des logs exploitables.
2. Ajouter une notion de “favoris” de variantes (top 10) pour éviter un sélecteur interminable.
3. Durcir la CSP si possible (réduire `unsafe-eval`/`unsafe-inline` quand la contrainte Next le permet).

## 1) Résumé exécutif

Le produit est cohérent et déjà “deployable” : génération CV (templates + widgets IA), profil RAG (documents), analyse d’offres (URL/texte/fichier), export PDF (print client + Puppeteer serveur).

Les risques principaux sont opérationnels (timeouts serverless, scraping LinkedIn fragile, rate-limit distribué, coût IA, stabilité export PDF) plus que structurels. Les derniers changements renforcent nettement l’ingestion (offres + docs) et ajoutent un système de variantes de templates pour atteindre 100+ versions sans exploser la maintenance.

## 2) Architecture (vue d’ensemble)

- **Frontend:** Next.js 14 App Router, pages dashboard, UI Radix + Tailwind.
- **Backend:** Routes API Next (`app/api/*`) avec Supabase auth (user + service role).
- **Stockage:** Supabase Postgres + Supabase Storage (bucket `documents`).
- **IA:** Gemini via `@google/generative-ai` + “cascade” (retry + fallback modèles).
- **PDF:** 
  - print client (CV Builder) via `/dashboard/cv-builder/print`
  - PDF serveur Puppeteer pour CV sauvegardés via `/api/cv/[id]/pdf`

## 3) Flux produit critiques

- **Profil RAG (documents)**: upload → extraction → génération RAG → `rag_metadata`.
- **Analyser & Générer**: URL/texte/fichier → `/api/match/analyze` → `job_analyses` → génération widgets → rendu template.
- **CV “versions”**:
  - templates “structure” (Modern/Tech/Classic/Creative + RR)
  - variantes “design” (couleur/typo/densité) via CSS variables

## 4) Changements importants récents (delta)

- **Ingestion offres (URL)**: extraction multi-pass (HTML + meta + JSON-LD + reader fallback + fallback Gemini sur HTML tronqué) avec debug extraction.
  - Code: `app/api/match/analyze/route.ts`, `lib/job/extract-job-text.ts`
- **Ingestion offres (PDF/DOCX)**: extraction locale `unpdf`/`mammoth` avant fallback IA.
  - Code: `app/api/match/analyze/route.ts`
- **RAG docs**: normalisation robuste du type doc + support `.txt` + statuts + erreurs d’extraction en DB (déjà intégré dans la base).
- **100+ variantes templates**: 240 variantes (Modern + Tech) générées par config (8 palettes × 5 typos × 3 densités).
  - Code: `lib/cv/template-variants.ts`, intégration dans `components/cv/CVRenderer.tsx`
  - UI: `app/dashboard/cv-builder/page.tsx`, `app/dashboard/templates/page.tsx`, `app/dashboard/cv/[id]/page.tsx`
- **Tuto LinkedIn**: section pliable au-dessus de l’import documents.
  - Code: `components/profile/DocumentsTab.tsx`

## 5) Points de vigilance (priorisés)

### A. Production / Vercel
- **Timeouts routes IA**: vérifier `maxDuration` Vercel pour les routes longues (déjà présent pour RAG generate). Le matching/optimisation peut aussi dépasser sur gros inputs.
  - Config: `vercel.json`
- **Rate limiting distribué**: s’assurer que Upstash Redis est configuré en prod (sinon fallback mémoire par instance).
  - Env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- **CSP**: la CSP actuelle autorise `unsafe-eval`/`unsafe-inline` (souvent nécessaire en dev, mais à durcir si possible).
  - Config: `next.config.js`

### B. Ingestion LinkedIn
- Les URL LinkedIn peuvent être bloquées (authwall). Le produit doit guider vers:
  - copier/coller description ou upload PDF LinkedIn.
- Le scraping “best-effort” doit rester un fallback, pas une promesse.

### C. Export PDF (qualité/stabilité)
- Deux systèmes d’export cohabitent (print client et Puppeteer serveur). Tester systématiquement les variantes “compact/airy” sur Puppeteer pour éviter débordements.

### D. Observabilité
- Éviter `console.error` dans les routes critiques (standardiser sur `logger`).
- Capitaliser sur le `extraction_debug` (déjà exposé en dev) pour diagnostiquer les échecs d’ingestion.

## 6) Checklist déploiement Vercel

1. Variables d’env dans Vercel (Production/Preview):
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (recommandé)
2. Vérifier “Functions max duration” (Vercel) et cohérence avec `vercel.json`.
3. Build OK (`npm run build`) + tests OK (`npm test`).
4. Tester 1 export PDF par:
   - CV Builder (print)
   - CV sauvegardé (Puppeteer)

## 7) Recommandations “next”

- Ajouter un budget “max variants displayed” côté UI + recherche (déjà fait dans builder) pour éviter un menu trop long.
- Ajouter une option “favoris” de variantes (top 10) pour améliorer l’UX.
- Durcir progressivement la CSP et supprimer les `console.*` non nécessaires.
