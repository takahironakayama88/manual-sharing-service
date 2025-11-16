import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * マニュアル作成API
 * 管理者/エリアマネージャーがマニュアルを作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, language, status, blocks, is_visible, department_tags } = body;

    // バリデーション
    if (!title || !category || !language || !status || !blocks) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    // 現在ログイン中のユーザーを取得
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
    const { data: userData, error: userFetchError } = await adminClient
      .from("users")
      .select("id, organization_id, role")
      .eq("auth_id", user.id)
      .single();

    if (userFetchError || !userData) {
      return NextResponse.json(
        { error: "ユーザー情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    // 権限チェック
    if (userData.role !== "admin" && userData.role !== "area_manager") {
      return NextResponse.json(
        { error: "マニュアルを作成する権限がありません" },
        { status: 403 }
      );
    }

    // マニュアルを作成
    const { data: manual, error: createError } = await adminClient
      .from("manuals")
      .insert({
        title,
        description: description || null,
        category,
        language,
        status,
        blocks,
        is_visible: is_visible ?? true,
        department_tags: department_tags || [],
        organization_id: userData.organization_id,
        created_by: userData.id,
      })
      .select()
      .single();

    if (createError) {
      console.error("Manual creation error:", createError);
      return NextResponse.json(
        {
          error: "マニュアルの作成に失敗しました",
          details: createError.message,
          code: createError.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "マニュアルを作成しました",
      manual,
    });
  } catch (error) {
    console.error("Manual creation error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
