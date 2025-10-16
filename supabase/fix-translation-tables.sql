-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can read translations for their organization's manuals" ON manual_translations;
DROP POLICY IF EXISTS "Admins can create translations for their organization's manuals" ON manual_translations;
DROP POLICY IF EXISTS "Admins can update translations for their organization's manuals" ON manual_translations;
DROP POLICY IF EXISTS "Admins can delete translations for their organization's manuals" ON manual_translations;

-- Translation cache table (only create if not exists)
CREATE TABLE IF NOT EXISTS manual_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  target_language VARCHAR(10) NOT NULL,
  translated_title TEXT NOT NULL,
  translated_blocks JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one translation per manual per language
  UNIQUE(manual_id, target_language)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_manual_translations_manual_id
  ON manual_translations(manual_id);

CREATE INDEX IF NOT EXISTS idx_manual_translations_language
  ON manual_translations(target_language);

-- Enable RLS
ALTER TABLE manual_translations ENABLE ROW LEVEL SECURITY;

-- Staff can read translations for their organization's manuals
CREATE POLICY "Staff can read translations for their organization's manuals"
  ON manual_translations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM manuals m
      INNER JOIN users u ON m.organization_id = u.organization_id
      WHERE m.id = manual_translations.manual_id
        AND u.id = auth.uid()
    )
  );

-- Admins can create translations for their organization's manuals
CREATE POLICY "Admins can create translations for their organization's manuals"
  ON manual_translations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM manuals m
      INNER JOIN users u ON m.organization_id = u.organization_id
      WHERE m.id = manual_translations.manual_id
        AND u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Admins can update translations for their organization's manuals
CREATE POLICY "Admins can update translations for their organization's manuals"
  ON manual_translations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM manuals m
      INNER JOIN users u ON m.organization_id = u.organization_id
      WHERE m.id = manual_translations.manual_id
        AND u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Admins can delete translations for their organization's manuals
CREATE POLICY "Admins can delete translations for their organization's manuals"
  ON manual_translations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM manuals m
      INNER JOIN users u ON m.organization_id = u.organization_id
      WHERE m.id = manual_translations.manual_id
        AND u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_manual_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_manual_translations_updated_at ON manual_translations;

CREATE TRIGGER update_manual_translations_updated_at
  BEFORE UPDATE ON manual_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_manual_translations_updated_at();
