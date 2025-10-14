import { getTranslations } from "next-intl/server";
import Link from "next/link";
import AdminLayout from "@/components/layouts/AdminLayout";
import StaffActionCard from "@/components/molecules/StaffActionCard";
import DashboardStaffCard from "@/components/molecules/DashboardStaffCard";
import { Card, Button } from "@/components/atoms";
import { getCurrentAdmin, mockStaffActions, mockManuals, mockUsers } from "@/lib/mock-data";

interface AdminDashboardPageProps {
  params: Promise<{ locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th" }>;
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");
  const currentUser = getCurrentAdmin();

  // スタッフのみをフィルタリング
  const allStaff = mockUsers.filter((user) => user.role === "staff");

  // 最新4名のスタッフを取得（登録日の降順）
  const recentStaff = [...allStaff]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  // 統計データ
  const stats = {
    totalStaff: allStaff.length,
    totalManuals: mockManuals.length,
    actionRequired: mockStaffActions.length,
  };

  return (
    <AdminLayout currentLocale={locale} userName={currentUser.display_name} currentPage="dashboard">
      <div>
        {/* ページタイトル */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("title")}</h1>
          <p className="text-gray-600">
            対応が必要なスタッフを確認して、フォローアップしましょう。
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card padding="lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <span className="text-3xl">👥</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">スタッフ数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}人</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <span className="text-3xl">📚</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">マニュアル数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalManuals}件</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <span className="text-3xl">⚡</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">要対応</p>
                <p className="text-2xl font-bold text-orange-600">{stats.actionRequired}件</p>
              </div>
            </div>
          </Card>
        </div>

        {/* スタッフ一覧セクション */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">👥 スタッフ一覧</h2>
            <Link href={`/${locale}/admin/staff`}>
              <Button variant="secondary" size="sm">
                すべて見る →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentStaff.map((staff) => (
              <DashboardStaffCard key={staff.id} user={staff} locale={locale} />
            ))}
          </div>

          {allStaff.length === 0 && (
            <Card padding="lg">
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">👥</span>
                <p className="text-gray-600">まだスタッフが登録されていません</p>
              </div>
            </Card>
          )}
        </div>

        {/* アクション一覧 */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ 対応が必要なスタッフ</h2>
        </div>

        <div className="space-y-3">
          {mockStaffActions.map((action, index) => (
            <StaffActionCard
              key={index}
              staffId={action.staffId}
              staffName={action.staffName}
              actionType={action.actionType}
              manualTitle={action.manualTitle}
              score={action.score}
              viewDuration={action.viewDuration}
              daysAgo={action.daysAgo}
              locale={locale}
            />
          ))}
        </div>

        {/* 空状態 */}
        {mockStaffActions.length === 0 && (
          <Card padding="lg">
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">✨</span>
              <p className="text-gray-600 text-lg">
                素晴らしい！全てのスタッフが順調に学習しています。
              </p>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
