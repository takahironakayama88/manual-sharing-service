"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

/**
 * ルートページ - ログイン画面
 * メールアドレス + パスワード認証
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // バリデーション
  const validate = (): boolean => {
    if (!email.trim()) {
      setError("メールアドレスを入力してください");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("有効なメールアドレスを入力してください");
      return false;
    }

    if (!password) {
      setError("パスワードを入力してください");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ログインに失敗しました");
      }

      // ユーザーの管理者権限に応じてリダイレクト
      if (data.user.isAdmin) {
        router.push("/ja/admin");
      } else {
        router.push("/ja/staff");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "ログイン中にエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-5xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smuuuz
          </h1>
          <p className="text-gray-600">AI搭載マニュアル共有サービス</p>
        </div>

        {/* ログインカード */}
        <Card padding="lg">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">ログイン</h2>
              <p className="text-sm text-gray-600">
                メールアドレスとパスワードを入力してください
              </p>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* メールアドレス入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyPress}
                placeholder="例: tanaka@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* パスワード入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyPress}
                placeholder="パスワードを入力"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* パスワードを忘れた場合 */}
            <div className="text-right">
              <Link
                href="/reset-password"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                パスワードをお忘れですか？
              </Link>
            </div>

            {/* ログインボタン */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>


            {/* サインアップリンク */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                アカウントをお持ちでないですか？{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  無料で始める
                </Link>
              </p>
            </div>
          </div>
        </Card>

        {/* フッター */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>多言語対応: 🇯🇵 🇻🇳 🇲🇲 🇮🇩 🇵🇭 🇰🇭 🇹🇭</p>
        </div>
      </div>
    </div>
  );
}
