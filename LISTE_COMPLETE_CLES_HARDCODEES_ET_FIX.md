# LISTE COMPLÈTE DES CLÉS HARDCODÉES + FIX

## 📋 INVENTAIRE COMPLET

### 1. `lib/supabase.ts` (CRITIQUE 🔴)

**Lignes 5-6:**
```typescript
const FALLBACK_URL = "https://tyaoacdfxigxffdbhqja.supabase.co";
const FALLBACK_KEY = "sb_publishable_jfSZuKZ5ZzCwdJvNV7nGJQ_t3f79x70";
```

**Utilisées aux lignes 9-10:**
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;
```

**Comparaison avec Vercel (screenshot):**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` existe dans Vercel
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` existe dans Vercel

**Risque:** Si le code source est public/leaké, accès à la base Supabase

---

### 2. `lib/github.ts` (MOYEN ⚠️)

**Lignes 5-6:**
```typescript
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "melahell";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "cv-rag-data";
```

**Comparaison avec Vercel (screenshot):**
- ❓ `GITHUB_REPO_OWNER` - NON VISIBLE dans le screenshot (probablement absent)
- ❓ `GITHUB_REPO_NAME` - NON VISIBLE dans le screenshot (probablement absent)

**Risque:** Moins critique (noms de repos, pas de credentials), mais mauvaise pratique

---

### 3. `scripts/check-tables.js` (CRITIQUE 🔴)

**Lignes 4-5:**
```typescript
const SUPABASE_URL = "https://tyaoacdfxigxffdbhqja.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_jfSZuKZ5ZzCwdJvNV7nGJQ_t3f79x70";
```

**Utilisation:** Script de vérification des tables (probablement dev/debug)

**Risque:** Même clés que lib/supabase.ts, exposées dans le repo

---

## 🔍 ANALYSE DES CLÉS VERCEL (d'après screenshot)

Variables d'environnement configurées dans Vercel:
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `GEMINI_API_KEY`

**Variables MANQUANTES:**
- ❌ `GITHUB_TOKEN` (pour pushToGitHub)
- ❌ `GITHUB_REPO_OWNER`
- ❌ `GITHUB_REPO_NAME`

---

## 🛠️ FIX À APPLIQUER

### Fix #1: `lib/supabase.ts` (PRIORITÉ 1 🔴)

**Avant:**
```typescript
import { createClient } from "@supabase/supabase-js";

// Fallback keys for Vercel environments where variables might be missing temporarily
const FALLBACK_URL = "https://tyaoacdfxigxffdbhqja.supabase.co";
const FALLBACK_KEY = "sb_publishable_jfSZuKZ5ZzCwdJvNV7nGJQ_t3f79x70";

export const createSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase Configuration Missing: URL or Key is undefined.");
    }

    return createClient(supabaseUrl, supabaseKey);
};
```

**Après:**
```typescript
import { createClient } from "@supabase/supabase-js";

export const createSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            "❌ Supabase Configuration Missing:\n" +
            "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in environment variables.\n" +
            "Check your .env.local file or Vercel environment settings."
        );
    }

    return createClient(supabaseUrl, supabaseKey);
};
```

**Changements:**
- ❌ Supprimer lignes 4-6 (FALLBACK_URL et FALLBACK_KEY)
- ❌ Supprimer les `|| FALLBACK` des lignes 9-10
- ✅ Améliorer le message d'erreur pour le debugging

---

### Fix #2: `lib/github.ts` (PRIORITÉ 2 ⚠️)

**Avant:**
```typescript
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "melahell";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "cv-rag-data";
```

**Après:**
```typescript
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;

// Validation au démarrage du module
if (!REPO_OWNER || !REPO_NAME) {
    console.warn(
        "⚠️ GitHub configuration incomplete:\n" +
        "GITHUB_REPO_OWNER and GITHUB_REPO_NAME should be set in environment variables.\n" +
        "GitHub sync will be disabled."
    );
}
```

**Changements:**
- ❌ Supprimer les fallbacks `|| "melahell"` et `|| "cv-rag-data"`
- ✅ Ajouter validation avec warning (pas throw car fonctionnalité optionnelle)

---

### Fix #3: `scripts/check-tables.js` (PRIORITÉ 1 🔴)

**Avant:**
```javascript
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://tyaoacdfxigxffdbhqja.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_jfSZuKZ5ZzCwdJvNV7nGJQ_t3f79x70";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**Après:**
```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Charger .env.local

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('Create a .env.local file with these variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**Changements:**
- ❌ Supprimer les clés hardcodées lignes 4-5
- ✅ Utiliser process.env avec dotenv
- ✅ Ajouter validation avec exit si manquant
- ✅ Ajouter `dotenv` au package.json si absent

---

## 📝 VARIABLES À AJOUTER DANS VERCEL

D'après l'audit, ces variables sont manquantes dans Vercel:

```bash
# GitHub Storage (optionnel, pour l'implémentation future)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO_OWNER=melahell
GITHUB_REPO_NAME=cv-rag-data
```

**Note:** Ces variables ne sont pas encore utilisées (pushToGitHub pas appelé), donc pas urgent.

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### Étape 1: Modifier les fichiers (10 min)
- [ ] Modifier `lib/supabase.ts` (supprimer lignes 4-6, 9-10)
- [ ] Modifier `lib/github.ts` (supprimer fallbacks lignes 5-6)
- [ ] Modifier `scripts/check-tables.js` (utiliser dotenv)

### Étape 2: Tester localement (5 min)
- [ ] Vérifier que `.env.local` contient les variables
- [ ] Run `npm run dev` et vérifier que l'app démarre
- [ ] Tester upload de CV
- [ ] Vérifier les erreurs dans console

### Étape 3: Commit et Push (2 min)
- [ ] `git add lib/supabase.ts lib/github.ts scripts/check-tables.js`
- [ ] `git commit -m "Security: Remove hardcoded Supabase keys and use env vars only"`
- [ ] `git push`

### Étape 4: Vérifier Vercel (5 min)
- [ ] Vérifier que les env vars existent dans Vercel Settings
- [ ] Redéployer sur Vercel
- [ ] Tester l'app en production
- [ ] Vérifier qu'aucune erreur "Configuration Missing"

---

## 🔒 SÉCURITÉ SUPPLÉMENTAIRE (BONUS)

### Rotation des clés Supabase

Puisque les clés actuelles sont exposées dans le code:
1. Aller dans Supabase Dashboard
2. Project Settings > API
3. Cliquer "Reset" sur `anon public key`
4. Mettre à jour la nouvelle clé dans Vercel
5. Redéployer

**⚠️ Attention:** Cela cassera l'app jusqu'à ce que vous mettiez à jour Vercel.

---

## 📊 RÉCAPITULATIF

| Fichier | Clés Hardcodées | Priorité | Vars Vercel Manquantes | Fix Appliqué |
|---------|-----------------|----------|------------------------|--------------|
| `lib/supabase.ts` | `FALLBACK_URL`, `FALLBACK_KEY` | 🔴 CRITIQUE | Aucune (vars OK) | ❌ À faire |
| `lib/github.ts` | `REPO_OWNER`, `REPO_NAME` | ⚠️ MOYEN | `GITHUB_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` | ❌ À faire |
| `scripts/check-tables.js` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | 🔴 CRITIQUE | Aucune (vars OK) | ❌ À faire |

**Temps estimé pour le fix complet: 20 minutes**

---

Voulez-vous que j'applique ces fix maintenant?
