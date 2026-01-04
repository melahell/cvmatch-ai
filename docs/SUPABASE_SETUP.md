# Configuration Supabase pour CVMatch AI

## 📦 Setup du Bucket de Stockage PDF

Le système de cache PDF nécessite un bucket Supabase Storage pour stocker les PDFs générés.

### 1. Créer le Bucket `cv-pdfs`

**Via l'interface Supabase Dashboard:**

1. Allez dans **Storage** dans le menu de gauche
2. Cliquez sur **"New bucket"**
3. Configurez le bucket:
   - **Name:** `cv-pdfs`
   - **Public:** ❌ Décoché (bucket privé)
   - **File size limit:** `5 MB` (5242880 bytes)
   - **Allowed MIME types:** `application/pdf`
4. Cliquez sur **"Create bucket"**

**OU via SQL (dans SQL Editor):**

```sql
-- Créer le bucket de stockage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cv-pdfs',
    'cv-pdfs',
    false,
    5242880,
    ARRAY['application/pdf']
);
```

---

### 2. Configurer les Policies de Sécurité

Les policies Supabase contrôlent qui peut accéder aux fichiers.

**Exécutez ce SQL dans Supabase SQL Editor:**

```sql
-- Policy 1: Permettre au serveur de lire/écrire/supprimer (via service_role_key)
-- Aucune policy nécessaire pour service_role_key (bypass RLS)

-- Policy 2: Les utilisateurs peuvent lire leurs propres PDFs (optionnel, pour future feature)
CREATE POLICY "Users can read their own CV PDFs"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'cv-pdfs'
    AND auth.uid() IS NOT NULL
);

-- Policy 3: Empêcher les utilisateurs de supprimer directement (seulement via API)
CREATE POLICY "Only service can delete CV PDFs"
ON storage.objects FOR DELETE
USING (false); -- Aucun utilisateur ne peut supprimer directement
```

---

### 3. Variables d'Environnement Requises

Assurez-vous que ces variables sont configurées dans Vercel/votre environnement:

```bash
# .env.local (développement)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (clé publique)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (clé secrète - PRIVÉE)

# .env.production (Vercel)
# Configurez les mêmes variables dans Vercel Dashboard → Settings → Environment Variables
```

**⚠️ IMPORTANT:** La `SUPABASE_SERVICE_ROLE_KEY` est utilisée par le cache PDF pour contourner les policies RLS. **NE JAMAIS** l'exposer côté client.

---

### 4. Structure du Stockage

Les PDFs sont stockés avec la structure suivante:

```
cv-pdfs/
├── cv-pdfs/
│   ├── {cv_id}_A4.pdf
│   ├── {cv_id}_Letter.pdf
│   ├── {autre_cv_id}_A4.pdf
│   └── ...
```

**Exemple:**
- `cv-pdfs/cv-pdfs/550e8400-e29b-41d4-a716-446655440000_A4.pdf`
- `cv-pdfs/cv-pdfs/550e8400-e29b-41d4-a716-446655440000_Letter.pdf`

---

### 5. Vérifier la Configuration

**Test manuel via Supabase Dashboard:**

1. Allez dans **Storage** → **cv-pdfs**
2. Essayez de uploader manuellement un PDF test
3. Si succès → Configuration OK ✅

**Test programmatique (via code):**

```typescript
import { PDFCache } from "@/lib/cv/pdf-cache";

// Test dans une fonction serverless
const cache = new PDFCache();

// Test store
const testPDF = new Uint8Array([/* données PDF */]);
const success = await cache.storePDF("test-cv-id", "A4", testPDF);
console.log("Store test:", success); // Devrait être true

// Test get
const cachedPDF = await cache.getCachedPDF("test-cv-id", "A4");
console.log("Get test:", cachedPDF !== null); // Devrait être true

// Test invalidate
const invalidated = await cache.invalidatePDF("test-cv-id");
console.log("Invalidate test:", invalidated); // Devrait être true
```

