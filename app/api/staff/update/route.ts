import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * スタッフ情報更新API
 * 管理者がスタッフの基本情報を更新
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayName, email, language, role } = body;

    if (!userId) {
      return NextResponse.json({ error: "ユーザーIDが指定されていません" }, { status: 400 });
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
      .eq("auth_id", currentUser.id)
      .single();

    if (adminFetchError || !adminData) {
      return NextResponse.json({ error: "管理者情報の取得に失敗しました" }, { status: 500 });
    }

    // 管理者権限チェック
    if (adminData.role !== "admin" && adminData.role !== "area_manager") {
      return NextResponse.json({ error: "スタッフ情報を変更する権限がありません" }, { status: 403 });
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

    // 更新データを準備（提供されたフィールドのみ更新）
    const updateData: any = {};
    if (displayName !== undefined) updateData.display_name = displayName;
    if (email !== undefined) updateData.email = email;
    if (language !== undefined) updateData.language = language;
    if (role !== undefined) updateData.role = role;

    // スタッフ情報を更新
    const { data: updatedStaff, error: updateError } = await adminClient
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Staff update error:", updateError);
      return NextResponse.json({ error: "スタッフ情報の更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "スタッフ情報を更新しました",
      staff: updatedStaff,
    });
  } catch (error) {
    console.error("Staff update error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
