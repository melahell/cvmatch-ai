# 🎯 CONTEXT.md - CV Crush - Référence Centrale

**Date de création** : 2 janvier 2026  
**Dernière mise à jour** : 2 janvier 2026  
**Objectif** : Document de référence central pour maintenir le contexte du projet

---

## 📌 OBJECTIF DE L'APPLICATION

**CV Crush** est une plateforme SaaS B2C qui révolutionne la recherche d'emploi en utilisant l'IA (Gemini) pour :

1. ✅ **Générer un profil RAG structuré** à partir de documents uploadés (CV, LinkedIn, etc.)
2. ✅ **Analyser le match** entre le profil utilisateur et une offre d'emploi (score 0-100)
3. ✅ **Générer des CV optimisés** pour chaque offre en < 30 secondes
4. ✅ **Suggérer le Top 10 des postes possibles** (opportunités évidentes + cachées)
5. ✅ **Tracker les candidatures** et fournir des statistiques

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack
- **Frontend** : Next.js 14 (App Router), React, TailwindCSS, shadcn/ui
- **Backend** : Next.js API Routes (Serverless Functions)
- **Base de données** : Supabase (PostgreSQL)
- **Storage** : Supabase Storage
- **IA** : Google Gemini 3 Pro Preview / Flash Preview
- **Déploiement** : Vercel
- **Auth** : Supabase Auth

### Structure de la Base de Données

#### Tables Principales
1. **`users`** : Utilisateurs (auth Supabase)
2. **`rag_metadata`** : Profil RAG structuré
   - `completeness_details` (JSONB) : Profil complet
   - `completeness_score` (INTEGER) : Score 0-100
   - `top_10_jobs` (JSONB) : Suggestions de postes
   - `custom_notes` (TEXT) : Notes personnelles
3. **`uploaded_documents`** : Documents uploadés
   - `extracted_text` (TEXT) : Texte extrait
   - `extraction_status` : pending/processing/completed/failed
4. **`job_analyses`** : Analyses de match offre/profil
   - `match_score` : Score 0-100
   - `match_report` (JSONB) : Détails du match
5. **`cv_generations`** : CVs générés
   - `cv_data` (JSONB) : Contenu structuré
   - `cv_url` : URL du CV (optionnel)

### Storage Buckets
- **`documents`** : Fichiers docs uploadés (PDF, DOCX, TXT, MD)
- **`cvs`** : CVs générés en PDF
- **`profile-photos`** : Photos de profil (PRIVÉ, signed URLs)

---

## 🔑 FONCTIONNALITÉS CLÉS

### 1. Génération RAG (Retrieval-Augmented Generation)
- L'utilisateur upload 1-10 documents (CV, LinkedIn PDF, etc.)
- Extraction de texte automatique (PDF.js)
- Gemini 3 Pro structure les données en profil JSON :
  ```json
  {
    "profil": { nom, prénom, titre, localisation, contact, elevator_pitch },
    "experiences": [{ poste, entreprise, dates, réalisations, technologies }],
    "competences": { techniques: [], soft_skills: [] },
    "formations": [{ diplôme, école, année }],
    "langues": { "Français": "Natif", "Anglais": "C1" }
  }
  ```
- Calcul du **score de complétude** (0-100) avec breakdown par catégorie
- Génération du **Top 10 postes possibles** avec score de match

### 2. Analyse de Match
- L'utilisateur soumet une URL d'offre ou colle le texte
- Gemini compare profil RAG vs offre d'emploi
- Retourne :
  - **Score de match 0-100** (objectif, pas gonflé)
  - **Niveau de match** : Excellent/Très bon/Bon/Moyen/Faible
  - **Forces** : Compétences/expériences alignées (avec % match)
  - **Gaps** : Ce qui manque + suggestions d'amélioration
  - **Mots-clés manquants** pour ATS
  - **Recommandation** : Postuler ou pas

### 3. Génération CV Optimisée
- **Input** : Profil RAG + Analyse de match d'une offre
- **Output** : CV au format PDF optimisé pour cette offre
  - Réorganisation des expériences selon pertinence
  - Mise en avant des mots-clés ATS
  - Quantifications adaptées
  - Template professionnel (StandardTemplate POC)
- **SLA** : < 30 secondes

### 4. Dashboard & Tracking
- Vue d'ensemble : Score profil, CVs générés, offres analysées
- Suivi des candidatures par statut
- Historique des analyses et CVs
- Statistiques : taux de match moyen, compétences clés, etc.

---

## 🧠 SPÉCIFICITÉS IMPORTANTES

