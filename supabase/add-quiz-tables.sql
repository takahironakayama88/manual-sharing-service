-- 理解度テスト機能のためのテーブル作成

-- テストセッション（1回のテスト実施）
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- 正解数
  total_questions INTEGER NOT NULL, -- 問題数
  percentage DECIMAL(5,2), -- スコア％
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 生成された問題
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options JSONB NOT NULL, -- 選択肢の配列 ["A", "B", "C", "D"]
  explanation TEXT, -- 解説
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スタッフの回答
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_manual_id ON quiz_sessions(manual_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_session_id ON quiz_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_session_id ON quiz_answers(session_id);

-- RLSポリシーの設定
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- quiz_sessions のRLSポリシー
-- ユーザーは自分のセッションのみ参照可能
CREATE POLICY "Users can view their own quiz sessions"
  ON quiz_sessions FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = quiz_sessions.user_id));

-- ユーザーは自分のセッションのみ作成可能
CREATE POLICY "Users can create their own quiz sessions"
  ON quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = quiz_sessions.user_id));

-- 管理者は同じ組織のセッションを参照可能
CREATE POLICY "Admins can view organization quiz sessions"
  ON quiz_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u1, users u2
      WHERE u1.auth_id = auth.uid()
        AND u2.id = quiz_sessions.user_id
        AND u1.organization_id = u2.organization_id
        AND (u1.role = 'admin' OR u1.role = 'area_manager')
    )
  );

-- quiz_questions のRLSポリシー
-- ユーザーは自分のセッションの問題を参照可能
CREATE POLICY "Users can view their quiz questions"
  ON quiz_questions FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM quiz_sessions WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- ユーザーは自分のセッションの問題を作成可能
CREATE POLICY "Users can create quiz questions for their sessions"
  ON quiz_questions FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM quiz_sessions WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- quiz_answers のRLSポリシー
-- ユーザーは自分の回答を参照可能
CREATE POLICY "Users can view their quiz answers"
  ON quiz_answers FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM quiz_sessions WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- ユーザーは自分のセッションに回答を作成可能
CREATE POLICY "Users can create quiz answers for their sessions"
  ON quiz_answers FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM quiz_sessions WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- コメントの追加
COMMENT ON TABLE quiz_sessions IS '理解度テストのセッション情報';
COMMENT ON TABLE quiz_questions IS 'AIが生成した理解度テストの問題';
COMMENT ON TABLE quiz_answers IS 'スタッフの回答記録';
