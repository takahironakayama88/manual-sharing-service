"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/molecules/LanguageSwitcher";
import { Badge } from "@/components/atoms";

interface StaffLayoutProps {
  children: ReactNode;
  currentLocale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  userName?: string;
  userBadges?: Array<{ icon: string; name: string }>;
}

export default function StaffLayout({
  children,
  currentLocale,
  userName,
  userBadges = [],
}: StaffLayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900 mb-1">📱 マニュアル</h1>
              <p className="text-sm text-gray-600">{userName}</p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher currentLocale={currentLocale} />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
