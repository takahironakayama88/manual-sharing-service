"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import StaffForm from "@/components/organisms/StaffForm";

interface NewStaffPageProps {
  params: Promise<{
    locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  }>;
}

export default function NewStaffPage({ params }: NewStaffPageProps) {
  const [locale, setLocale] = useState<"ja" | "vi" | "my" | "id" | "fil" | "km" | "th">("ja");

  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);
    });
  }, [params]);

  return (
    <AdminLayout currentLocale={locale} userName="管理者">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">➕ スタッフ追加</h2>
          <p className="text-sm text-gray-600 mt-1">新しいスタッフを登録します</p>
        </div>
        <StaffForm locale={locale} />
      </div>
    </AdminLayout>
  );
}
