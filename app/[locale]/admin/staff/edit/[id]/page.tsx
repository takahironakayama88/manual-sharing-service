"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layouts/AdminLayout";
import StaffForm from "@/components/organisms/StaffForm";
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
    params.then(async (p) => {
      setLocale(p.locale);

      // Supabaseからスタッフを取得
      try {
        const response = await fetch(`/api/staff/list`);
        if (!response.ok) {
          throw new Error("Failed to fetch staff");
        }

        const data = await response.json();
        const foundStaff = data.staff.find((s: User) => s.id === p.id);

        if (!foundStaff) {
          router.push(`/${p.locale}/admin/staff`);
          return;
        }

        setStaff(foundStaff);
      } catch (error) {
        console.error("Error fetching staff:", error);
        router.push(`/${p.locale}/admin/staff`);
      } finally {
        setLoading(false);
      }
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
