"use client";

import Link from "next/link";
import { User } from "@/types/database";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { useState } from "react";

interface StaffCardProps {
  user: User;
  locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  onShowQRCode: (user: User) => void;
  onDelete?: () => void;
}

export default function StaffCard({ user, locale, onShowQRCode, onDelete }: StaffCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(user.is_admin ?? false);

  const handleToggleAdmin = async () => {
    const newAdminStatus = !isAdmin;
    setIsAdmin(newAdminStatus);

    try {
      const response = await fetch(`/api/staff/update-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          isAdmin: newAdminStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "管理者権限の更新に失敗しました");
      }

      // 管理者権限を解除した場合、ページをリロード
      // (middlewareが/ja/staffにリダイレクトする可能性があるため)
      if (!newAdminStatus) {
        window.location.reload();
      } else {
        // 親コンポーネントに通知してリロード
        if (onDelete) {
          onDelete();
        }
      }
    } catch (error) {
      console.error("Update admin error:", error);
      // エラー時は元に戻す
      setIsAdmin(!newAdminStatus);
      alert(error instanceof Error ? error.message : "管理者権限の更新に失敗しました");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/staff/delete?id=${user.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "スタッフの削除に失敗しました");
      }

      alert("スタッフを削除しました");
      setShowDeleteConfirm(false);

      // 親コンポーネントに通知してリロード
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error instanceof Error ? error.message : "削除中にエラーが発生しました");
      setShowDeleteConfirm(false);
    }
  };

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      ja: "日本語",
      vi: "ベトナム語",
      my: "ミャンマー語",
      id: "インドネシア語",
      fil: "フィリピン語",
      km: "カンボジア語",
      th: "タイ語",
    };
    return labels[lang] || lang;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "管理者",
      area_manager: "エリアマネージャー",
      staff: "スタッフ",
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string): "blue" | "purple" | "green" => {
    const colors: Record<string, "blue" | "purple" | "green"> = {
      admin: "purple",
      area_manager: "blue",
      staff: "green",
    };
    return colors[role] || "green";
  };

  return (
    <Card padding="none" className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* カードヘッダー */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user.display_name}</h3>
            <p className="text-sm text-gray-500 mt-1">ID: {user.user_id}</p>
          </div>
          <Badge variant={getRoleBadgeColor(user.role)} label={getRoleLabel(user.role)} />
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600">{getLanguageLabel(user.language)}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-600">
              {new Date(user.created_at).toLocaleDateString("ja-JP")}
            </span>
          </div>

          {/* 管理者権限トグル */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">管理者権限</span>
            <button
              onClick={handleToggleAdmin}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isAdmin ? "bg-purple-600" : "bg-gray-300"
              }`}
              aria-label="管理者権限を切り替え"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAdmin ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="p-4 bg-white">
        {!showDeleteConfirm ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => onShowQRCode(user)}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                QRコード
              </button>
              <Link
                href={`/${locale}/admin/staff/${user.id}`}
                className="flex-1 px-3 py-2 text-sm font-medium text-center text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                詳細
              </Link>
              <Link
                href={`/${locale}/admin/staff/edit/${user.id}`}
                className="flex-1 px-3 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                編集
              </Link>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              削除
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-600 text-center">本当に削除しますか？</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" fullWidth onClick={() => setShowDeleteConfirm(false)}>
                キャンセル
              </Button>
              <Button variant="danger" size="sm" fullWidth onClick={handleDelete}>
                削除する
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
