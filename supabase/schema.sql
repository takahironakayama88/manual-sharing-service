-- ===== Organizations (組織) =====
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Users (ユーザー) =====
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- Supabase Auth ID（オンボーディング後に設定）
  user_id TEXT NOT NULL UNIQUE, -- 例: staff_001234
  email TEXT, -- メールアドレス（オンボーディング後に設定）
  role TEXT NOT NULL CHECK (role IN ('admin', 'area_manager', 'staff')),
  display_name TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ja', 'vi', 'my', 'id', 'fil', 'km', 'th')),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invite_token TEXT UNIQUE, -- 招待トークン（オンボーディング前）
  invite_expires_at TIMESTAMP WITH TIME ZONE, -- 招待トークン有効期限
  is_onboarded BOOLEAN DEFAULT FALSE, -- オンボーディング完了フラグ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Onboarding Tokens (オンボーディングトークン) =====
CREATE TABLE onboarding_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE
);

-- ===== Manuals (マニュアル) =====
CREATE TABLE manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  blocks JSONB NOT NULL DEFAULT '[]', -- ManualBlock[]
  category TEXT NOT NULL CHECK (category IN ('onboarding', 'operations', 'safety', 'customer_service')),
  status TEXT NOT NULL CHECK (status IN ('published', 'draft')),
  language TEXT NOT NULL CHECK (language IN ('ja', 'vi', 'my', 'id', 'fil', 'km', 'th')),
  parent_manual_id UUID REFERENCES manuals(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Manual Views (マニュアル閲覧履歴) =====
CREATE TABLE manual_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_duration_seconds INTEGER NOT NULL
);

-- ===== Tests (テスト) =====
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  questions JSONB NOT NULL, -- TestQuestion[]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Test Results (テスト結果) =====
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  answers JSONB NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Badges (バッジ) =====
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition TEXT NOT NULL
);

-- ===== User Badges (ユーザーバッジ) =====
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ===== Indexes (インデックス) =====
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_invite_token ON users(invite_token);
CREATE INDEX idx_manuals_organization_id ON manuals(organization_id);
CREATE INDEX idx_manuals_created_by ON manuals(created_by);
CREATE INDEX idx_manual_views_manual_id ON manual_views(manual_id);
CREATE INDEX idx_manual_views_user_id ON manual_views(user_id);
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- ===== Row Level Security (RLS) =====
-- 組織データ分離のためのセキュリティポリシー

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Organizations: 自分の組織のみ閲覧可能
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Users: 同じ組織のユーザーのみ閲覧可能
CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Users: 管理者のみユーザー作成可能
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'area_manager')
      AND organization_id = users.organization_id
    )
  );

-- Users: 管理者のみユーザー更新可能（または自分自身）
CREATE POLICY "Admins can update users or users can update themselves"
  ON users FOR UPDATE
  USING (
    auth_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'area_manager')
      AND organization_id = users.organization_id
    )
  );

-- Manuals: 同じ組織のマニュアルのみ閲覧可能
CREATE POLICY "Users can view manuals in their organization"
  ON manuals FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Manuals: 管理者とエリアマネージャーのみマニュアル作成可能
CREATE POLICY "Admins and area managers can insert manuals"
  ON manuals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'area_manager')
      AND organization_id = manuals.organization_id
    )
  );

-- Manuals: 管理者とエリアマネージャーのみマニュアル更新可能
CREATE POLICY "Admins and area managers can update manuals"
  ON manuals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'area_manager')
      AND organization_id = manuals.organization_id
    )
  );

-- Manual Views: 自分の閲覧履歴のみ作成可能
CREATE POLICY "Users can insert their own manual views"
  ON manual_views FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Manual Views: 同じ組織の閲覧履歴のみ閲覧可能
CREATE POLICY "Users can view manual views in their organization"
  ON manual_views FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- Test Results: 自分のテスト結果のみ作成可能
CREATE POLICY "Users can insert their own test results"
  ON test_results FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Test Results: 同じ組織のテスト結果のみ閲覧可能
CREATE POLICY "Users can view test results in their organization"
  ON test_results FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- Badges: 全ユーザー閲覧可能
CREATE POLICY "All users can view badges"
  ON badges FOR SELECT
  USING (true);

-- User Badges: 自分のバッジのみ作成可能
CREATE POLICY "Users can insert their own badges"
  ON user_badges FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- User Badges: 同じ組織のユーザーバッジのみ閲覧可能
CREATE POLICY "Users can view user badges in their organization"
  ON user_badges FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- ===== Functions (関数) =====

-- updated_atを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- usersテーブルのupdated_at自動更新トリガー
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- manualsテーブルのupdated_at自動更新トリガー
CREATE TRIGGER update_manuals_updated_at
  BEFORE UPDATE ON manuals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- view_count自動更新関数
CREATE OR REPLACE FUNCTION increment_manual_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE manuals
  SET view_count = view_count + 1
  WHERE id = NEW.manual_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- manual_views挿入時にview_countを自動更新
CREATE TRIGGER increment_view_count_trigger
  AFTER INSERT ON manual_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_manual_view_count();
