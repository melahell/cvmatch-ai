-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_analyses_updated_at
  BEFORE UPDATE ON job_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rag_metadata_updated_at
  BEFORE UPDATE ON rag_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Function pour créer automatiquement un user après signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, user_id)
  VALUES (
    NEW.id,
    NEW.email,
    LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '-'))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users (créé par Supabase Auth)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Function pour calculer les stats utilisateur
-- =============================================
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_analyses', COUNT(*),
    'total_cvs_generated', COUNT(*) FILTER (WHERE cv_generated = true),
    'total_applied', COUNT(*) FILTER (WHERE applied = true),
    'total_interviews', COUNT(*) FILTER (WHERE application_status = 'interviewing'),
    'avg_match_score', ROUND(AVG(match_score)::numeric, 1),
    'conversion_rate', ROUND(
      (COUNT(*) FILTER (WHERE cv_generated = true)::numeric / NULLIF(COUNT(*), 0) * 100)::numeric, 1
    )
  ) INTO result
  FROM job_analyses
  WHERE user_id = p_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;