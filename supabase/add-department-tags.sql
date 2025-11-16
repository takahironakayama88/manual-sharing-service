-- マニュアルテーブルに部署タグカラムを追加
-- このマイグレーションは既存データに影響を与えません（NULL許容）

-- department_tags カラムを追加（文字列配列として保存）
ALTER TABLE manuals
ADD COLUMN IF NOT EXISTS department_tags TEXT[] DEFAULT '{}';

-- department_tags用のインデックスを追加（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_manuals_department_tags
ON manuals USING GIN (department_tags);

-- コメント追加
COMMENT ON COLUMN manuals.department_tags IS '対象部署タグの配列（例: ["営業部", "製造部"]）。空配列の場合は全部署対象';
