"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

/**
 * サインアップページ - 組織登録
 * 新規組織と管理者アカウントを作成
 */
export default function SignupPage() {
  const router = useRouter();

  // フォーム状態
  const [organizationName, setOrganizationName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // エラー状態
  const [errors, setErrors] = useState<{
    organizationName?: string;
    adminName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  // バリデーション
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!organizationName.trim()) {
      newErrors.organizationName = "組織名を入力してください";
    }

    if (!adminName.trim()) {
      newErrors.adminName = "管理者名を入力してください";
    }

    if (!email.trim()) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (!password) {
      newErrors.password = "パスワードを入力してください";
    } else if (password.length < 8) {
      newErrors.password = "パスワードは8文字以上で入力してください";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "パスワードが一致しません";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // サインアップ処理
  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName,
          adminName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "サインアップに失敗しました");
      }

      alert(
        `組織「${organizationName}」を作成しました！\n\nログインページからログインできます。`
      );
      router.push("/");
    } catch (error) {
      console.error("Signup error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "サインアップ中にエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="inline-block p-4 bg-purple-600 rounded-2xl mb-4 shadow-lg hover:bg-purple-700 transition-colors">
              <span className="text-5xl">📚</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            無料でアカウントを作成
          </h1>
          <p className="text-gray-600">
            あなたの組織専用のマニュアル共有サービスを始めましょう
          </p>
        </div>

        {/* サインアップカード */}
        <Card padding="lg">
          <div className="space-y-6">
            {/* ステップ表示 */}
            <div className="flex items-center justify-center gap-2 pb-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  組織情報
                </span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  管理者情報
                </span>
              </div>
            </div>

            {/* 組織情報セクション */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📋 組織情報
                </h3>
              </div>

              {/* 組織名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  組織名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => {
                    setOrganizationName(e.target.value);
                    if (errors.organizationName)
                      setErrors({ ...errors, organizationName: undefined });
                  }}
                  placeholder="例: 山田商店"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.organizationName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-purple-500"
                  }`}
                />
                {errors.organizationName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.organizationName}
                  </p>
                )}
              </div>
            </div>

            <hr className="my-6" />

            {/* 管理者情報セクション */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  👨‍💼 管理者情報
                </h3>
              </div>

              {/* 管理者名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  管理者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => {
                    setAdminName(e.target.value);
                    if (errors.adminName)
                      setErrors({ ...errors, adminName: undefined });
                  }}
                  placeholder="例: 山田 太郎"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.adminName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-purple-500"
                  }`}
                />
                {errors.adminName && (
                  <p className="text-red-500 text-sm mt-1">{errors.adminName}</p>
                )}
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="例: yamada@example.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-purple-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* パスワード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="8文字以上"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-purple-500"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* パスワード確認 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード（確認） <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  placeholder="もう一度入力してください"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-purple-500"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* サインアップボタン */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "作成中..." : "無料で始める"}
            </Button>

            {/* 利用規約 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                アカウント作成により、利用規約とプライバシーポリシーに同意したものとみなされます。
              </p>
            </div>

            {/* ログインリンク */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                すでにアカウントをお持ちですか？{" "}
                <Link
                  href="/"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  ログイン
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
