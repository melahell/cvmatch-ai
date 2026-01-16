-- =============================================
-- STORAGE: Configuration pour les photos de profil
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- Créer le bucket pour les photos de profil (si pas déjà créé via UI)
-- Note: Normalement, on crée les buckets via l'interface Supabase Storage
-- Mais on peut aussi le faire en SQL si nécessaire

-- Vérifier si le bucket existe
SELECT * FROM storage.buckets WHERE name = 'profile-photos';

-- Si le bucket n'existe pas, le créer via l'interface Supabase Storage:
-- 1. Aller dans Storage > Create a new bucket
-- 2. Nom: 'profile-photos'
-- 3. Public: OUI (pour que les photos soient accessibles publiquement)
-- 4. File size limit: 5MB
-- 5. Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp

-- Policies RLS pour profile-photos bucket
-- Permettre aux utilisateurs authentifiés d'uploader leurs photos

-- Policy: Permettre l'upload (INSERT)
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Policy: Permettre la lecture publique (SELECT)
CREATE POLICY "Profile photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Policy: Permettre la mise à jour (UPDATE)
CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Policy: Permettre la suppression (DELETE)
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = 'avatars'
);
