# 🔧 Configuration des Variables d'Environnement

Ce document décrit toutes les variables d'environnement requises pour faire fonctionner CVMatch AI en production.

---

## ⚠️ Variables CRITIQUES Manquantes

Les variables suivantes sont **OBLIGATOIRES** pour le bon fonctionnement de l'application mais sont actuellement **ABSENTES** des fichiers de configuration :

### 1. `GEMINI_API_KEY` 🔴 CRITIQUE

**Description:** Clé API Google Gemini pour toutes les opérations d'IA (génération RAG, analyse de match, extraction de texte)

**Obtention:**
1. Aller sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créer une nouvelle API key
3. Copier la clé (format: `AIza...`)

**Impact si manquante:**
- ❌ Génération de profil RAG échoue
- ❌ Analyse de match job impossible
- ❌ Extraction de texte depuis PDF/images échoue
- ❌ Génération de CV échoue

**Ajouter dans Vercel:**
```bash
Vercel Dashboard > Project > Settings > Environment Variables
Name: GEMINI_API_KEY
Value: AIzaSy...votre_clé_ici
Environments: Production, Preview, Development
```

---

### 2. `SUPABASE_SERVICE_KEY` 🔴 CRITIQUE

**Description:** Clé de service Supabase (service_role) pour opérations admin côté serveur

**Obtention:**
1. Aller sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionner votre projet
3. Settings > API
4. Copier "service_role key" (⚠️ JAMAIS la clé "anon public")

**Impact si manquante:**
- ❌ Upload de photos de profil échoue
- ❌ Génération de CV échoue
- ❌ Opérations admin échouent
- ❌ Bypass des RLS policies impossible

**Ajouter dans Vercel:**
```bash
Vercel Dashboard > Project > Settings > Environment Variables
Name: SUPABASE_SERVICE_KEY
Value: eyJhbGci...votre_service_role_key_ici
Environments: Production, Preview, Development
```

**⚠️ ATTENTION:** Cette clé donne un accès complet à la base de données. **NE JAMAIS l'exposer côté client** ou la committer dans Git.

---

## ✅ Variables Déjà Configurées

Ces variables sont déjà présentes dans les fichiers `.env.prod` et `.env.production` :

### `NEXT_PUBLIC_SUPABASE_URL`
- Valeur: `https://tyaoacdfxigxffdbhqja.supabase.co`
- Description: URL publique du projet Supabase
- ✅ Configurée

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Valeur: `sb_publishable_jfSZuKZ5ZzCwdJvNV7nGJQ_t3f79x70`
- Description: Clé anonyme publique Supabase (safe pour le client)
- ✅ Configurée

### `VERCEL_OIDC_TOKEN`
- Description: Token OIDC généré par Vercel (auto-configuré)
- ✅ Configurée

---

## 🔄 Variables Optionnelles

Ces variables ne sont pas critiques mais améliorent certaines fonctionnalités :

### `GITHUB_TOKEN`
**Description:** Personal Access Token GitHub pour sync RAG (feature incomplète)
**Statut:** ⚠️ Feature non implémentée
**Requis:** Non

### `GITHUB_REPO_OWNER`
**Description:** Propriétaire du repo GitHub pour sync
**Statut:** ⚠️ Feature non implémentée
**Requis:** Non

### `GITHUB_REPO_NAME`
**Description:** Nom du repo GitHub pour sync
**Statut:** ⚠️ Feature non implémentée
**Requis:** Non

---

## 📋 Checklist de Déploiement

Avant de déployer en production, vérifiez que :

- [ ] `GEMINI_API_KEY` est configurée dans Vercel
- [ ] `SUPABASE_SERVICE_KEY` est configurée dans Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` est correcte
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` est correcte
- [ ] Toutes les variables sont définies pour **Production**, **Preview** et **Development**
- [ ] Le déploiement a été redéclenché après ajout des variables

---

## 🛠️ Comment Ajouter les Variables dans Vercel

