import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * マニュアル削除API
 * 管理者/エリアマネージャーがマニュアルを削除
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const manualId = searchParams.get("id");

    if (!manualId) {
      return NextResponse.json(
        { error: "マニュアルIDが指定されていません" },
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
        { error: "マニュアルを削除する権限がありません" },
        { status: 403 }
      );
    }

    // 削除対象のマニュアルを取得（同じ組織か確認）
    const { data: manualData, error: fetchError } = await adminClient
      .from("manuals")
      .select("*")
      .eq("id", manualId)
      .eq("organization_id", userData.organization_id)
      .single();

    if (fetchError || !manualData) {
      return NextResponse.json(
        { error: "マニュアルが見つかりません" },
        { status: 404 }
      );
    }

    // マニュアルを削除
    const { error: deleteError } = await adminClient
      .from("manuals")
      .delete()
      .eq("id", manualId);

    if (deleteError) {
      console.error("Manual delete error:", deleteError);
      return NextResponse.json(
        { error: "マニュアルの削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "マニュアルを削除しました",
    });
  } catch (error) {
    console.error("Manual deletion error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
