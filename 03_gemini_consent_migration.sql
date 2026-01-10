-- Migration: Ajout du consentement Google Gemini (RGPD)
-- Date: 2026-01-10

-- Ajouter colonne gemini_consent à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS gemini_consent BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gemini_consent_date TIMESTAMP;

-- Ajouter colonne pour tracking de la révocation
ALTER TABLE users ADD COLUMN IF NOT EXISTS gemini_consent_revoked_date TIMESTAMP;

-- Créer table pour logs des envois à Gemini (transparence RGPD)
CREATE TABLE IF NOT EXISTS gemini_api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'rag_extraction', 'job_analysis', 'cv_generation', 'lm_generation'
    data_sent_summary JSONB, -- Résumé des données envoyées (PAS les données elles-mêmes)
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_gemini_logs_user_id ON gemini_api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_gemini_logs_created_at ON gemini_api_logs(created_at DESC);

-- RLS Policy pour gemini_api_logs
ALTER TABLE gemini_api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own Gemini logs"
ON gemini_api_logs
FOR SELECT
USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Commentaires pour documentation
COMMENT ON COLUMN users.gemini_consent IS 'Consentement RGPD pour l''envoi des données à Google Gemini AI';
COMMENT ON COLUMN users.gemini_consent_date IS 'Date à laquelle l''utilisateur a donné son consentement';
COMMENT ON TABLE gemini_api_logs IS 'Logs des envois de données à Google Gemini (transparence RGPD Article 15)';
