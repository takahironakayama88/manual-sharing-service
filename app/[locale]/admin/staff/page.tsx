"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layouts/AdminLayout";
import Button from "@/components/atoms/Button";
import { mockUsers } from "@/lib/mock-data";
import StaffList from "@/components/organisms/StaffList";
import { User } from "@/types/database";

interface PageProps {
  params: Promise<{
    locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  }>;
}

export default function StaffManagementPage({ params }: PageProps) {
  const [locale, setLocale] = useState<"ja" | "vi" | "my" | "id" | "fil" | "km" | "th">("ja");
  const [staffUsers, setStaffUsers] = useState<User[]>([]);

  const loadStaff = () => {
    // mockUsersからスタッフのみをフィルタリング
    const mockStaff = mockUsers.filter((user) => user.role === "staff");

    // localStorageからスタッフを取得
    const savedStaff = localStorage.getItem("staff");
    if (savedStaff) {
      const parsedStaff = JSON.parse(savedStaff);
      setStaffUsers([...mockStaff, ...parsedStaff]);
    } else {
      setStaffUsers(mockStaff);
    }
  };

  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);
      loadStaff();
    });
  }, [params]);

  const handleDelete = () => {
    loadStaff(); // 削除後にリロード
  };

  return (
    <AdminLayout currentLocale={locale} userName="管理者">
      <div className="space-y-6">
        {/* ヘッダーセクション */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">👥 スタッフ管理</h2>
            <p className="text-sm text-gray-600 mt-1">スタッフの追加・編集・QRコード生成を行います</p>
          </div>
          <Link href={`/${locale}/admin/staff/new`}>
            <Button variant="primary" size="lg">
              + スタッフ追加
            </Button>
          </Link>
        </div>

        {/* スタッフ一覧（フィルター・検索・統計を含む） */}
        <StaffList users={staffUsers} locale={locale} onDelete={handleDelete} />
      </div>
    </AdminLayout>
  );
}
