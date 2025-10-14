"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

/**
 * オンボーディングページコンテンツ
 * スタッフの初回登録画面
 */
function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // フォーム状態
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // エラー状態
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // スタッフ情報（モック）
  const [staffInfo, setStaffInfo] = useState<{
    name: string;
    organization: string;
    language: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // トークン検証（モックモード - localStorageから取得）
  useEffect(() => {
    if (!token) {
      alert("無効な招待リンクです");
      router.push("/");
      return;
    }

    const fetchStaffInfo = async () => {
      try {
        // モック: localStorageからスタッフ情報を取得
        const staffList = JSON.parse(localStorage.getItem("staff") || "[]");
        const staff = staffList.find((s: any) => s.id === token);

        if (staff) {
          setStaffInfo({
            name: staff.display_name,
            organization: "テスト株式会社", // モック
            language: staff.language,
          });
        } else {
          // スタッフが見つからない場合はデフォルト値
          setStaffInfo({
            name: "テストスタッフ",
            organization: "テスト株式会社",
            language: "ja",
          });
        }
      } catch (error) {
        console.error("Token verification error:", error);
        setStaffInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffInfo();
  }, [token, router]);

  // バリデーション
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

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

  // 登録処理（モックモード）
  const handleOnboard = async () => {
    if (!validate()) return;

    setSubmitting(true);

    // モック: localStorageのスタッフ情報を更新
    try {
      const staffList = JSON.parse(localStorage.getItem("staff") || "[]");
      const staffIndex = staffList.findIndex((s: any) => s.id === token);

      if (staffIndex !== -1) {
        // スタッフ情報を更新
        staffList[staffIndex] = {
          ...staffList[staffIndex],
          email: email,
          is_onboarded: true,
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem("staff", JSON.stringify(staffList));
      }

      setTimeout(() => {
        alert(
          `登録完了！\n\nスタッフ: ${staffInfo?.name}\nメール: ${email}\n\nログイン画面からログインしてください。`
        );
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("登録中にエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card padding="lg">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!staffInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card padding="lg">
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              無効な招待リンク
            </h2>
            <p className="text-gray-600 mb-6">
              このリンクは無効または期限切れです
            </p>
            <Button variant="primary" onClick={() => router.push("/")}>
              ログイン画面へ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-green-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-5xl">👋</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ようこそ、{staffInfo.name}さん！
          </h1>
          <p className="text-gray-600">{staffInfo.organization}へようこそ</p>
        </div>

        {/* 登録カード */}
        <Card padding="lg">
          <div className="space-y-6">
            {/* 説明 */}
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>✨ 初回登録</strong>
                <br />
                メールアドレスとパスワードを設定して、マニュアル閲覧を開始しましょう！
              </p>
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
                placeholder="例: tanaka@example.com"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
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
                    : "border-gray-300 focus:ring-green-500"
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
                    : "border-gray-300 focus:ring-green-500"
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* 登録完了ボタン */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleOnboard}
              disabled={submitting}
            >
              {submitting ? "登録中..." : "登録完了"}
            </Button>

          </div>
        </Card>

        {/* セキュリティ情報 */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>🔒 すべての情報は安全に暗号化されます</p>
        </div>
      </div>
    </div>
  );
}

/**
 * オンボーディングページ
 * Suspenseでラップして useSearchParams を使用
 */
export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
