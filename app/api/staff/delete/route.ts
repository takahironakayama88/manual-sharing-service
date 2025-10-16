import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * スタッフ削除API
 * 管理者がスタッフを削除
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("id");

    if (!staffId) {
      return NextResponse.json({ error: "スタッフIDが指定されていません" }, { status: 400 });
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
      return NextResponse.json({ error: "スタッフを削除する権限がありません" }, { status: 403 });
    }

    // 削除対象のスタッフを取得（同じ組織に所属しているか確認）
    const { data: staffData, error: staffFetchError } = await adminClient
      .from("users")
      .select("*")
      .eq("id", staffId)
      .eq("organization_id", adminData.organization_id)
      .single();

    if (staffFetchError || !staffData) {
      return NextResponse.json({ error: "スタッフが見つかりません" }, { status: 404 });
    }

    // Supabase Authから削除（auth_idが存在する場合）
    // ON DELETE CASCADEにより、usersテーブルからも自動削除される
    if (staffData.auth_id) {
      try {
        const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(staffData.auth_id);
        if (authDeleteError) {
          console.error("Auth delete error:", authDeleteError);
          return NextResponse.json({ error: "認証情報の削除に失敗しました" }, { status: 500 });
        }
      } catch (authDeleteError) {
        console.error("Auth delete error:", authDeleteError);
        return NextResponse.json({ error: "認証情報の削除に失敗しました" }, { status: 500 });
      }
    } else {
      // auth_idが存在しない場合のみ、usersテーブルから直接削除
      const { error: deleteError } = await adminClient.from("users").delete().eq("id", staffId);

      if (deleteError) {
        console.error("Staff delete error:", deleteError);
        return NextResponse.json({ error: "スタッフの削除に失敗しました" }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: "スタッフを削除しました",
    });
  } catch (error) {
    console.error("Staff deletion error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
