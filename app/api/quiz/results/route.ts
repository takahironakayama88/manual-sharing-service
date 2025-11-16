import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * 理解度テスト結果取得API
 * 管理者が組織内のスタッフのテスト結果を閲覧
 */
export async function GET(request: NextRequest) {
  try {
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
      .select("id, organization_id, role")
      .eq("auth_id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "ユーザー情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    // 管理者権限チェック
    if (userData.role !== "admin" && userData.role !== "area_manager") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      );
    }

    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const manualId = searchParams.get("manualId");
    const userId = searchParams.get("userId");

    // まず組織内のユーザーIDを取得
    const { data: orgUsers, error: orgUsersError } = await adminClient
      .from("users")
      .select("id")
      .eq("organization_id", userData.organization_id);

    if (orgUsersError) {
      console.error("Organization users fetch error:", orgUsersError);
      return NextResponse.json(
        { error: "組織ユーザーの取得に失敗しました" },
        { status: 500 }
      );
    }

    const orgUserIds = orgUsers?.map(u => u.id) || [];

    if (orgUserIds.length === 0) {
      // 組織にユーザーがいない場合は空配列を返す
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    // 組織内のテストセッションを取得
    let query = adminClient
      .from("quiz_sessions")
      .select(`
        *,
        user:users!quiz_sessions_user_id_fkey(id, display_name, email),
        manual:manuals!quiz_sessions_manual_id_fkey(id, title)
      `)
      .in("user_id", orgUserIds)
      .order("completed_at", { ascending: false });

    // フィルタリング
    if (manualId) {
      query = query.eq("manual_id", manualId);
    }
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: sessions, error: sessionsError } = await query;

    if (sessionsError) {
      console.error("Sessions fetch error:", sessionsError);
      return NextResponse.json(
        { error: "テスト結果の取得に失敗しました" },
        { status: 500 }
      );
    }

    // セッションごとの統計情報を整形
    const results = sessions?.map((session: any) => ({
      sessionId: session.id,
      userName: session.user?.display_name || "不明",
      userEmail: session.user?.email || "",
      manualTitle: session.manual?.title || "不明",
      score: session.score,
      totalQuestions: session.total_questions,
      percentage: session.percentage,
      completedAt: session.completed_at,
    })) || [];

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Quiz results fetch error:", error);
    return NextResponse.json(
      { error: "テスト結果の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