### RAG Profile Structure
⚠️ **ATTENTION** : La structure a évolué, soyez vigilant !

**Ancienne structure (nested)** :
```json
{
  "profil": { nom, prénom, ... },
  "experiences": [...],
  "competences": {...}
}
```

**Nouvelle structure constatée (flat)** :
```json
{
  "nom": "GOZLAN",
  "prenom": "Gilles",
  "titre_principal": "...",
  "photo_url": "...",
  ...
}
```

➡️ **Solution** : Utiliser `normalizeRAGData()` de `lib/utils/normalize-rag.ts` pour gérer les deux

### Calcul du Completeness Score
Le `completeness_breakdown` **N'EST PAS stocké en DB** (colonne n'existe pas).  
Il est calculé côté client via `calculateCompletenessWithBreakdown()` depuis `completeness_details`.

### Gemini Models
- **Production** : `gemini-3-pro-preview` (principal) + `gemini-3-flash-preview` (fallback)
- **Lancés** : Nov-Dec 2025, GA depuis 28 déc 2025
- **Fallback automatique** : Si Pro rate-limité → Flash
- **Retry avec backoff** : 3 tentatives avec délais exponentiels (30s, 60s, 120s)

### Photo de Profil
- **Bucket** : `profile-photos` (PRIVÉ, pas public)
- **URLs** : Signed URLs (expiration 1 an)
- **Stockage** : `completeness_details.profil.photo_url`
- **Upload** : Dashboard → Avatar → Sélectionner image → Upload + Update profil complet

---

## ❓ QUESTIONS RÉCURRENTES À SE POSER

### Avant toute modification de code :

1. **Sur quelle table dois-je travailler ?**
   - Documents : `uploaded_documents` (PAS `documents` !)
   - Colonnes date : `created_at` (PAS `uploaded_at`)

2. **Quel est le vrai schéma en DB ?**
   - Toujours vérifier dans `01_tables.sql`
   - En cas de doute, créer un script d'inspection

3. **Quelle structure de données RAG ?**
   - Utiliser `normalizeRAGData()` pour supporter nested ET flat
   - Le breakdown est CALCULÉ, pas stocké

4. **Quels modèles Gemini utiliser ?**
   - Gemini 3 Pro Preview (principal)
   - Gemini 3 Flash Preview (fallback)
   - **NE PAS** utiliser `gemini-1.5-*` sauf demande explicite

5. **Le bucket Storage est-il public ou privé ?**
   - `documents` : Privé
   - `cvs` : Privé
   - `profile-photos` : **PRIVÉ** (signed URLs uniquement)

6. **Où sont les logs de production ?**
   - Vercel → Projet → **Functions** (pas Build)
   - Chercher les logs de `/api/rag/generate` etc.

---

## 🛠️ MCP (Model Context Protocol)

### Serveurs MCP Disponibles
*(À compléter selon configuration réelle)*

- **Supabase MCP** : Accès direct à la DB Supabase
- **GitHub MCP** : Gestion du repo
- **Brave Search MCP** : Recherche web

### Utilisation
- Les serveurs MCP donnent accès à des ressources externes
- Utiliser `list_resources` et `read_resource` pour interroger

---

## 🚨 PROBLÈMES CONNUS & SOLUTIONS

### 1. Erreur 400 lors du fetch `rag_metadata`
**Cause** : Colonne demandée n'existe pas (ex: `completeness_breakdown`)  
**Solution** : Vérifier le schéma réel, utiliser `normalizeRAGData()`

### 2. "No documents found"
**Cause** : Mauvais nom de table (`documents` au lieu de `uploaded_documents`)  
**Solution** : Toujours utiliser `uploaded_documents`

### 3. Gemini 404 "Model not found"
**Cause** : Nom de modèle incorrect ou obsolète  
**Solution** : Utiliser `gemini-3-pro-preview` et `gemini-3-flash-preview`

### 4. Profil vide après régénération
**Causes possibles** :
- Gemini rate-limited → Vérifier logs Vercel
- Erreur de parsing JSON → Logs montreront l'erreur
- Données écrasées lors d'upload photo → Utiliser fetch complet avant update

**Solution** : Logs de debug activés dans `/api/rag/generate`

### 5. Photo de profil non visible
**Cause** : Bucket public au lieu de privé, ou URL pas signée  
**Solution** : Utiliser `createSignedUrl()` avec expiration 1 an

---

## 📂 FICHIERS CLÉs

### Configuration
- `01_tables.sql` : Schéma SQL de référence
- `05_profile_photos_storage.sql` : Config Storage + RLS policies
- `.env.local` / `.env.production` : Variables d'environnement

