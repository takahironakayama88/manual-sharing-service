import { getTranslations } from "next-intl/server";
import StaffLayout from "@/components/layouts/StaffLayout";
import ManualCard from "@/components/molecules/ManualCard";
import { mockManuals, getCurrentUser, mockBadges } from "@/lib/mock-data";

interface StaffHomePageProps {
  params: Promise<{ locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th" }>;
}

export default async function StaffHomePage({ params }: StaffHomePageProps) {
  const { locale } = await params;
  const t = await getTranslations("manual");
  const currentUser = getCurrentUser();

  // 新しいマニュアルの判定（3日以内）
  const isNewManual = (updatedAt: string) => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return new Date(updatedAt) > threeDaysAgo;
  };

  // ユーザーのバッジ（モック）
  const userBadges = [mockBadges[0], mockBadges[1]];

  return (
    <StaffLayout
      currentLocale={locale}
      userName={currentUser.display_name}
      userBadges={userBadges}
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t("title")}</h2>

        {/* マニュアル一覧 */}
        <div className="space-y-3">
          {mockManuals.map((manual) => (
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

        {/* 空状態の表示 */}
        {mockManuals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">まだマニュアルがありません</p>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
