-- =============================================
-- MIGRATION: Add Admin Role Support
-- Date: 2025-01-21
-- Description: Adds is_admin column to users table for admin access control
-- =============================================

-- Add is_admin column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- Optional: Set first user as admin (replace with your admin user ID)
-- UPDATE users SET is_admin = true WHERE email = 'your-admin-email@example.com';

COMMENT ON COLUMN users.is_admin IS 'Indicates if user has admin privileges for backoffice access';

-- Log migration
DO $$
BEGIN
    RAISE NOTICE 'Migration 05_add_admin_role completed successfully';
    RAISE NOTICE 'To make a user admin, run: UPDATE users SET is_admin = true WHERE email = ''admin@example.com'';';
END $$;
