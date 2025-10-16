"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StaffLayout from "@/components/layouts/StaffLayout";
import Button from "@/components/atoms/Button";
import { getCurrentUser, mockBadges } from "@/lib/mock-data";

interface QuizPageProps {
  params: Promise<{
    locale: "ja" | "vi" | "my" | "id" | "fil" | "km" | "th";
    manualId: string;
  }>;
}

interface Question {
  id: string;
  question_text: string;
  options: string[];
  order_index: number;
}

interface QuizResult {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  options: string[];
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<"ja" | "vi" | "my" | "id" | "fil" | "km" | "th">("ja");
  const [manualId, setManualId] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    totalQuestions: number;
    percentage: number;
    results: QuizResult[];
  } | null>(null);

  const currentUser = getCurrentUser();
  const userBadges = [mockBadges[0], mockBadges[1]];

  useEffect(() => {
    params.then(async (p) => {
      setLocale(p.locale);
      setManualId(p.manualId);

      // URLパラメータから言語を取得
      const urlParams = new URLSearchParams(window.location.search);
      const lang = urlParams.get("lang");
      setTargetLanguage(lang);

      // 問題を自動生成
      await generateQuiz(p.manualId, lang);
    });
  }, [params]);

  const generateQuiz = async (manualIdParam: string, lang: string | null) => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          manualId: manualIdParam,
          targetLanguage: lang || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "テストの生成に失敗しました");
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setQuestions(data.questions);
    } catch (err) {
      console.error("Quiz generation error:", err);
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (!sessionId) return;

    // 全問回答済みかチェック
    const unansweredQuestions = questions.filter((q) => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      alert("全ての問題に回答してください");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const answersArray = questions.map((q) => ({
        questionId: q.id,
        userAnswer: answers[q.id],
      }));

      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          answers: answersArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "回答の提出に失敗しました");
      }

      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (err) {
      console.error("Quiz submission error:", err);
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || generating) {
    return (
      <StaffLayout currentLocale={locale} userName={currentUser.display_name} userBadges={userBadges}>
        <div className="text-center py-12">
          <div className="inline-flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <div className="text-gray-900">
              <p className="text-lg font-medium">AIが問題を生成中...</p>
              <p className="text-sm text-gray-600 mt-2">少々お待ちください</p>
            </div>
          </div>
        </div>
      </StaffLayout>
    );
  }

  if (error) {
    return (
      <StaffLayout currentLocale={locale} userName={currentUser.display_name} userBadges={userBadges}>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium mb-2">エラーが発生しました</p>
            <p className="text-red-700 text-sm">{error}</p>
            <Button
              variant="secondary"
              size="md"
              onClick={() => router.back()}
              className="mt-4"
            >
              戻る
            </Button>
          </div>
        </div>
      </StaffLayout>
    );
  }

  if (showResults && results) {
    return (
      <StaffLayout currentLocale={locale} userName={currentUser.display_name} userBadges={userBadges}>
        <div className="space-y-6">
          {/* スコア表示 */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-2">テスト完了！</h2>
            <p className="text-5xl font-bold my-4">{results.percentage}%</p>
            <p className="text-xl">
              {results.score} / {results.totalQuestions} 問正解
            </p>
          </div>

          {/* 結果詳細 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">解答結果</h3>
            {results.results.map((result, index) => (
              <div
                key={result.questionId}
                className={`border-2 rounded-lg p-6 ${
                  result.isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      result.isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {result.isCorrect ? "✓" : "✗"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-3">
                      問{index + 1}: {result.question}
                    </p>

                    <div className="space-y-2 mb-4">
                      {result.options.map((option, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg border-2 ${
                            option === result.correctAnswer
                              ? "border-green-500 bg-green-100"
                              : option === result.userAnswer && !result.isCorrect
                              ? "border-red-500 bg-red-100"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + optIdx)}. </span>
                          {option}
                          {option === result.correctAnswer && (
                            <span className="ml-2 text-green-600 font-bold">✓ 正解</span>
                          )}
                          {option === result.userAnswer && !result.isCorrect && (
                            <span className="ml-2 text-red-600 font-bold">✗ あなたの回答</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {result.explanation && (
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">解説:</p>
                        <p className="text-sm text-gray-600">{result.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => router.push(`/${locale}/staff`)}
            >
              一覧に戻る
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => router.push(`/${locale}/staff/manuals/${manualId}`)}
            >
              マニュアルに戻る
            </Button>
          </div>
        </div>
      </StaffLayout>
    );
  }

  const languageNames: Record<string, string> = {
    vi: "ベトナム語",
    my: "ミャンマー語",
    id: "インドネシア語",
    fil: "フィリピン語",
    km: "クメール語",
    th: "タイ語",
  };

  return (
    <StaffLayout currentLocale={locale} userName={currentUser.display_name} userBadges={userBadges}>
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">理解度テスト</h2>
            {targetLanguage && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium">
                🌐 {languageNames[targetLanguage] || targetLanguage}版
              </span>
            )}
          </div>
          <p className="text-gray-700">
            全{questions.length}問の選択式問題です。全ての問題に回答してから提出してください。
          </p>
        </div>

        {/* 問題リスト */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                問{index + 1}: {question.question_text}
              </h3>

              <div className="space-y-3">
                {question.options.map((option, optIdx) => (
                  <label
                    key={optIdx}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      answers[question.id] === option
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="flex-1 font-medium text-gray-900">
                      {String.fromCharCode(65 + optIdx)}. {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 提出ボタン */}
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 -mx-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < questions.length}
          >
            {submitting ? "提出中..." : "回答を提出"}
          </Button>
          {Object.keys(answers).length < questions.length && (
            <p className="text-sm text-gray-600 text-center mt-2">
              回答済み: {Object.keys(answers).length} / {questions.length}問
            </p>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
