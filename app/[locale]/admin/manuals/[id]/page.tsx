"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layouts/AdminLayout";
import ManualBlockViewer from "@/components/organisms/ManualBlockViewer";
import { Button, BackButton } from "@/components/atoms";
import { mockManuals } from "@/lib/mock-data";
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

  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);

      // localStorageとmockManualsから統合されたマニュアルリストを取得
      const savedManuals = localStorage.getItem("manuals");
      let allManuals = [...mockManuals];

      if (savedManuals) {
        const parsedManuals = JSON.parse(savedManuals);
        allManuals = [...mockManuals, ...parsedManuals];
      }

      // マニュアルを取得
      const foundManual = allManuals.find((m) => m.id === p.id);

      if (!foundManual) {
        router.push(`/${p.locale}/admin/manuals`);
        return;
      }

      setManual(foundManual);
      setLoading(false);
    });
  }, [params, router]);

  if (loading || !manual) {
    return (
      <AdminLayout currentLocale={locale} userName="管理者">
        <div className="text-center py-12">
          <p className="text-gray-500">読み込み中...</p>
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
