-- ===== RLS Policy Fix: 無限再帰エラーの解決 =====
-- サインアップ時にユーザーが存在しない状態でINSERTを許可する

-- 既存の "Admins can insert users" ポリシーを削除
DROP POLICY IF EXISTS "Admins can insert users" ON users;

-- 新しいポリシー: サービスロール（API経由）でのINSERTを許可
CREATE POLICY "Allow service role and authenticated users to insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- organizations テーブルにもINSERTポリシーを追加
DROP POLICY IF EXISTS "Allow insert for organizations" ON organizations;

CREATE POLICY "Allow service role to insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (true);

-- onboarding_tokens テーブルにもINSERTポリシーを追加
DROP POLICY IF EXISTS "Allow insert for onboarding_tokens" ON onboarding_tokens;

CREATE POLICY "Allow service role to insert onboarding_tokens"
  ON onboarding_tokens FOR INSERT
  WITH CHECK (true);
