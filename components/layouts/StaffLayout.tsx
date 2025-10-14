import { ReactNode } from "react";
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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-gray-900">📱 マニュアル</h1>
            <div className="flex items-center gap-2">
              {userBadges.slice(0, 2).map((badge, index) => (
                <span key={index} title={badge.name} className="text-xl">
                  {badge.icon}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{userName}</p>
            <LanguageSwitcher currentLocale={currentLocale} />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
