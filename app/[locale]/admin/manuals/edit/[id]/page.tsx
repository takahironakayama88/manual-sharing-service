"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layouts/AdminLayout";
import BlockEditor from "@/components/organisms/BlockEditor";
import { mockManuals } from "@/lib/mock-data";
import { Manual } from "@/types/database";

interface EditManualPageProps {
  params: Promise<{
    locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
    id: string;
  }>;
}

export default function EditManualPage({ params }: EditManualPageProps) {
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
        // マニュアルが見つからない場合は一覧に戻る
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">✏️ マニュアル編集</h2>
            <p className="text-sm text-gray-600 mt-1">既存のマニュアルを編集します</p>
          </div>
        </div>
        <BlockEditor locale={locale} initialManual={manual} />
      </div>
    </AdminLayout>
  );
}
