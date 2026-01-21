ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload own CVs'
  ) THEN
    EXECUTE $p_upload_cvs$
      CREATE POLICY "Users can upload own CVs"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'cvs'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
    $p_upload_cvs$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can view own CVs'
  ) THEN
    EXECUTE $p_select_cvs$
      CREATE POLICY "Users can view own CVs"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'cvs'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
    $p_select_cvs$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own CVs'
  ) THEN
    EXECUTE $p_delete_cvs$
      CREATE POLICY "Users can delete own CVs"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'cvs'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
    $p_delete_cvs$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload own documents'
  ) THEN
    EXECUTE $p_upload_docs$
      CREATE POLICY "Users can upload own documents"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
    $p_upload_docs$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can view own documents'
  ) THEN
    EXECUTE $p_select_docs$
      CREATE POLICY "Users can view own documents"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
    $p_select_docs$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own documents'
  ) THEN
    EXECUTE $p_delete_docs$
      CREATE POLICY "Users can delete own documents"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
    $p_delete_docs$;
  END IF;
END $do$;