### Méthode 1: Via Dashboard (Recommandé)

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner votre projet (cvmatch-ai-prod)
3. Aller dans **Settings** → **Environment Variables**
4. Cliquer sur **Add New**
5. Remplir:
   - **Name:** Le nom de la variable (ex: `GEMINI_API_KEY`)
   - **Value:** La valeur de la variable
   - **Environments:** Cocher **Production**, **Preview**, **Development**
6. Cliquer sur **Save**
7. **IMPORTANT:** Redéployer l'application pour que les changements prennent effet

### Méthode 2: Via CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Ajouter les variables
vercel env add GEMINI_API_KEY production
vercel env add GEMINI_API_KEY preview
vercel env add GEMINI_API_KEY development

vercel env add SUPABASE_SERVICE_KEY production
vercel env add SUPABASE_SERVICE_KEY preview
vercel env add SUPABASE_SERVICE_KEY development

# Redéployer
vercel --prod
```

---

## 🧪 Tester la Configuration

Après avoir ajouté les variables d'environnement, testez que tout fonctionne :

### Test 1: Vérifier les variables côté serveur

Créer un endpoint de test temporaire :

```typescript
// app/api/test-env/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        hasSupabaseService: !!process.env.SUPABASE_SERVICE_KEY,
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
}
```

Appeler : `https://votre-domaine.vercel.app/api/test-env`

Résultat attendu :
```json
{
  "hasGeminiKey": true,
  "hasSupabaseService": true,
  "supabaseUrl": true
}
```

⚠️ **Supprimer cet endpoint après le test** pour éviter de leak des infos sensibles.

### Test 2: Tester la génération RAG

1. Se connecter à l'application
2. Aller dans **Dashboard** → **Mon Profil**
3. Uploader un CV
4. Cliquer sur **Générer mon profil RAG**
5. Vérifier qu'il n'y a pas d'erreur "Missing AI API key"

### Test 3: Tester l'analyse de match

1. Aller dans **Dashboard** → **Analyser**
2. Coller une offre d'emploi
3. Cliquer sur **Analyser le Match**
4. Vérifier que l'analyse se génère correctement

---

## 🔒 Sécurité des Variables

### Variables Publiques (Safe pour le client)
Ces variables commencent par `NEXT_PUBLIC_` et peuvent être exposées :
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Variables Privées (Serveur uniquement)
Ces variables **NE DOIVENT JAMAIS** être exposées côté client :
- 🔒 `GEMINI_API_KEY`
- 🔒 `SUPABASE_SERVICE_KEY`
- 🔒 `GITHUB_TOKEN`

**Next.js garantit automatiquement** que les variables sans `NEXT_PUBLIC_` ne sont jamais envoyées au client.

---

## 🐛 Dépannage

### "Server configuration error: Missing AI API key"
➡️ `GEMINI_API_KEY` n'est pas définie ou mal configurée

**Solution:**
1. Vérifier que la variable existe dans Vercel
2. Vérifier qu'elle est définie pour l'environnement correct (Production/Preview)
3. Redéployer après ajout

### "Supabase Admin Configuration Missing"
➡️ `SUPABASE_SERVICE_KEY` n'est pas définie

**Solution:**
1. Récupérer la clé depuis Supabase Dashboard > Settings > API
2. L'ajouter dans Vercel avec le nom exact `SUPABASE_SERVICE_KEY`
3. Redéployer

### Les variables sont ajoutées mais l'erreur persiste
➡️ Le déploiement n'a pas été mis à jour

**Solution:**
```bash
# Forcer un nouveau déploiement
vercel --prod --force
```

Ou via le dashboard :
1. Deployments tab
2. Cliquer sur les 3 points du dernier déploiement
3. Sélectionner **Redeploy**

---

## 📞 Support

En cas de problème de configuration :

1. Vérifier la [documentation Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
2. Vérifier la [documentation Supabase](https://supabase.com/docs/guides/api)
3. Vérifier la [documentation Google AI](https://ai.google.dev/tutorials/setup)
4. Créer une issue sur le repo GitHub

---

**Dernière mise à jour:** 21 janvier 2025
**Version:** 1.0.0
