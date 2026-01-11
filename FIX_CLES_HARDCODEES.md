# FIX - SUPPRIMER LES CLÉS HARDCODÉES

## Problème Actuel

**Fichier:** `lib/supabase.ts`

```typescript
// ❌ LIGNES À SUPPRIMER
const FALLBACK_URL = "https://tyaoacdfxigxffdbhqja.supabase.co";
const FALLBACK_KEY = "sb_publishable_jfSZuKZ5ZzCwdJvNV7nGJQ_t3f79x70";

export const createSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;  // ❌
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;  // ❌
```

**Risque:** Si le code source est public ou leaké, les clés Supabase sont exposées.

---

## Solution: Utiliser UNIQUEMENT les Variables d'Environnement

### Code Corrigé

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const createSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            "❌ Supabase Configuration Missing: " +
            "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in environment variables."
        );
    }

    return createClient(supabaseUrl, supabaseKey);
};
```

### Avantages

✅ Pas de clés exposées dans le code source
✅ Erreur claire si les env vars manquent
✅ Force la configuration correcte dès le dev local
✅ Conforme aux best practices de sécurité

---

## Checklist de Migration

- [ ] Supprimer les lignes 4-6 dans `lib/supabase.ts`
- [ ] Modifier les lignes 9-10 pour utiliser uniquement `process.env.*`
- [ ] Ajouter un `if (!supabaseUrl || !supabaseKey)` avec throw Error
- [ ] Tester localement que les env vars sont bien chargées
- [ ] Vérifier que Vercel a bien les env vars (déjà fait ✅ voir screenshot)
- [ ] Commit et push
- [ ] Redéployer sur Vercel
- [ ] Vérifier en production que ça fonctionne

---

## Variables à Vérifier dans Vercel (déjà configurées ✅)

D'après votre screenshot Vercel, ces variables sont déjà présentes:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `GEMINI_API_KEY`

**→ Aucune action nécessaire côté Vercel, juste supprimer les fallbacks dans le code.**
