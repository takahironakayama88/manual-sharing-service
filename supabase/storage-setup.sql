-- ストレージバケットの作成
-- Supabase Dashboard > Storage > Create Bucket で以下の設定を行ってください：
-- Bucket Name: manual-media
-- Public: ON (公開バケット)
-- File size limit: 104857600 (100MB)
-- Allowed MIME types: image/*, video/*

-- または、SQL Editorで以下を実行：

-- manual-mediaバケットを作成（公開バケット）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manual-media',
  'manual-media',
  true,
  104857600,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 104857600;

-- ストレージポリシー: 認証済みユーザーは誰でもアップロード可能
CREATE POLICY "Authenticated users can upload media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'manual-media');

-- ストレージポリシー: 誰でも閲覧可能（公開バケット）
CREATE POLICY "Anyone can view media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'manual-media');

-- ストレージポリシー: アップロードしたユーザーは削除可能
CREATE POLICY "Users can delete their own media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'manual-media' AND auth.uid() = owner);
