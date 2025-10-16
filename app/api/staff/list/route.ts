import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * スタッフ一覧取得API
 * 管理者が自分の組織のスタッフ一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    // 現在ログイン中の管理者を取得
    const supabase = await createClient();
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // 管理者情報を取得（組織IDを取得するため）
    const adminClient = createAdminClient();
    const { data: adminData, error: adminFetchError } = await adminClient
      .from("users")
      .select("organization_id, role")
      .eq("auth_id", currentUser.id) // auth_idで検索
      .single();

    if (adminFetchError || !adminData) {
      return NextResponse.json(
        { error: "管理者情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    // 管理者権限チェック
    if (adminData.role !== "admin" && adminData.role !== "area_manager") {
      return NextResponse.json(
        { error: "スタッフ一覧を閲覧する権限がありません" },
        { status: 403 }
      );
    }

    // 同じ組織のスタッフを取得
    const { data: staffList, error: fetchError } = await adminClient
      .from("users")
      .select("*")
      .eq("organization_id", adminData.organization_id)
      .in("role", ["staff", "admin", "area_manager"])
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Staff fetch error:", fetchError);
      return NextResponse.json(
        { error: "スタッフ一覧の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      staff: staffList || [],
    });
  } catch (error) {
    console.error("Staff list error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
