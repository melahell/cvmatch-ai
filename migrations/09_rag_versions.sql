-- [CDC-6] RAG Versioning Table
-- Permet de garder un historique des versions RAG pour rollback et audit

CREATE TABLE IF NOT EXISTS rag_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    rag_data JSONB NOT NULL,
    diff_from_previous JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_reason VARCHAR(50) DEFAULT 'manual', -- 'manual', 'merge', 'regeneration', 'import'
    UNIQUE(user_id, version_number)
);

-- Index pour recherche rapide par user
CREATE INDEX IF NOT EXISTS idx_rag_versions_user_id ON rag_versions(user_id);

-- Index pour recherche par date
CREATE INDEX IF NOT EXISTS idx_rag_versions_created_at ON rag_versions(created_at DESC);

-- Fonction pour auto-incrémenter le numéro de version
CREATE OR REPLACE FUNCTION get_next_rag_version(p_user_id UUID) 
RETURNS INTEGER AS $$
DECLARE
    next_version INTEGER;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM rag_versions
    WHERE user_id = p_user_id;
    
    RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- RLS Policy pour sécurité
ALTER TABLE rag_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own RAG versions"
    ON rag_versions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own RAG versions"
    ON rag_versions FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Limite à 10 versions par utilisateur (garder les 10 plus récentes)
CREATE OR REPLACE FUNCTION cleanup_old_rag_versions()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM rag_versions
    WHERE user_id = NEW.user_id
    AND id NOT IN (
        SELECT id FROM rag_versions
        WHERE user_id = NEW.user_id
        ORDER BY version_number DESC
        LIMIT 10
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_old_rag_versions
    AFTER INSERT ON rag_versions
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_old_rag_versions();
