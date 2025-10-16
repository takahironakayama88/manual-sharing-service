-- Add is_visible column to manuals table
-- This column controls whether a manual is visible to staff members

ALTER TABLE manuals
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_manuals_is_visible ON manuals(is_visible);

-- Set all existing manuals to visible by default
UPDATE manuals
SET is_visible = TRUE
WHERE is_visible IS NULL;

COMMENT ON COLUMN manuals.is_visible IS 'スタッフ画面での表示/非表示フラグ - falseの場合、スタッフには表示されない';
