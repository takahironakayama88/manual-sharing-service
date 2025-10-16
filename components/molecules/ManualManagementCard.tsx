"use client";

import { Manual } from "@/types/database";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Link from "next/link";
import { useState } from "react";

interface ManualManagementCardProps {
  manual: Manual;
  locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  onDelete?: () => void;
}

export default function ManualManagementCard({ manual, locale, onDelete }: ManualManagementCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(manual.is_visible ?? true);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleVisibility = async () => {
    try {
      setIsUpdating(true);
      const newVisibility = !isVisible;

      const response = await fetch("/api/manuals/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: manual.id,
          is_visible: newVisibility,
        }),
      });

      if (!response.ok) {
        throw new Error("表示設定の更新に失敗しました");
      }

      setIsVisible(newVisibility);

      // 親コンポーネントに通知してリロード
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Toggle visibility error:", error);
      alert(
        `表示設定の更新に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsUpdating(true);

      const response = await fetch(`/api/manuals/delete?id=${manual.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("マニュアルの削除に失敗しました");
      }

      setShowDeleteConfirm(false);

      // 親コンポーネントに通知してリロード
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        `削除に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      onboarding: "オンボーディング",
      operations: "業務手順",
      safety: "安全管理",
      customer_service: "接客",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string): "blue" | "green" | "yellow" | "red" | "purple" => {
    const colors: Record<string, "blue" | "green" | "yellow" | "red" | "purple"> = {
      onboarding: "blue",
      operations: "green",
      safety: "red",
      customer_service: "purple",
    };
    return colors[category] || "blue";
  };

  return (
    <Card padding="none" className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* カードヘッダー */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{manual.title}</h3>
          <div className="flex items-center gap-2">
            <Badge
              variant={manual.status === "published" ? "green" : "yellow"}
              label={manual.status === "published" ? "公開中" : "下書き"}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getCategoryColor(manual.category)} label={getCategoryLabel(manual.category)} />
            <span className="text-xs text-gray-500">
              {manual.view_count || 0}回閲覧 | {manual.blocks?.length || 0}ブロック
            </span>
          </div>

          {/* 表示/非表示トグル */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">スタッフに表示</span>
            <button
              onClick={handleToggleVisibility}
              disabled={isUpdating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isVisible ? "bg-blue-600" : "bg-gray-300"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label="表示/非表示を切り替え"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isVisible ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* カード本文 */}
      <div className="p-4 bg-gray-50">
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {manual.description || "説明文がありません"}
        </p>

        <div className="text-xs text-gray-500 space-y-1">
          <p>作成: {new Date(manual.created_at).toLocaleDateString("ja-JP")}</p>
          <p>更新: {new Date(manual.updated_at).toLocaleDateString("ja-JP")}</p>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="p-4 bg-white border-t border-gray-100">
        {!showDeleteConfirm ? (
          <div className="flex gap-2">
            <Link href={`/${locale}/admin/manuals/${manual.id}`} className="flex-1">
              <Button variant="secondary" size="sm" fullWidth disabled={isUpdating}>
                プレビュー
              </Button>
            </Link>
            <Link href={`/${locale}/admin/manuals/edit/${manual.id}`} className="flex-1">
              <Button variant="primary" size="sm" fullWidth disabled={isUpdating}>
                編集
              </Button>
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUpdating}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              削除
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-600 text-center">本当に削除しますか？</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" fullWidth onClick={() => setShowDeleteConfirm(false)} disabled={isUpdating}>
                キャンセル
              </Button>
              <Button variant="danger" size="sm" fullWidth onClick={handleDelete} disabled={isUpdating}>
                {isUpdating ? "削除中..." : "削除する"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
