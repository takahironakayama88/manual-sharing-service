import { NextRequest, NextResponse } from "next/server";
import { createAnthropicClient } from "@/lib/anthropic/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * 翻訳API - Claude APIを使ってマニュアルを翻訳
 */
export async function POST(request: NextRequest) {
  try {
    const { manualId, targetLanguage } = await request.json();

    if (!manualId || !targetLanguage) {
      return NextResponse.json(
        { success: false, error: "manualId and targetLanguage are required" },
        { status: 400 }
      );
    }

    // Validate target language
    const supportedLanguages = ["vi", "my", "id", "fil", "km", "th"];
    if (!supportedLanguages.includes(targetLanguage)) {
      return NextResponse.json(
        { success: false, error: "Unsupported target language" },
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
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();

    // ユーザー情報を取得
    const { data: userData, error: userError } = await adminClient
      .from("users")
      .select("id, organization_id")
      .eq("auth_id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if translation already exists
    const { data: existingTranslation } = await adminClient
      .from("manual_translations")
      .select("*")
      .eq("manual_id", manualId)
      .eq("target_language", targetLanguage)
      .single();

    if (existingTranslation) {
      return NextResponse.json({
        success: true,
        translation: existingTranslation,
        cached: true,
      });
    }

    // Get the manual
    const { data: manual, error: manualError } = await adminClient
      .from("manuals")
      .select("*")
      .eq("id", manualId)
      .eq("organization_id", userData.organization_id)
      .single();

    if (manualError || !manual) {
      return NextResponse.json(
        { success: false, error: "Manual not found" },
        { status: 404 }
      );
    }

    // Prepare content for translation
    const languageNames: Record<string, string> = {
      vi: "ベトナム語 (Tiếng Việt)",
      my: "ミャンマー語 (မြန်မာဘာသာ)",
      id: "インドネシア語 (Bahasa Indonesia)",
      fil: "フィリピン語 (Filipino)",
      km: "クメール語 (ភាសាខ្មែរ)",
      th: "タイ語 (ภาษาไทย)",
    };

    const anthropic = createAnthropicClient();

    // タイトルを翻訳
    const titleMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `以下のマニュアルタイトルを${languageNames[targetLanguage]}に翻訳してください。翻訳結果のみを返してください。\n\nタイトル: ${manual.title}`
      }]
    });
    const translatedTitle = titleMessage.content[0].type === "text" ? titleMessage.content[0].text.trim() : manual.title;

    // ブロックを分割翻訳（5ブロックずつ）
    const CHUNK_SIZE = 5;
    const allTranslatedBlocks: any[] = [];

    for (let i = 0; i < manual.blocks.length; i += CHUNK_SIZE) {
      const chunk = manual.blocks.slice(i, i + CHUNK_SIZE);

      // チャンクのテキストを準備
      const chunkTexts = chunk.map((block: any, index: number) => {
        const blockIndex = i + index;
        const content = typeof block.content === 'string' ? block.content : "";

        let text = `[ブロック${blockIndex}]`;
        if (block.type === "heading1" || block.type === "heading2" || block.type === "heading3" || block.type === "heading") {
          text += `\n[見出し] ${content}`;
        } else if (block.type === "paragraph") {
          text += `\n[段落] ${content}`;
        } else if (block.type === "bullet_list" || block.type === "bulletList") {
          try {
            const items = typeof content === 'string' ? JSON.parse(content) : (block.items || []);
            text += `\n[リスト]\n${items.map((item: string) => `- ${item}`).join("\n")}`;
          } catch {
            text += `\n[リスト] ${content}`;
          }
        } else if (block.type === "numbered_list" || block.type === "numberedList") {
          try {
            const items = typeof content === 'string' ? JSON.parse(content) : (block.items || []);
            text += `\n[番号付きリスト]\n${items.map((item: string, idx: number) => `${idx + 1}. ${item}`).join("\n")}`;
          } catch {
            text += `\n[番号付きリスト] ${content}`;
          }
        }
        return text;
      });

      const chunkText = chunkTexts.join("\n\n");

      // チャンクを翻訳
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 8192,
        messages: [{
          role: "user",
          content: `あなたはプロの翻訳者です。以下の日本語のマニュアルブロックを${languageNames[targetLanguage]}に翻訳してください。

翻訳ルール：
1. 正確で自然な翻訳を心がける
2. 専門用語は適切に訳す
3. 敬語は対象言語の標準的な丁寧表現を使う
4. [ブロックN]、[見出し]、[段落]、[リスト]のタグは保持する
5. JSONフォーマットで回答する

マニュアルブロック:
${chunkText}

以下のJSONフォーマットで翻訳結果を返してください：
{
  "blocks": [
    {"blockIndex": 0, "type": "heading1", "content": "翻訳された見出し"},
    {"blockIndex": 1, "type": "paragraph", "content": "翻訳された段落"},
    {"blockIndex": 2, "type": "bullet_list", "content": "[\"項目1\", \"項目2\"]"}
  ]
}`
        }]
      });

      // レスポンスをパース
      const responseText = message.content[0].type === "text" ? message.content[0].text : "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          const chunkData = JSON.parse(jsonMatch[0]);
          if (chunkData.blocks && Array.isArray(chunkData.blocks)) {
            allTranslatedBlocks.push(...chunkData.blocks);
          }
        } catch (e) {
          console.error(`Chunk ${i} parse error:`, e);
        }
      }
    }

    // 翻訳結果を元のブロック構造に復元
    const translatedBlocks = manual.blocks.map((originalBlock: any, index: number) => {
      const translated = allTranslatedBlocks.find((b: any) => b.blockIndex === index);
      if (translated) {
        return {
          type: translated.type || originalBlock.type,
          content: translated.content || originalBlock.content
        };
      }
      return originalBlock;
    });

    const translationData = {
      title: translatedTitle,
      blocks: translatedBlocks
    };

    // Save translation to database
    const { data: newTranslation, error: saveError } = await adminClient
      .from("manual_translations")
      .insert({
        manual_id: manualId,
        target_language: targetLanguage,
        translated_title: translationData.title,
        translated_blocks: translationData.blocks,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving translation:", saveError);
      return NextResponse.json(
        { success: false, error: "Failed to save translation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      translation: newTranslation,
      cached: false,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { success: false, error: "Translation failed" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve existing translation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const manualId = searchParams.get("manualId");
    const targetLanguage = searchParams.get("targetLanguage");

    if (!manualId || !targetLanguage) {
      return NextResponse.json(
        { success: false, error: "manualId and targetLanguage are required" },
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
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();

    // ユーザー情報を取得
    const { data: userData, error: userError } = await adminClient
      .from("users")
      .select("id, organization_id")
      .eq("auth_id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get translation
    const { data: translation } = await adminClient
      .from("manual_translations")
      .select("*, manual:manuals!manual_translations_manual_id_fkey(*)")
      .eq("manual_id", manualId)
      .eq("target_language", targetLanguage)
      .single();

    if (!translation) {
      return NextResponse.json(
        { success: false, error: "Translation not found" },
        { status: 404 }
      );
    }

    // Verify access
    if (translation.manual.organization_id !== userData.organization_id) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      translation,
    });
  } catch (error) {
    console.error("Get translation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get translation" },
      { status: 500 }
    );
  }
}
