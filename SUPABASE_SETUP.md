# Supabase セットアップガイド

このドキュメントでは、SmuuuzにSupabaseを統合する手順を説明します。

## 📋 前提条件

- Supabaseアカウント（https://supabase.com でサインアップ）
- Node.js 18以上がインストール済み
- 本プロジェクトのソースコード

## 🚀 セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase Dashboard](https://app.supabase.com) にアクセス
2. "New Project" をクリック
3. 以下の情報を入力：
   - **Name**: manual-sharing-app（任意）
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: Northeast Asia (Tokyo) を推奨
   - **Pricing Plan**: Free プランで開始可能
4. "Create new project" をクリック（数分かかります）

### 2. 環境変数の設定

プロジェクト作成後、以下の手順で環境変数を取得：

1. Supabase Dashboardで作成したプロジェクトを開く
2. 左サイドバーから "Settings" → "API" を選択
3. 以下の値をコピー：
   - **Project URL** (`https://xxxxx.supabase.co` の形式)
   - **anon public** キー（`eyJhbGc...` で始まる長い文字列）

プロジェクトルートに `.env.local` ファイルを作成：

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**⚠️ 重要**: `.env.local` はGitにコミットしないでください（`.gitignore` で除外済み）

### 3. データベーススキーマの適用

1. Supabase Dashboardで "SQL Editor" を開く
2. "New query" をクリック
3. `supabase/schema.sql` の内容をコピー＆ペースト
4. "Run" をクリックしてスキーマを実行

以下のテーブルが作成されます：
- `organizations` - 組織情報
- `users` - ユーザー情報
- `onboarding_tokens` - オンボーディングトークン
- `manuals` - マニュアル
- `manual_views` - 閲覧履歴
- `tests` - テスト
- `test_results` - テスト結果
- `badges` - バッジ
- `user_badges` - ユーザーバッジ

### 4. 認証設定

1. Supabase Dashboardで "Authentication" → "Providers" を開く
2. "Email" プロバイダーが有効になっていることを確認
3. "Email Templates" で日本語メールテンプレートをカスタマイズ可能

#### メール送信設定（本番環境）

開発環境ではSupabase内蔵SMTPが使用されますが、**1時間あたり4通まで**の制限があります。
本番環境では外部SMTPサービスの設定を推奨します。

**SendGrid設定例**:

1. [SendGrid](https://sendgrid.com) でアカウント作成
2. API Key を取得
3. Supabase Dashboard → "Settings" → "Auth" → "SMTP Settings"
4. 以下を設定：
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: <Your SendGrid API Key>
   Sender email: noreply@yourdomain.com
   Sender name: Smuuuz
   ```

### 5. Storage設定（画像・動画用）

1. Supabase Dashboardで "Storage" を開く
2. "Create a new bucket" をクリック
3. 以下のバケットを作成：
   - **manual-images** - マニュアル用画像
   - **manual-videos** - マニュアル用動画

各バケットのポリシー設定：

```sql
-- manual-images bucket policy (読み取りは全ユーザー、書き込みは管理者のみ)
CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'manual-images');

CREATE POLICY "Admins can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'manual-images'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'area_manager')
    )
  );

-- manual-videos bucket policy
CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'manual-videos');

CREATE POLICY "Admins can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'manual-videos'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'area_manager')
    )
  );
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いて動作確認してください。

## 🧪 テストデータの投入（オプション）

初期テストのため、以下のSQLでテストデータを投入できます：

```sql
-- テスト組織作成
INSERT INTO organizations (name, plan)
VALUES ('テスト株式会社', 'free')
RETURNING id;

-- 上記で取得したidを使用してテストユーザー作成
-- 注意: auth.users テーブルへの直接挿入は推奨されません
-- 実際はサインアップフローを使用してください
```

**推奨**: 実際のサインアップフローを使ってテストアカウントを作成してください。

## 📝 主要ファイル説明

### クライアント設定

- `lib/supabase/client.ts` - ブラウザ用クライアント（Client Components）
- `lib/supabase/server.ts` - サーバー用クライアント（Server Components/Actions）
- `lib/supabase/middleware.ts` - ミドルウェア用（セッション管理）

### 使用例

**Client Component**:
```typescript
"use client";
import { createClient } from "@/lib/supabase/client";

export default function MyComponent() {
  const supabase = createClient();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "user@example.com",
      password: "password123",
    });
  };
}
```

**Server Component**:
```typescript
import { createClient } from "@/lib/supabase/server";

export default async function MyServerComponent() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not logged in</div>;
  }

  return <div>Welcome {user.email}</div>;
}
```

## 🔒 セキュリティ注意事項

### Row Level Security (RLS)

本プロジェクトでは、マルチテナント対応のため **Row Level Security** を有効化しています。

- 各組織のデータは完全に分離されています
- ユーザーは自分の組織のデータのみアクセス可能
- 管理者権限の確認もRLSポリシーで実施

### 環境変数の管理

- `.env.local` は絶対にGitにコミットしない
- 本番環境ではVercelの環境変数設定を使用
- `NEXT_PUBLIC_` プレフィックスの変数はクライアント側に公開されます

## 🚨 トラブルシューティング

### "Invalid API key" エラー

- `.env.local` ファイルが正しく作成されているか確認
- 開発サーバーを再起動（環境変数読み込みのため）
- API keyに余分なスペースや改行がないか確認

### 認証エラー

- Supabase Dashboard → Authentication → Settings で Email プロバイダーが有効か確認
- メール送信制限（開発環境: 4通/時間）に達していないか確認
- ブラウザのCookieが有効になっているか確認

### RLSエラー（"new row violates row-level security policy"）

- ユーザーが正しくログインしているか確認
- `auth.uid()` がユーザーのIDと一致しているか確認
- SQL Editorで直接ポリシーを確認

## 📚 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Next.js + Supabase統合ガイド](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security解説](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

## ✅ 次のステップ

Supabaseセットアップが完了したら：

1. サインアップページでテスト組織を作成
2. 管理者アカウントでログイン
3. スタッフを追加してQRコードでオンボーディング
4. マニュアル作成機能のテスト
5. 画像・動画アップロード機能の実装

---

**作成日**: 2025-10-14
**バージョン**: 1.0.0
