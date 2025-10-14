"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StaffLayout from "@/components/layouts/StaffLayout";
import ManualBlockViewer from "@/components/organisms/ManualBlockViewer";
import { Button, BackButton } from "@/components/atoms";
import { mockManuals, getCurrentUser, mockBadges } from "@/lib/mock-data";
import { Manual } from "@/types/database";

interface ManualDetailPageProps {
  params: Promise<{
    locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
    id: string;
  }>;
}

export default function ManualDetailPage({ params }: ManualDetailPageProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<"ja" | "vi" | "my" | "id" | "fil" | "km" | "th">("ja");
  const [manual, setManual] = useState<Manual | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

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
        router.push(`/${p.locale}/staff`);
        return;
      }

      setManual(foundManual);
      setLoading(false);
    });
  }, [params, router]);

  if (loading || !manual) {
    return (
      <StaffLayout
        currentLocale={locale}
        userName={currentUser.display_name}
        userBadges={[mockBadges[0], mockBadges[1]]}
      >
        <div className="text-center py-12">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </StaffLayout>
    );
  }

  // ユーザーのバッジ（モック）
  const userBadges = [mockBadges[0], mockBadges[1]];

  return (
    <StaffLayout
      currentLocale={locale}
      userName={currentUser.display_name}
      userBadges={userBadges}
    >
      <div>
        {/* マニュアルタイトル */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{manual.title}</h1>
          <p className="text-sm text-gray-500">
            {new Date(manual.updated_at).toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* マニュアルコンテンツ */}
        <ManualBlockViewer blocks={manual.blocks} />

        {/* 理解度テストボタン */}
        <div className="mt-6">
          <Button variant="primary" size="lg" fullWidth>
            理解度テストを生成 📝
          </Button>
        </div>

        {/* 戻るボタン */}
        <div className="mt-4">
          <BackButton label="← 戻る" locale={locale} />
        </div>
      </div>
    </StaffLayout>
  );
}
