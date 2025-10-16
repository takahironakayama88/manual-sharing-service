-- ===================================
-- Supabase スキーママイグレーション
-- users.id を auth.users への外部キーから独立したUUIDに変更
-- ===================================

-- Step 1: 既存テーブルとポリシーを削除
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS manual_views CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS manuals CASCADE;
DROP TABLE IF EXISTS onboarding_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- 既存のポリシーも削除（念のため）
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users or users can update themselves" ON users;
DROP POLICY IF EXISTS "Users can view manuals in their organization" ON manuals;
DROP POLICY IF EXISTS "Admins and area managers can insert manuals" ON manuals;
DROP POLICY IF EXISTS "Admins and area managers can update manuals" ON manuals;
DROP POLICY IF EXISTS "Users can insert their own manual views" ON manual_views;
DROP POLICY IF EXISTS "Users can view manual views in their organization" ON manual_views;
DROP POLICY IF EXISTS "Users can insert their own test results" ON test_results;
DROP POLICY IF EXISTS "Users can view test results in their organization" ON test_results;
DROP POLICY IF EXISTS "All users can view badges" ON badges;
DROP POLICY IF EXISTS "Users can insert their own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can view user badges in their organization" ON user_badges;

-- Step 2: スキーマを再作成（schema.sqlの内容をここにコピー）
-- 以下、schema.sqlの全内容を貼り付けてください
