"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layouts/AdminLayout";
import ManualBlockViewer from "@/components/organisms/ManualBlockViewer";
import { Button, BackButton } from "@/components/atoms";
import { Manual } from "@/types/database";

interface ManualDetailPageProps {
  params: Promise<{
    locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
    id: string;
  }>;
}

export default function AdminManualDetailPage({ params }: ManualDetailPageProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<"ja" | "vi" | "my" | "id" | "fil" | "km" | "th">("ja");
  const [manual, setManual] = useState<Manual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(async (p) => {
      setLocale(p.locale);

      try {
        // Supabase APIからマニュアル一覧を取得
        const response = await fetch("/api/manuals/list");

        if (!response.ok) {
          throw new Error("マニュアルの取得に失敗しました");
        }

        const data = await response.json();
        const allManuals = data.manuals || [];

        // マニュアルを取得
        const foundManual = allManuals.find((m: Manual) => m.id === p.id);

        if (!foundManual) {
          setError("マニュアルが見つかりませんでした");
          setTimeout(() => {
            router.push(`/${p.locale}/admin/manuals`);
          }, 2000);
          return;
        }

        setManual(foundManual);
      } catch (err) {
        console.error("Error loading manual:", err);
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
      } finally {
        setLoading(false);
      }
    });
  }, [params, router]);

  if (loading) {
    return (
      <AdminLayout currentLocale={locale} userName="管理者">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>読み込み中...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !manual) {
    return (
      <AdminLayout currentLocale={locale} userName="管理者">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error || "マニュアルが見つかりませんでした"}</p>
            <p className="text-sm text-gray-600 mt-2">自動的に一覧ページに戻ります...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentLocale={locale} userName="管理者">
      <div>
        {/* ステータスバッジ */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              manual.status === "published"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {manual.status === "published" ? "✓ 公開中" : "📝 下書き"}
          </span>
        </div>

        {/* マニュアルタイトル */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{manual.title}</h1>
          <p className="text-sm text-gray-500">
            最終更新: {new Date(manual.updated_at).toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* マニュアルコンテンツ */}
        <ManualBlockViewer blocks={manual.blocks} />

        {/* アクションボタン */}
        <div className="mt-6 space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => router.push(`/${locale}/admin/manuals/edit/${manual.id}`)}
          >
            ✏️ 編集
          </Button>

          {/* 戻るボタン */}
          <BackButton label="← マニュアル一覧に戻る" locale={locale} />
        </div>
      </div>
    </AdminLayout>
  );
}
