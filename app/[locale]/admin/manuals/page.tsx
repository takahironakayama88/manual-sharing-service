"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import Button from "@/components/atoms/Button";
import Link from "next/link";
import ManualList from "@/components/organisms/ManualList";
import { Manual } from "@/types/database";

interface PageProps {
  params: Promise<{
    locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  }>;
}

export default function ManualManagementPage({ params }: PageProps) {
  const [locale, setLocale] = useState<"ja" | "vi" | "my" | "id" | "fil" | "km" | "th">("ja");
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadManuals = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/manuals/list");

      if (!response.ok) {
        throw new Error("マニュアルの取得に失敗しました");
      }

      const data = await response.json();
      setManuals(data.manuals || []);
    } catch (err) {
      console.error("Error loading manuals:", err);
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // paramsを解決してlocaleを取得
    params.then((p) => setLocale(p.locale));

    loadManuals();
  }, [params]);

  const handleDelete = () => {
    // 削除後、マニュアルリストを再読み込み
    loadManuals();
  };

  return (
    <AdminLayout currentLocale={locale} userName="管理者">
      <div className="space-y-6">
        {/* ヘッダーセクション */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">マニュアル管理</h2>
            <p className="text-sm text-gray-600 mt-1">マニュアルの作成・編集・削除を行います</p>
          </div>
          <Link href={`/${locale}/admin/manuals/new`}>
            <Button variant="primary" size="lg">
              + 新規作成
            </Button>
          </Link>
        </div>

        {/* ローディング表示 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>読み込み中...</span>
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadManuals}
              className="mt-2 text-sm text-red-700 underline hover:no-underline"
            >
              再読み込み
            </button>
          </div>
        )}

        {/* マニュアル一覧（フィルター・検索・統計を含む） */}
        {!isLoading && !error && (
          <ManualList manuals={manuals} locale={locale} onDelete={handleDelete} />
        )}
      </div>
    </AdminLayout>
  );
}
