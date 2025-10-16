"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StaffLayout from "@/components/layouts/StaffLayout";
import ManualCard from "@/components/molecules/ManualCard";
import { getCurrentUser, mockBadges } from "@/lib/mock-data";
import { Manual } from "@/types";

interface StaffHomePageProps {
  params: Promise<{ locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th" }>;
}

export default function StaffHomePage({ params }: StaffHomePageProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<"ja" | "vi" | "my" | "id" | "fil" | "km" | "th">("ja");
  const [allManuals, setAllManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = getCurrentUser();
  const userBadges = [mockBadges[0], mockBadges[1]];

  useEffect(() => {
    params.then(async (p) => {
      setLocale(p.locale);

      try {
        // Supabase APIから公開済み&表示可能なマニュアルのみ取得
        const response = await fetch("/api/manuals/list?visibleOnly=true");

        if (!response.ok) {
          throw new Error("マニュアルの取得に失敗しました");
        }

        const data = await response.json();
        setAllManuals(data.manuals || []);
      } catch (err) {
        console.error("Error loading manuals:", err);
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
      } finally {
        setLoading(false);
      }
    });
  }, [params]);

  // 新しいマニュアルの判定（3日以内）
  const isNewManual = (updatedAt: string) => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return new Date(updatedAt) > threeDaysAgo;
  };

  return (
    <StaffLayout
      currentLocale={locale}
      userName={currentUser.display_name}
      userBadges={userBadges}
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">マニュアル一覧</h2>

        {/* ローディング表示 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>読み込み中...</span>
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* マニュアル一覧 */}
        {!loading && !error && (
          <div className="space-y-3">
            {allManuals.map((manual) => (
              <ManualCard
                key={manual.id}
                id={manual.id}
                title={manual.title}
                updatedAt={manual.updated_at}
                isNew={isNewManual(manual.updated_at)}
                locale={locale}
              />
            ))}
          </div>
        )}

        {/* 空状態の表示 */}
        {!loading && !error && allManuals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">まだマニュアルがありません</p>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
