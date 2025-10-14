"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/layouts/AdminLayout";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import { mockUsers } from "@/lib/mock-data";
import { User } from "@/types/database";

interface StaffDetailPageProps {
  params: Promise<{
    locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
    id: string;
  }>;
}

export default function StaffDetailPage({ params }: StaffDetailPageProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<"ja" | "vi" | "my" | "id" | "fil" | "km" | "th">("ja");
  const [staff, setStaff] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);

      // mockUsersからスタッフのみを取得
      const mockStaff = mockUsers.filter((user) => user.role === "staff");

      // localStorageからスタッフを取得
      const savedStaff = localStorage.getItem("staff");
      let allStaff = [...mockStaff];
      if (savedStaff) {
        allStaff = [...mockStaff, ...JSON.parse(savedStaff)];
      }

      const foundStaff = allStaff.find((s) => s.id === p.id);
      if (!foundStaff) {
        router.push(`/${p.locale}/admin/staff`);
        return;
      }

      setStaff(foundStaff);
      setLoading(false);
    });
  }, [params, router]);

  if (loading || !staff) {
    return (
      <AdminLayout currentLocale={locale} userName="管理者">
        <div className="text-center py-12">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </AdminLayout>
    );
  }

  // 言語表示用のラベル
  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      ja: "日本語",
      vi: "ベトナム語",
      my: "ミャンマー語",
      id: "インドネシア語",
      fil: "フィリピン語",
      km: "カンボジア語",
      th: "タイ語",
    };
    return labels[lang] || lang;
  };

  // 権限表示用のラベル
  const getRoleLabel = (role: string) => {
    return role === "admin" ? "管理者" : "スタッフ";
  };

  return (
    <AdminLayout currentLocale={locale} userName="管理者">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/${locale}/admin/staff`)}
            className="text-blue-600 hover:text-blue-700"
          >
            ← 戻る
          </button>
          <h2 className="text-2xl font-bold text-gray-900">👤 スタッフ詳細</h2>
        </div>

        {/* スタッフ情報カード */}
        <Card>
          <div className="space-y-6">
            {/* 基本情報 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ユーザーID</p>
                  <p className="text-base font-medium text-gray-900">{staff.user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">表示名</p>
                  <p className="text-base font-medium text-gray-900">{staff.display_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">メールアドレス</p>
                  <p className="text-base font-medium text-gray-900">
                    {staff.email || "未設定"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">言語</p>
                  <p className="text-base font-medium text-gray-900">
                    {getLanguageLabel(staff.language)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">権限</p>
                  <p className="text-base font-medium text-gray-900">
                    {getRoleLabel(staff.role)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">登録日</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(staff.created_at).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>
            </div>

            <hr />

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/${locale}/admin/staff/edit/${staff.id}`} className="flex-1">
                <Button variant="primary" fullWidth>
                  ✏️ 編集
                </Button>
              </Link>
              <Link href={`/${locale}/admin/staff`} className="flex-1">
                <Button variant="secondary" fullWidth>
                  一覧に戻る
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* 学習状況カード（将来実装予定） */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">📊 学習状況</h3>
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">学習履歴はSupabase実装後に表示されます</p>
            </div>
          </div>
        </Card>

        {/* バッジカード（将来実装予定） */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">🏆 獲得バッジ</h3>
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">バッジ情報はSupabase実装後に表示されます</p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
