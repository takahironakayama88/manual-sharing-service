import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * スタッフ管理者権限更新API
 * 管理者がスタッフの管理者権限を付与・解除
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, isAdmin } = body;

    if (!userId || typeof isAdmin !== "boolean") {
      return NextResponse.json({ error: "無効なリクエストです" }, { status: 400 });
    }

    // 現在ログイン中の管理者を取得
    const supabase = await createClient();
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 管理者情報を取得
    const adminClient = createAdminClient();
    const { data: adminData, error: adminFetchError } = await adminClient
      .from("users")
      .select("organization_id, role")
      .eq("auth_id", currentUser.id) // auth_idで検索
      .single();

    if (adminFetchError || !adminData) {
      return NextResponse.json({ error: "管理者情報の取得に失敗しました" }, { status: 500 });
    }

    // 管理者権限チェック
    if (adminData.role !== "admin" && adminData.role !== "area_manager") {
      return NextResponse.json({ error: "権限を変更する権限がありません" }, { status: 403 });
    }

    // 更新対象のスタッフを取得（同じ組織に所属しているか確認）
    const { data: staffData, error: staffFetchError } = await adminClient
      .from("users")
      .select("*")
      .eq("id", userId)
      .eq("organization_id", adminData.organization_id)
      .single();

    if (staffFetchError || !staffData) {
      return NextResponse.json({ error: "スタッフが見つかりません" }, { status: 404 });
    }

    // 管理者権限を更新
    const { error: updateError } = await adminClient
      .from("users")
      .update({ is_admin: isAdmin })
      .eq("id", userId);

    if (updateError) {
      console.error("Admin permission update error:", updateError);
      return NextResponse.json({ error: "管理者権限の更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: isAdmin ? "管理者権限を付与しました" : "管理者権限を解除しました",
    });
  } catch (error) {
    console.error("Admin permission update error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
