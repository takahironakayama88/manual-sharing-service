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

  const handleDelete = () => {
    // localStorageから削除
    const savedStaff = localStorage.getItem("staff");
    if (savedStaff) {
      const staff = JSON.parse(savedStaff);
      const updatedStaff = staff.filter((s: User) => s.id !== user.id);
      localStorage.setItem("staff", JSON.stringify(updatedStaff));
    }

    setShowDeleteConfirm(false);

    // 親コンポーネントに通知してリロード
    if (onDelete) {
      onDelete();
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

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-600">🌐 {getLanguageLabel(user.language)}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-600">
            📅 {new Date(user.created_at).toLocaleDateString("ja-JP")}
          </span>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="p-4 bg-white">
        {!showDeleteConfirm ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" fullWidth onClick={() => onShowQRCode(user)}>
                📱 QRコード
              </Button>
              <Link href={`/${locale}/admin/staff/${user.id}`} className="flex-1">
                <Button variant="secondary" size="sm" fullWidth>
                  👁️ 詳細
                </Button>
              </Link>
              <Link href={`/${locale}/admin/staff/edit/${user.id}`} className="flex-1">
                <Button variant="primary" size="sm" fullWidth>
                  ✏️ 編集
                </Button>
              </Link>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              🗑️ 削除
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
