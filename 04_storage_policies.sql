-- =============================================
-- STORAGE BUCKETS
-- À configurer via Supabase Dashboard > Storage
-- =============================================

-- Note: Les buckets se créent via l'interface Supabase
-- Mais voici les policies à appliquer après création

-- Bucket: cvs (pour les CVs générés)
-- Bucket: documents (pour les uploads utilisateurs)
-- Bucket: lm (pour les lettres de motivation)

-- Policies pour le bucket 'cvs' (à exécuter après création du bucket)
/*
CREATE POLICY "Users can upload own CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- Policies pour le bucket 'documents'
/*
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/
```

---

## 📋 **PROMPT COMPLET POUR CLAUDE CHROME**

Voici le prompt à donner à Claude Chrome pour exécuter tout ça :
```
Va sur mon projet Supabase (supabase.com/dashboard), 
sélectionne le projet "cvcrush", puis :

1. Va dans SQL Editor > New Query

2. Exécute ce premier script (Tables) :
[COPIE LE SCRIPT 1 CI-DESSUS]

3. Clique "Run" et vérifie que ça affiche "Success"

4. Crée une nouvelle query et exécute ce script (RLS) :
[COPIE LE SCRIPT 2 CI-DESSUS]

5. Clique "Run" et vérifie "Success"

6. Crée une nouvelle query et exécute ce script (Functions) :
[COPIE LE SCRIPT 3 CI-DESSUS]

7. Clique "Run" et vérifie "Success"

8. Va dans Storage > Create a new bucket :
   - Nom: "cvs"
   - Public bucket: Non
   - Crée

9. Crée un autre bucket :
   - Nom: "documents"
   - Public bucket: Non
   - Crée

10. Confirme-moi que tout est créé avec succès.