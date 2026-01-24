-- =============================================
-- MIGRATION 07: CV Versions Table
-- Historique des versions de CV pour versioning et rollback
-- =============================================

CREATE TABLE IF NOT EXISTS cv_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_generations(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    cv_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(cv_id, version_number)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_cv_versions_cv_id ON cv_versions(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_versions_created_at ON cv_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cv_versions_cv_id_version ON cv_versions(cv_id, version_number DESC);

-- RLS Policies
ALTER TABLE cv_versions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view their own CV versions" ON cv_versions;
DROP POLICY IF EXISTS "Users can create their own CV versions" ON cv_versions;
DROP POLICY IF EXISTS "Users can delete their own CV versions" ON cv_versions;

CREATE POLICY "Users can view their own CV versions"
    ON cv_versions FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Users can create their own CV versions"
    ON cv_versions FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own CV versions"
    ON cv_versions FOR DELETE
    USING (created_by = auth.uid());
