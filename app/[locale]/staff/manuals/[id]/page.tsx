"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StaffLayout from "@/components/layouts/StaffLayout";
import ManualBlockViewer from "@/components/organisms/ManualBlockViewer";
import { Button, BackButton } from "@/components/atoms";
import { getCurrentUser, mockBadges } from "@/lib/mock-data";
import { Manual } from "@/types/database";

interface ManualDetailPageProps {
  params: Promise<{
    locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
    id: string;
  }>;
}

export default function ManualDetailPage({ params }: ManualDetailPageProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<"ja" | "vi" | "my" | "id" | "fil" | "km" | "th">("ja");
  const [manual, setManual] = useState<Manual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualId, setManualId] = useState<string>("");
  const [translatedManual, setTranslatedManual] = useState<{ title: string; blocks: unknown[] } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const currentUser = getCurrentUser();

  useEffect(() => {
    params.then(async (p) => {
      setLocale(p.locale);
      setManualId(p.id);

      try {
        // Supabase APIから公開済み&表示可能なマニュアルのみ取得
        const response = await fetch("/api/manuals/list?visibleOnly=true");

        if (!response.ok) {
          throw new Error("マニュアルの取得に失敗しました");
        }

        const data = await response.json();
        const allManuals = data.manuals || [];

        // マニュアルを取得
        const foundManual = allManuals.find((m: Manual) => m.id === p.id);

        if (!foundManual) {
          setError("マニュアルが見つかりませんでした");
          setTimeout(() => {
            router.push(`/${p.locale}/staff`);
          }, 2000);
          return;
        }

        setManual(foundManual);
      } catch (err) {
        console.error("Error loading manual:", err);
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
      } finally {
        setLoading(false);
      }
    });
  }, [params, router]);

  const handleGenerateQuiz = () => {
    // 翻訳版を表示中の場合は、言語パラメータを渡す
    const languageParam = !showOriginal && selectedLanguage ? `?lang=${selectedLanguage}` : "";
    router.push(`/${locale}/staff/quiz/${manualId}${languageParam}`);
  };

  const handleTranslate = async (targetLanguage: string) => {
    if (!manual) return;

    setIsTranslating(true);
    setSelectedLanguage(targetLanguage);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          manualId: manual.id,
          targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("翻訳に失敗しました");
      }

      const data = await response.json();
      setTranslatedManual({
        title: data.translation.translated_title,
        blocks: data.translation.translated_blocks,
      });
      setShowOriginal(false);
    } catch (err) {
      console.error("Translation error:", err);
      alert("翻訳に失敗しました。もう一度お試しください。");
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleLanguage = () => {
    setShowOriginal(!showOriginal);
  };

  // ユーザーのバッジ（モック）
  const userBadges = [mockBadges[0], mockBadges[1]];

  if (loading) {
    return (
      <StaffLayout
        currentLocale={locale}
        userName={currentUser.display_name}
        userBadges={userBadges}
      >
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>読み込み中...</span>
          </div>
        </div>
      </StaffLayout>
    );
  }

  if (error || !manual) {
    return (
      <StaffLayout
        currentLocale={locale}
        userName={currentUser.display_name}
        userBadges={userBadges}
      >
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error || "マニュアルが見つかりませんでした"}</p>
            <p className="text-sm text-gray-600 mt-2">自動的に一覧ページに戻ります...</p>
          </div>
        </div>
      </StaffLayout>
    );
  }

  const languageOptions = [
    { code: "vi", name: "ベトナム語", nativeName: "Tiếng Việt", flag: "🇻🇳" },
    { code: "my", name: "ミャンマー語", nativeName: "မြန်မာဘာသာ", flag: "🇲🇲" },
    { code: "id", name: "インドネシア語", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "fil", name: "フィリピン語", nativeName: "Filipino", flag: "🇵🇭" },
    { code: "km", name: "クメール語", nativeName: "ភាសាខ្មែរ", flag: "🇰🇭" },
    { code: "th", name: "タイ語", nativeName: "ภาษาไทย", flag: "🇹🇭" },
  ];

  const displayTitle = showOriginal ? manual.title : (translatedManual?.title || manual.title);
  const displayBlocks = showOriginal ? manual.blocks : (translatedManual?.blocks || manual.blocks);

  return (
    <StaffLayout
      currentLocale={locale}
      userName={currentUser.display_name}
      userBadges={userBadges}
    >
      <div>
        {/* 翻訳言語選択 */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            🌍 母国語で読む
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {languageOptions.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleTranslate(lang.code)}
                disabled={isTranslating}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${selectedLanguage === lang.code && !showOriginal
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                  }
                  ${isTranslating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <span className="mr-1">{lang.flag}</span>
                {lang.nativeName}
              </button>
            ))}
          </div>
          {isTranslating && (
            <div className="mt-3 flex items-center gap-2 text-blue-600 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>翻訳中... (10-15秒ほどかかります)</span>
            </div>
          )}
          {translatedManual && (
            <div className="mt-3">
              <button
                onClick={toggleLanguage}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {showOriginal ? "📖 翻訳版を表示" : "📝 日本語版を表示"}
              </button>
            </div>
          )}
        </div>

        {/* マニュアルタイトル */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{displayTitle}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>
              {new Date(manual.updated_at).toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {!showOriginal && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                🌐 翻訳版
              </span>
            )}
          </div>
        </div>

        {/* マニュアルコンテンツ */}
        <ManualBlockViewer blocks={displayBlocks} />

        {/* 理解度テストボタン */}
        <div className="mt-6">
          <Button variant="primary" size="lg" fullWidth onClick={handleGenerateQuiz}>
            理解度テストを生成 📝
          </Button>
        </div>

        {/* 戻るボタン */}
        <div className="mt-4">
          <BackButton label="← 戻る" locale={locale} />
        </div>
      </div>
    </StaffLayout>
  );
}
