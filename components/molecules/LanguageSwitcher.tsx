"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";

type Language = "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";

interface LanguageSwitcherProps {
  currentLocale: Language;
}

const languages = [
  { code: "ja" as Language, label: "日本語", flag: "🇯🇵" },
  { code: "vi" as Language, label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "my" as Language, label: "မြန်မာ", flag: "🇲🇲" },
  { code: "id" as Language, label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "fil" as Language, label: "Filipino", flag: "🇵🇭" },
  { code: "km" as Language, label: "ភាសាខ្មែរ", flag: "🇰🇭" },
  { code: "th" as Language, label: "ไทย", flag: "🇹🇭" },
];

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (newLocale: Language) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    startTransition(() => {
      // Cookieに言語設定を保存
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

      // 現在のパスから言語部分を置き換える
      // 例: /ja/staff -> /vi/staff
      const segments = pathname.split("/");
      segments[1] = newLocale;
      const newPath = segments.join("/");

      // ドロップダウンを閉じる
      setIsOpen(false);

      // 新しいパスに遷移
      router.push(newPath);
      router.refresh();
    });
  };

  return (
    <div className="relative">
      {/* ドロップダウンボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={clsx(
          "flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
          isPending && "opacity-50 cursor-not-allowed"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{isPending ? "⏳" : "🌐"}</span>
        <span>{currentLanguage.flag}</span>
        <span className="font-medium">{currentLanguage.label}</span>
        <svg
          className={clsx("w-4 h-4 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <>
          {/* オーバーレイ（クリックで閉じる） */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* メニューリスト */}
          <div
            className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto"
            role="listbox"
          >
            {languages.map((lang) => {
              const isActive = currentLocale === lang.code;

              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={isPending}
                  role="option"
                  aria-selected={isActive}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50",
                    isPending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="flex-1">{lang.label}</span>
                  {isActive && (
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
