-- =============================================
-- MIGRATION: RAG VERSIONING (Axe 6)
-- Preserves RAG history to prevent data loss.
-- =============================================

-- 1. Create the versions table
DROP TABLE IF EXISTS rag_versions CASCADE;
CREATE TABLE rag_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rag_id UUID REFERENCES rag_metadata(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    data_snapshot JSONB NOT NULL, -- The complete state of completeness_details
    change_reason VARCHAR(50) DEFAULT 'update', -- 'generation', 'user_edit', etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast history lookup
CREATE INDEX idx_rag_versions_rag_id ON rag_versions(rag_id);
CREATE INDEX idx_rag_versions_user_id ON rag_versions(user_id);
CREATE INDEX idx_rag_versions_created_at ON rag_versions(created_at DESC);

-- 2. Create the Trigger Function
CREATE OR REPLACE FUNCTION archive_rag_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Only archive if completeness_details changed
    IF OLD.completeness_details IS DISTINCT FROM NEW.completeness_details THEN
        INSERT INTO rag_versions (
            rag_id,
            user_id,
            version_number,
            data_snapshot,
            change_reason,
            created_at
        ) VALUES (
            OLD.id,
            OLD.user_id,
            COALESCE(OLD.rag_version, 1),
            OLD.completeness_details,
            'auto_archive', -- Default reason, can be enhanced via app logic later
            NOW()
        );
        
        -- Increment version in the main table
        NEW.rag_version := COALESCE(OLD.rag_version, 1) + 1;
        NEW.last_updated := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach Trigger to rag_metadata
DROP TRIGGER IF EXISTS tr_archive_rag_version ON rag_metadata;

CREATE TRIGGER tr_archive_rag_version
BEFORE UPDATE ON rag_metadata
FOR EACH ROW
EXECUTE FUNCTION archive_rag_version();

-- 4. Initialize rag_version column if null
UPDATE rag_metadata SET rag_version = 1 WHERE rag_version IS NULL;
