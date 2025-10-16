import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * マニュアル更新API
 * 管理者/エリアマネージャーがマニュアルを更新
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, category, language, status, blocks, is_visible } = body;

    // バリデーション
    if (!id) {
      return NextResponse.json(
        { error: "マニュアルIDが必要です" },
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
      .select("organization_id, role")
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
        { error: "マニュアルを更新する権限がありません" },
        { status: 403 }
      );
    }

    // 更新対象のマニュアルを取得（同じ組織か確認）
    const { data: existingManual, error: fetchError } = await adminClient
      .from("manuals")
      .select("*")
      .eq("id", id)
      .eq("organization_id", userData.organization_id)
      .single();

    if (fetchError || !existingManual) {
      return NextResponse.json(
        { error: "マニュアルが見つかりません" },
        { status: 404 }
      );
    }

    // 更新データを準備
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (language !== undefined) updateData.language = language;
    if (status !== undefined) updateData.status = status;
    if (blocks !== undefined) updateData.blocks = blocks;
    if (is_visible !== undefined) updateData.is_visible = is_visible;

    // マニュアルを更新
    const { data: manual, error: updateError } = await adminClient
      .from("manuals")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Manual update error:", updateError);
      return NextResponse.json(
        { error: "マニュアルの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "マニュアルを更新しました",
      manual,
    });
  } catch (error) {
    console.error("Manual update error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
