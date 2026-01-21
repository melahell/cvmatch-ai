-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Sécurité : chaque user ne voit que ses données
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lm_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES: users
-- =============================================
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- POLICIES: rag_metadata
-- =============================================
CREATE POLICY "Users can view own RAG metadata"
  ON rag_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own RAG metadata"
  ON rag_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own RAG metadata"
  ON rag_metadata FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own RAG metadata"
  ON rag_metadata FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- POLICIES: job_analyses
-- =============================================
CREATE POLICY "Users can view own job analyses"
  ON job_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job analyses"
  ON job_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job analyses"
  ON job_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own job analyses"
  ON job_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- POLICIES: saved_jobs
-- =============================================
CREATE POLICY "Users can view own saved jobs"
  ON saved_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved jobs"
  ON saved_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved jobs"
  ON saved_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved jobs"
  ON saved_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- POLICIES: cv_generations
-- =============================================
CREATE POLICY "Users can view own CV generations"
  ON cv_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CV generations"
  ON cv_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own CV generations"
  ON cv_generations FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- POLICIES: lm_generations
-- =============================================
CREATE POLICY "Users can view own LM generations"
  ON lm_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own LM generations"
  ON lm_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own LM generations"
  ON lm_generations FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- POLICIES: uploaded_documents
-- =============================================
CREATE POLICY "Users can view own documents"
  ON uploaded_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON uploaded_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON uploaded_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON uploaded_documents FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- POLICIES: analytics_events
-- =============================================
CREATE POLICY "Users can view own analytics"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