---

### 6. Monitoring et Maintenance

#### **Voir l'usage du stockage:**
```sql
SELECT
    bucket_id,
    COUNT(*) as total_files,
    SUM(metadata->>'size')::bigint as total_size_bytes,
    ROUND(SUM(metadata->>'size')::bigint / 1024.0 / 1024.0, 2) as total_size_mb
FROM storage.objects
WHERE bucket_id = 'cv-pdfs'
GROUP BY bucket_id;
```

#### **Lister les fichiers par date:**
```sql
SELECT
    name,
    created_at,
    ROUND((metadata->>'size')::bigint / 1024.0, 2) as size_kb
FROM storage.objects
WHERE bucket_id = 'cv-pdfs'
ORDER BY created_at DESC
LIMIT 20;
```

#### **Nettoyer les fichiers > 7 jours (optionnel):**
```sql
DELETE FROM storage.objects
WHERE bucket_id = 'cv-pdfs'
AND created_at < NOW() - INTERVAL '7 days';
```

---

### 7. Limites et Quotas Supabase

| Plan | Storage Gratuit | Limite Fichiers | Bande Passante |
|------|----------------|-----------------|----------------|
| **Free** | 1 GB | Illimité | 2 GB/mois |
| **Pro** | 100 GB | Illimité | 200 GB/mois |
| **Team** | 100 GB | Illimité | 250 GB/mois |

**Estimations pour CVMatch AI:**
- Taille moyenne PDF: ~100 KB
- 1 GB = ~10,000 PDFs en cache
- Avec TTL 24h, rotation naturelle des fichiers

---

### 8. Troubleshooting

#### **Erreur: "Bucket does not exist"**
- Vérifier que le bucket `cv-pdfs` est créé dans Supabase Dashboard
- Vérifier l'URL du projet Supabase dans `.env`

#### **Erreur: "Permission denied"**
- Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est configurée
- Vérifier que la clé est la **service_role** et non l'**anon** key

#### **Erreur: "File too large"**
- Les PDFs ne devraient jamais dépasser 5 MB
- Si problème, vérifier la génération Puppeteer (résolution, images)

#### **Cache ne fonctionne pas (toujours MISS)**
- Vérifier les logs serveur pour erreurs
- Tester manuellement avec le code de test ci-dessus
- Vérifier que `NODE_ENV=production` en production

---

### 9. Sécurité Best Practices

✅ **À FAIRE:**
- Utiliser `service_role_key` uniquement côté serveur
- Définir un `file_size_limit` raisonnable (5 MB)
- Restreindre MIME types à `application/pdf` uniquement
- Monitorer l'usage régulièrement

❌ **À NE PAS FAIRE:**
- Exposer `service_role_key` côté client
- Rendre le bucket public
- Permettre uploads illimités sans validation
- Stocker des données sensibles sans chiffrement

---

### 10. Migration Manuelle (si bucket existe déjà)

Si vous avez déjà un bucket `cv-pdfs` mal configuré:

```sql
-- Supprimer l'ancien bucket
DELETE FROM storage.buckets WHERE id = 'cv-pdfs';

-- Supprimer tous les objets
DELETE FROM storage.objects WHERE bucket_id = 'cv-pdfs';

-- Recréer avec bonne config (voir étape 1)
```

---

**Configuration terminée ! 🎉**

Vous pouvez maintenant utiliser le cache PDF. Les PDFs seront automatiquement:
- Stockés après génération (MISS)
- Servis depuis le cache (HIT)
- Invalidés lors de régénération du CV
- Expirés après 24h (TTL)

**Logs à surveiller:**
- `✅ PDF Cache HIT` → PDF servi depuis cache
- `⚠️ PDF Cache MISS` → Génération Puppeteer nécessaire
- `💾 PDF cached successfully` → Stockage réussi
