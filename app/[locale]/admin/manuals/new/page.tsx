import AdminLayout from "@/components/layouts/AdminLayout";
import BlockEditor from "@/components/organisms/BlockEditor";

interface PageProps {
  params: Promise<{
    locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  }>;
}

export default async function NewManualPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <AdminLayout currentLocale={locale} userName="管理者">
      <div className="space-y-6">
        {/* ヘッダーセクション */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📝 新規マニュアル作成</h2>
            <p className="text-sm text-gray-600 mt-1">ブロックを追加してマニュアルを作成します</p>
          </div>
        </div>

        {/* ブロックエディター */}
        <BlockEditor locale={locale} />
      </div>
    </AdminLayout>
  );
}
