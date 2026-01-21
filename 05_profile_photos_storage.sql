ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload their own profile photos'
  ) THEN
    EXECUTE 'DROP POLICY "Users can upload their own profile photos" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can view their own profile photos'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view their own profile photos" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their own profile photos'
  ) THEN
    EXECUTE 'DROP POLICY "Users can update their own profile photos" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete their own profile photos'
  ) THEN
    EXECUTE 'DROP POLICY "Users can delete their own profile photos" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Profile photos are publicly accessible'
  ) THEN
    EXECUTE 'DROP POLICY "Profile photos are publicly accessible" ON storage.objects';
  END IF;

  EXECUTE $p_insert_photos$
    CREATE POLICY "Users can upload their own profile photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'profile-photos'
      AND (storage.foldername(name))[1] = 'avatars'
      AND (storage.foldername(name))[2] = auth.uid()::text
    )
  $p_insert_photos$;

  EXECUTE $p_select_photos$
    CREATE POLICY "Users can view their own profile photos"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'profile-photos'
      AND (storage.foldername(name))[1] = 'avatars'
      AND (storage.foldername(name))[2] = auth.uid()::text
    )
  $p_select_photos$;

  EXECUTE $p_update_photos$
    CREATE POLICY "Users can update their own profile photos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'profile-photos'
      AND (storage.foldername(name))[1] = 'avatars'
      AND (storage.foldername(name))[2] = auth.uid()::text
    )
    WITH CHECK (
      bucket_id = 'profile-photos'
      AND (storage.foldername(name))[1] = 'avatars'
      AND (storage.foldername(name))[2] = auth.uid()::text
    )
  $p_update_photos$;

  EXECUTE $p_delete_photos$
    CREATE POLICY "Users can delete their own profile photos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'profile-photos'
      AND (storage.foldername(name))[1] = 'avatars'
      AND (storage.foldername(name))[2] = auth.uid()::text
    )
  $p_delete_photos$;
END $do$;
