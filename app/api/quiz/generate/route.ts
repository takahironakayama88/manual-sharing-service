import { createAnthropicClient } from "@/lib/anthropic/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * 理解度テスト生成API
 * Claude APIを使ってマニュアルから問題を自動生成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { manualId, targetLanguage } = body;

    if (!manualId) {
      return NextResponse.json(
        { error: "マニュアルIDが指定されていません" },
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
      .select("id, organization_id")
      .eq("auth_id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "ユーザー情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    // マニュアルを取得（組織チェック含む）
    const { data: manual, error: manualError } = await adminClient
      .from("manuals")
      .select("*")
      .eq("id", manualId)
      .eq("organization_id", userData.organization_id)
      .eq("status", "published")
      .single();

    if (manualError || !manual) {
      return NextResponse.json(
        { error: "マニュアルが見つかりません" },
        { status: 404 }
      );
    }

    // 翻訳版を使用する場合は翻訳データを取得
    let manualTitle = manual.title;
    let manualBlocks = manual.blocks;
    let questionLanguage = "日本語";

    if (targetLanguage && targetLanguage !== "ja") {
      const { data: translation } = await adminClient
        .from("manual_translations")
        .select("*")
        .eq("manual_id", manualId)
        .eq("target_language", targetLanguage)
        .single();

      if (translation) {
        manualTitle = translation.translated_title;
        manualBlocks = translation.translated_blocks;

        const languageNames: Record<string, string> = {
          vi: "ベトナム語 (Tiếng Việt)",
          my: "ミャンマー語 (မြန်မာဘာသာ)",
          id: "インドネシア語 (Bahasa Indonesia)",
          fil: "フィリピン語 (Filipino)",
          km: "クメール語 (ភាសាខ្មែរ)",
          th: "タイ語 (ภาษาไทย)",
        };
        questionLanguage = languageNames[targetLanguage] || targetLanguage;
      }
    }

    // マニュアルのブロックからテキストコンテンツを抽出
    console.log("Manual blocks:", JSON.stringify(manualBlocks, null, 2));
    const textContent = extractTextFromBlocks(manualBlocks);
    console.log("Extracted text content length:", textContent?.length || 0);
    console.log("Extracted text content preview:", textContent?.substring(0, 200));

    if (!textContent || textContent.length < 50) {
      console.error("Insufficient text content. Length:", textContent?.length || 0);
      return NextResponse.json(
        {
          error: "マニュアルのテキストが不足しています",
          details: `抽出されたテキスト: ${textContent?.length || 0}文字（最低50文字必要）`
        },
        { status: 400 }
      );
    }

    // Claude APIで問題を生成
    console.log("Creating Anthropic client...");
    const anthropic = createAnthropicClient();
    console.log("Anthropic client created successfully");

    // 翻訳版の場合は、その言語で問題を生成
    const promptLanguageInstruction =
      targetLanguage && targetLanguage !== "ja"
        ? `\n\n重要: 問題文、選択肢、解説は全て${questionLanguage}で作成してください。`
        : "";

    console.log("Calling Claude API...");
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `以下のマニュアル内容から、理解度を測るための選択式問題を5問作成してください。

マニュアルタイトル: ${manualTitle}
マニュアル内容:
${textContent}

要件:
- 各問題は4択形式（A, B, C, D）
- マニュアルの重要なポイントを問う
- 実務で役立つ知識を問う
- 正解は1つのみ
- 解説も付ける${promptLanguageInstruction}

JSONフォーマットで回答してください:
{
  "questions": [
    {
      "question": "問題文",
      "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      "correct_answer": "選択肢A",
      "explanation": "解説文"
    }
  ]
}`,
        },
      ],
    });
    console.log("Claude API response received");

    // Claude APIのレスポンスを解析
    const content = message.content[0];
    console.log("Response content type:", content.type);
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude API");
    }

    // JSONを抽出（```json ブロックの中にある場合も対応）
    let jsonText = content.text.trim();
    console.log("Raw response text:", jsonText.substring(0, 500));
    const jsonMatch = jsonText.match(/```json\s*\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
      console.log("Extracted JSON from code block");
    }

    console.log("Parsing JSON...");
    const quizData = JSON.parse(jsonText);
    console.log("Quiz data parsed successfully. Questions count:", quizData.questions?.length || 0);

    // クイズセッションをDBに保存
    const { data: session, error: sessionError } = await adminClient
      .from("quiz_sessions")
      .insert({
        manual_id: manualId,
        user_id: userData.id,
        score: 0, // まだ未回答
        total_questions: quizData.questions.length,
        percentage: 0,
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error("Session creation error:", sessionError);
      return NextResponse.json(
        { error: "テストセッションの作成に失敗しました" },
        { status: 500 }
      );
    }

    // 問題をDBに保存
    const questionsToInsert = quizData.questions.map(
      (q: any, index: number) => ({
        session_id: session.id,
        question_text: q.question,
        correct_answer: q.correct_answer,
        options: q.options,
        explanation: q.explanation,
        order_index: index,
      })
    );

    const { data: savedQuestions, error: questionsError } = await adminClient
      .from("quiz_questions")
      .insert(questionsToInsert)
      .select();

    if (questionsError || !savedQuestions) {
      console.error("Questions creation error:", questionsError);
      return NextResponse.json(
        { error: "問題の保存に失敗しました" },
        { status: 500 }
      );
    }

    // フロントエンドに返すデータ（正解は含めない）
    const questionsForClient = savedQuestions.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      options: q.options,
      order_index: q.order_index,
    }));

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      questions: questionsForClient,
    });
  } catch (error) {
    console.error("Quiz generation error:", error);

    // エラーの詳細情報をログ出力
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Anthropic APIエラーの場合
    if (error && typeof error === 'object' && 'status' in error) {
      console.error("API Status:", (error as any).status);
      console.error("API Error:", (error as any).error);
    }

    return NextResponse.json(
      {
        error: "テスト生成中にエラーが発生しました",
        details: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    );
  }
}

/**
 * マニュアルブロックからテキストコンテンツを抽出
 */
function extractTextFromBlocks(blocks: any[]): string {
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading1":
        case "heading2":
        case "heading3":
        case "paragraph":
          return block.content || "";
        case "bullet_list":
        case "numbered_list":
          try {
            const items = JSON.parse(block.content);
            return Array.isArray(items) ? items.join("\n") : "";
          } catch {
            return block.content || "";
          }
        default:
          return "";
      }
    })
    .filter((text) => text.trim().length > 0)
    .join("\n\n");
}
