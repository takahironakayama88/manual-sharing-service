"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

interface AdminLayoutProps {
  children: ReactNode;
  currentLocale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  userName?: string;
}

export default function AdminLayout({ children, currentLocale, userName }: AdminLayoutProps) {
  const pathname = usePathname();
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

  const navItems = [
    { id: "dashboard", label: "ダッシュボード", shortLabel: "ホーム", icon: "📊", href: `/${currentLocale}/admin` },
    {
      id: "manuals",
      label: "マニュアル管理",
      shortLabel: "マニュアル",
      icon: "📚",
      href: `/${currentLocale}/admin/manuals`,
    },
    {
      id: "staff",
      label: "スタッフ管理",
      shortLabel: "スタッフ",
      icon: "👥",
      href: `/${currentLocale}/admin/staff`,
    },
    {
      id: "quiz-results",
      label: "理解度テスト結果",
      shortLabel: "テスト",
      icon: "📝",
      href: `/${currentLocale}/admin/quiz-results`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-xl border border-blue-100">
                <img src="/logo.png" alt="Smuuuz" className="h-7 w-auto" />
                <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  業務マニュアル
                </span>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                管理画面
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 font-medium">{userName}</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* サイドバーナビゲーション（タブレット・PC用） */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg border border-gray-200 p-2 sticky top-24">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* メインコンテンツ */}
          <main className="flex-1 w-full">{children}</main>
        </div>
      </div>

      {/* 下部タブバー（モバイル用） */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 safe-area-inset-bottom">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center justify-center flex-1 py-3 transition-all duration-200",
                  isActive ? "text-blue-600" : "text-gray-600"
                )}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className={clsx("text-xs font-medium", isActive && "font-bold")}>
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
