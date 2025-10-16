"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import Button from "@/components/atoms/Button";

interface QuizResult {
  sessionId: string;
  userName: string;
  userEmail: string;
  manualTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

interface PageProps {
  params: Promise<{
    locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
  }>;
}

export default function QuizResultsPage({ params }: PageProps) {
  const [locale, setLocale] = useState<"ja" | "vi" | "my" | "id" | "fil" | "km" | "th">("ja");
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterManual, setFilterManual] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);
      loadResults();
    });
  }, [params]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/quiz/results");

      if (!response.ok) {
        throw new Error("テスト結果の取得に失敗しました");
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Error loading quiz results:", err);
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // フィルタリング処理
  const filteredResults = results.filter((result) => {
    const matchManual = filterManual === "" || result.manualTitle.includes(filterManual);
    const matchUser = filterUser === "" || result.userName.includes(filterUser);
    return matchManual && matchUser;
  });

  // 統計情報
  const stats = {
    totalTests: filteredResults.length,
    averageScore: filteredResults.length > 0
      ? (filteredResults.reduce((sum, r) => sum + r.percentage, 0) / filteredResults.length).toFixed(1)
      : 0,
    passRate: filteredResults.length > 0
      ? ((filteredResults.filter(r => r.percentage >= 80).length / filteredResults.length) * 100).toFixed(1)
      : 0,
  };

  // スコアに応じた色を取得
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <AdminLayout currentLocale={locale} userName="管理者">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">理解度テスト結果</h2>
          <p className="text-sm text-gray-600 mt-1">
            スタッフの理解度テストスコアを確認できます
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-blue-600 font-medium mb-1">総テスト数</p>
            <p className="text-3xl font-bold text-blue-900">{stats.totalTests}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-green-600 font-medium mb-1">平均スコア</p>
            <p className="text-3xl font-bold text-green-900">{stats.averageScore}%</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <p className="text-sm text-purple-600 font-medium mb-1">合格率 (80%以上)</p>
            <p className="text-3xl font-bold text-purple-900">{stats.passRate}%</p>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                マニュアルで絞り込み
              </label>
              <input
                type="text"
                value={filterManual}
                onChange={(e) => setFilterManual(e.target.value)}
                placeholder="マニュアル名を入力..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                スタッフで絞り込み
              </label>
              <input
                type="text"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                placeholder="スタッフ名を入力..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {(filterManual || filterUser) && (
            <button
              onClick={() => {
                setFilterManual("");
                setFilterUser("");
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              フィルターをクリア
            </button>
          )}
        </div>

        {/* ローディング */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>読み込み中...</span>
            </div>
          </div>
        )}

        {/* エラー */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadResults}
              className="mt-2 text-sm text-red-700 underline hover:no-underline"
            >
              再読み込み
            </button>
          </div>
        )}

        {/* 結果一覧 */}
        {!loading && !error && (
          <>
            {filteredResults.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">
                  {results.length === 0
                    ? "まだテスト結果がありません"
                    : "フィルター条件に一致する結果がありません"}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          スタッフ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          マニュアル
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          スコア
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          正解率
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          実施日時
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredResults.map((result) => (
                        <tr key={result.sessionId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {result.userName}
                              </div>
                              <div className="text-sm text-gray-500">{result.userEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{result.manualTitle}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {result.score} / {result.totalQuestions}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
                                result.percentage
                              )}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-2 ${getScoreBadgeColor(
                                  result.percentage
                                )}`}
                              ></span>
                              {result.percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(result.completedAt).toLocaleString("ja-JP", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
