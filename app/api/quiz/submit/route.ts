import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * 理解度テスト回答提出API
 * スタッフの回答を受け取り、採点して結果を保存
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, answers } = body;

    if (!sessionId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "セッションIDまたは回答が不正です" },
        { status: 400 }
      );
    }

    // 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // ユーザー情報を取得
    const adminClient = createAdminClient();
    const { data: userData, error: userError } = await adminClient
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "ユーザー情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    // セッションを取得（本人のセッションか確認）
    const { data: session, error: sessionError } = await adminClient
      .from("quiz_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userData.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "テストセッションが見つかりません" },
        { status: 404 }
      );
    }

    // 問題を取得
    const { data: questions, error: questionsError } = await adminClient
      .from("quiz_questions")
      .select("*")
      .eq("session_id", sessionId)
      .order("order_index", { ascending: true });

    if (questionsError || !questions) {
      return NextResponse.json(
        { error: "問題の取得に失敗しました" },
        { status: 500 }
      );
    }

    // 採点処理
    let correctCount = 0;
    const results: any[] = [];
    const answersToInsert: any[] = [];

    for (const answer of answers) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      const isCorrect = answer.userAnswer === question.correct_answer;
      if (isCorrect) correctCount++;

      results.push({
        questionId: question.id,
        question: question.question_text,
        userAnswer: answer.userAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation,
        options: question.options,
      });

      answersToInsert.push({
        question_id: question.id,
        session_id: sessionId,
        user_answer: answer.userAnswer,
        is_correct: isCorrect,
      });
    }

    // 回答をDBに保存
    const { error: answersError } = await adminClient
      .from("quiz_answers")
      .insert(answersToInsert);

    if (answersError) {
      console.error("Answers insertion error:", answersError);
      return NextResponse.json(
        { error: "回答の保存に失敗しました" },
        { status: 500 }
      );
    }

    // セッションのスコアを更新
    const percentage = (correctCount / questions.length) * 100;
    const { error: updateError } = await adminClient
      .from("quiz_sessions")
      .update({
        score: correctCount,
        percentage: percentage.toFixed(2),
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Session update error:", updateError);
      return NextResponse.json(
        { error: "スコアの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      score: correctCount,
      totalQuestions: questions.length,
      percentage: parseFloat(percentage.toFixed(2)),
      results,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { error: "回答の提出中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
