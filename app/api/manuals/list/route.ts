import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * マニュアル一覧取得API
 * 組織内のマニュアル一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    // 現在ログイン中のユーザーを取得
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // ユーザー情報を取得（組織IDを取得するため）
    const adminClient = createAdminClient();
    const { data: userData, error: userFetchError } = await adminClient
      .from("users")
      .select("organization_id, role, is_admin")
      .eq("auth_id", user.id)
      .single();

    if (userFetchError || !userData) {
      return NextResponse.json(
        { error: "ユーザー情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status"); // 'published' | 'draft' | null
    const visibleOnly = searchParams.get("visibleOnly") === "true"; // スタッフ画面用

    // マニュアル一覧を取得
    let query = adminClient
      .from("manuals")
      .select("*")
      .eq("organization_id", userData.organization_id)
      .order("updated_at", { ascending: false });

    // ステータスフィルター
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    // スタッフ画面用: 公開済み & 表示可能なもののみ
    if (visibleOnly) {
      query = query.eq("status", "published").eq("is_visible", true);
    }

    const { data: manuals, error: manualsError } = await query;

    if (manualsError) {
      console.error("Manuals fetch error:", manualsError);
      return NextResponse.json(
        { error: "マニュアルの取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      manuals: manuals || [],
    });
  } catch (error) {
    console.error("Manuals list error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
