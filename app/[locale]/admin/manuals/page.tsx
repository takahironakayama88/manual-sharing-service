"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import Button from "@/components/atoms/Button";
import { mockManuals } from "@/lib/mock-data";
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

  const loadManuals = () => {
    // localStorageからマニュアルを読み込む
    const savedManuals = localStorage.getItem("manuals");
    if (savedManuals) {
      const parsedManuals = JSON.parse(savedManuals);
      // localStorageのマニュアルとmockManualsを統合
      setManuals([...mockManuals, ...parsedManuals]);
    } else {
      setManuals(mockManuals);
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
            <h2 className="text-2xl font-bold text-gray-900">📚 マニュアル管理</h2>
            <p className="text-sm text-gray-600 mt-1">マニュアルの作成・編集・削除を行います</p>
          </div>
          <Link href={`/${locale}/admin/manuals/new`}>
            <Button variant="primary" size="lg">
              + 新規作成
            </Button>
          </Link>
        </div>

        {/* マニュアル一覧（フィルター・検索・統計を含む） */}
        <ManualList manuals={manuals} locale={locale} onDelete={handleDelete} />
      </div>
    </AdminLayout>
  );
}
