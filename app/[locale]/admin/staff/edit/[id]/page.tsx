"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layouts/AdminLayout";
import StaffForm from "@/components/organisms/StaffForm";
import { mockUsers } from "@/lib/mock-data";
import { User } from "@/types/database";

interface EditStaffPageProps {
  params: Promise<{
    locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
    id: string;
  }>;
}

export default function EditStaffPage({ params }: EditStaffPageProps) {
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

  return (
    <AdminLayout currentLocale={locale} userName="管理者">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">✏️ スタッフ編集</h2>
          <p className="text-sm text-gray-600 mt-1">スタッフ情報を編集します</p>
        </div>
        <StaffForm locale={locale} initialStaff={staff} />
      </div>
    </AdminLayout>
  );
}
