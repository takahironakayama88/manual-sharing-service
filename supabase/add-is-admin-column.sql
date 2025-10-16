-- Add is_admin column to users table
-- This column tracks whether a user has admin privileges

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Update existing admins and area_managers to have is_admin = true
UPDATE users
SET is_admin = TRUE
WHERE role IN ('admin', 'area_manager');

COMMENT ON COLUMN users.is_admin IS '管理者権限フラグ - trueの場合、管理者機能にアクセス可能';
