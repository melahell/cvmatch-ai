ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rag_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cv_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lm_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gemini_api_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.users FOR DELETE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own RAG metadata" ON public.rag_metadata;
DROP POLICY IF EXISTS "Users can insert own RAG metadata" ON public.rag_metadata;
DROP POLICY IF EXISTS "Users can update own RAG metadata" ON public.rag_metadata;
DROP POLICY IF EXISTS "Users can delete own RAG metadata" ON public.rag_metadata;

CREATE POLICY "Users can view own RAG metadata"
  ON public.rag_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own RAG metadata"
  ON public.rag_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own RAG metadata"
  ON public.rag_metadata FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own RAG metadata"
  ON public.rag_metadata FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own job analyses" ON public.job_analyses;
DROP POLICY IF EXISTS "Users can insert own job analyses" ON public.job_analyses;
DROP POLICY IF EXISTS "Users can update own job analyses" ON public.job_analyses;
DROP POLICY IF EXISTS "Users can delete own job analyses" ON public.job_analyses;

CREATE POLICY "Users can view own job analyses"
  ON public.job_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job analyses"
  ON public.job_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job analyses"
  ON public.job_analyses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own job analyses"
  ON public.job_analyses FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own saved jobs" ON public.saved_jobs;
DROP POLICY IF EXISTS "Users can insert own saved jobs" ON public.saved_jobs;
DROP POLICY IF EXISTS "Users can update own saved jobs" ON public.saved_jobs;
DROP POLICY IF EXISTS "Users can delete own saved jobs" ON public.saved_jobs;

CREATE POLICY "Users can view own saved jobs"
  ON public.saved_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved jobs"
  ON public.saved_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved jobs"
  ON public.saved_jobs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved jobs"
  ON public.saved_jobs FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own CV generations" ON public.cv_generations;
DROP POLICY IF EXISTS "Users can insert own CV generations" ON public.cv_generations;
DROP POLICY IF EXISTS "Users can delete own CV generations" ON public.cv_generations;

CREATE POLICY "Users can view own CV generations"
  ON public.cv_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CV generations"
  ON public.cv_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own CV generations"
  ON public.cv_generations FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own LM generations" ON public.lm_generations;
DROP POLICY IF EXISTS "Users can insert own LM generations" ON public.lm_generations;
DROP POLICY IF EXISTS "Users can delete own LM generations" ON public.lm_generations;

CREATE POLICY "Users can view own LM generations"
  ON public.lm_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own LM generations"
  ON public.lm_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own LM generations"
  ON public.lm_generations FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own documents" ON public.uploaded_documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.uploaded_documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.uploaded_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.uploaded_documents;

CREATE POLICY "Users can view own documents"
  ON public.uploaded_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON public.uploaded_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON public.uploaded_documents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON public.uploaded_documents FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can insert own analytics" ON public.analytics_events;

CREATE POLICY "Users can view own analytics"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF to_regclass('public.gemini_api_logs') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own Gemini logs" ON public.gemini_api_logs';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own Gemini logs" ON public.gemini_api_logs';
    EXECUTE 'CREATE POLICY "Users can view their own Gemini logs" ON public.gemini_api_logs FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can insert their own Gemini logs" ON public.gemini_api_logs FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regprocedure('public.update_updated_at_column()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp';
  END IF;

  IF to_regprocedure('public.update_last_updated_column()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.update_last_updated_column() SET search_path = public, pg_temp';
  END IF;

  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp';
  END IF;

  IF to_regprocedure('public.get_user_stats(uuid)') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.get_user_stats(uuid) SET search_path = public, pg_temp';
  END IF;
END $$;
