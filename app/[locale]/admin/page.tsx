import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/atoms";
import { getCurrentUser } from "@/lib/auth";
import { mockManuals } from "@/lib/mock-data";

interface AdminDashboardPageProps {
  params: Promise<{ locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th" }>;
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");

  // 現在のユーザーを取得
  const currentUser = await getCurrentUser();

  // 未ログインの場合はログインページにリダイレクト
  if (!currentUser) {
    redirect("/");
  }

  // 統計データ（将来的にSupabaseから取得）
  const stats = {
    totalStaff: 0,
    totalManuals: mockManuals.length,
    actionRequired: 0,
  };

  return (
    <AdminLayout currentLocale={locale} userName={currentUser.displayName} currentPage="dashboard">
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

        {/* クイックアクションセクション */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🚀 クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href={`/${locale}/admin/staff`}>
              <Card padding="lg" className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <span className="text-4xl">👥</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">スタッフ管理</h3>
                    <p className="text-sm text-gray-600">スタッフの追加・編集・削除</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href={`/${locale}/admin/manuals`}>
              <Card padding="lg" className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <span className="text-4xl">📚</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">マニュアル管理</h3>
                    <p className="text-sm text-gray-600">マニュアルの追加・編集・削除</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* 今後の実装予定 */}
        <Card padding="lg">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🚧</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">学習状況・分析機能</h3>
            <p className="text-gray-600">
              スタッフの学習進捗や分析データは今後実装予定です
            </p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