### API Routes
- `app/api/rag/generate/route.ts` : Génération du profil RAG
- `app/api/rag/update/route.ts` : Mise à jour du profil RAG
- `app/api/match/analyze/route.ts` : Analyse de match offre
- `app/api/cv/generate/route.ts` : Génération de CV
- `app/api/lm/generate/route.ts` : Génération de lettre de motivation

### Utilitaires
- `lib/utils/completeness.ts` : Calcul du score de complétude
- `lib/utils/normalize-rag.ts` : Normalisation structure RAG
- `lib/ai/prompts.ts` : Prompts Gemini
- `lib/supabase.ts` : Client Supabase

### Scripts de Debug
- `scripts/check-documents.js` : Vérifier documents uploadés
- `scripts/inspect-rag-metadata.js` : Inspecter structure RAG
- `scripts/check-full-data.js` : Vérifier intégrité des données

### Pages Importantes
- `app/dashboard/page.tsx` : Dashboard principal
- `app/dashboard/profile/rag/page.tsx` : Gestion profil RAG
- `app/debug/test-rag/page.tsx` : Page de test RAG (debug)

---

## 🔄 WORKFLOWS TYPIQUES

### Nouveau Document Uploadé
1. User upload via `/dashboard/profile/rag`
2. Fichier → Supabase Storage bucket `documents`
3. Extraction texte (PDF.js) → `uploaded_documents.extracted_text`
4. Status `extraction_status` = "completed"

### Régénération RAG
1. User clique "Régénérer" → POST `/api/rag/generate`
2. Fetch tous les docs avec `extracted_text`
3. Concat tout le texte
4. Prompt Gemini 3 Pro avec schéma JSON attendu
5. Parse réponse JSON
6. Calcul score complétude + Top 10 jobs
7. Update `rag_metadata`

### Analyse d'une Offre
1. User soumet URL ou texte → POST `/api/match/analyze`
2. Fetch profil RAG utilisateur
3. Prompt Gemini : Compare profil vs offre
4. Parse match report (score, forces, gaps, keywords)
5. Insert dans `job_analyses`
6. Retour au Dashboard

### Génération CV
1. User clique "Générer CV" depuis une analyse → POST `/api/cv/generate`
2. Fetch profil RAG + analyse de match
3. Prompt Gemini : Génère CV optimisé pour cette offre
4. Sauvegarde JSON dans `cv_generations`
5. Génération PDF à la demande → GET `/api/cv/[id]/pdf` (Puppeteer)
6. Retour à l'aperçu + téléchargement PDF

---

## 📊 MÉTRIQUES DE SUCCÈS (POC)

- **Score complétude profil** : > 80/100
- **Temps génération CV** : < 30 secondes
- **Taux de précision match** : > 85% (subjectif pour POC)
- **Uptime** : > 99% (Vercel)

---

## 🚀 ÉTAT ACTUEL (2 janvier 2026)

### ✅ Fonctionnel
- Authentication Supabase
- Upload de documents
- Extraction de texte
- Dashboard de base
- Storage Supabase

### ⚠️ En Cours / Problématique
- **Génération RAG** : Debugging en cours
  - Documents présents (5 docs, 24k chars)
  - Gemini 3 modèles corrects
  - Logs de debug activés
  - **Problème** : Génération ne sauvegarde pas les données complètes

### ❌ Pas Encore Implémenté
- Lettres de motivation
- Templates CV multiples
- Export GitHub du profil RAG
- Analytics avancées
- Modèle Freemium / Payant

---

## 💡 RÈGLES D'OR POUR LE DÉVELOPPEMENT

1. **TOUJOURS vérifier le schéma réel** avant de coder (script d'inspection ou `01_tables.sql`)
2. **Utiliser `normalizeRAGData()`** pour gérer les structures RAG
3. **Logs de debug** : Console + Vercel Functions logs (pas Build)
4. **Test sur données réelles** : User ID = `d3573a39-f875-4405-9566-e440f1c7366d`
5. **Signed URLs** pour tout ce qui est privé (photos, CVs)
6. **Retry + Fallback** pour Gemini (rate limits fréquents)
7. **Build local** avant chaque deploy
8. **Git commit** messages clairs : `fix:`, `feat:`, `debug:`

---

**Ce document doit être mis à jour** à chaque découverte importante ou changement d'architecture.

**Dernière mise à jour par** : Claude (Antigravity)  
**Prochain review recommandé** : Quand le problème de génération RAG sera résolu
