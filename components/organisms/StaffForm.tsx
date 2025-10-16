"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/database";
import Button from "@/components/atoms/Button";

interface StaffFormProps {
  locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  initialStaff?: User;
}

export default function StaffForm({ locale, initialStaff }: StaffFormProps) {
  const router = useRouter();

  // フォーム状態
  const [userId, setUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState<"ja" | "vi" | "my" | "id" | "fil" | "km" | "th">(locale);
  const [role, setRole] = useState<"staff" | "admin">("staff");

  // エラー状態
  const [errors, setErrors] = useState<{
    userId?: string;
    displayName?: string;
    email?: string;
  }>({});

  // 初期データの読み込み（編集モードの場合）
  useEffect(() => {
    if (initialStaff) {
      setUserId(initialStaff.user_id);
      setDisplayName(initialStaff.display_name);
      setEmail(initialStaff.email || "");
      setLanguage(initialStaff.language as typeof language);
      setRole(initialStaff.role as typeof role);
    }
  }, [initialStaff]);

  // バリデーション
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // 新規作成時はユーザーIDとメールは不要（自動生成・オンボーディング時設定）
    if (initialStaff) {
      if (!userId.trim()) {
        newErrors.userId = "ユーザーIDは必須です";
      }

      if (!email.trim()) {
        newErrors.email = "メールアドレスは必須です";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "有効なメールアドレスを入力してください";
      }
    }

    if (!displayName.trim()) {
      newErrors.displayName = "表示名は必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存処理
  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      if (initialStaff) {
        // 編集モード: Supabase APIで更新
        const response = await fetch("/api/staff/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: initialStaff.id,
            displayName,
            email,
            language,
            role,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "スタッフ情報の更新に失敗しました");
        }

        alert("スタッフ情報を更新しました");
        router.push(`/${locale}/admin/staff`);
      } else {
        // 新規作成モード: Supabase APIを呼び出し
        const response = await fetch("/api/staff/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName,
            language,
            role,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "スタッフの作成に失敗しました");
        }

        alert("スタッフを作成しました！招待リンクを生成できます。");
        router.push(`/${locale}/admin/staff`);
      }
    } catch (error) {
      console.error("Staff save error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "スタッフ情報の保存中にエラーが発生しました"
      );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* 新規作成時の説明 */}
      {!initialStaff && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>📌 スタッフ登録の流れ</strong>
            <br />
            1. 表示名と言語を設定
            <br />
            2. 招待リンク（QRコード）を生成
            <br />
            3. スタッフがQRコードをスキャンしてメール・パスワード設定
          </p>
        </div>
      )}

      {/* ユーザーID入力（編集時のみ表示） */}
      {initialStaff && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ユーザーID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              if (errors.userId) setErrors({ ...errors, userId: undefined });
            }}
            placeholder="例: staff_001"
            disabled={!!initialStaff} // 編集時はユーザーIDを変更不可
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              initialStaff ? "bg-gray-100 cursor-not-allowed" : ""
            } ${
              errors.userId
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.userId && <p className="text-red-500 text-sm mt-1">{errors.userId}</p>}
          {initialStaff && (
            <p className="text-xs text-gray-500 mt-1">
              ※ ユーザーIDは変更できません
            </p>
          )}
        </div>
      )}

      {/* 表示名入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          表示名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            if (errors.displayName) setErrors({ ...errors, displayName: undefined });
          }}
          placeholder="例: 田中 太郎"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.displayName
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.displayName && (
          <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
        )}
      </div>

      {/* メールアドレス入力（編集時のみ表示） */}
      {initialStaff && (
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
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
      )}

      {/* 言語と権限選択 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            言語
          </label>
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as "ja" | "vi" | "my" | "id" | "fil" | "km" | "th")
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ja">日本語</option>
            <option value="vi">ベトナム語</option>
            <option value="my">ミャンマー語</option>
            <option value="id">インドネシア語</option>
            <option value="fil">フィリピン語</option>
            <option value="km">カンボジア語</option>
            <option value="th">タイ語</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            権限
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "staff" | "admin")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="staff">スタッフ</option>
            <option value="admin">管理者</option>
          </select>
        </div>
      </div>

      <hr className="my-6" />

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => router.push(`/${locale}/admin/staff`)}
        >
          キャンセル
        </Button>
        <Button variant="primary" fullWidth onClick={handleSave}>
          {initialStaff ? "更新する" : "登録する"}
        </Button>
      </div>
    </div>
  );
}
