import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * スタッフ作成API
 * 管理者がスタッフを追加し、招待トークンを生成
 */
export async function POST(request: NextRequest) {
  try {
    const { displayName, language, role } = await request.json();

    // バリデーション
    if (!displayName || !language || !role) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

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
        { error: "スタッフを作成する権限がありません" },
        { status: 403 }
      );
    }

    // 招待トークンを生成（ランダムな32文字の16進数文字列）
    const inviteToken = randomBytes(16).toString("hex");

    // 有効期限を7日後に設定
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // user_idを生成
    const userId = `staff_${Date.now().toString().slice(-6)}`;

    // usersテーブルにスタッフを仮登録
    const { data: newStaff, error: insertError } = await adminClient
      .from("users")
      .insert({
        user_id: userId,
        display_name: displayName,
        language: language,
        role: role,
        organization_id: adminData.organization_id,
        invite_token: inviteToken,
        invite_expires_at: expiresAt.toISOString(),
        is_onboarded: false,
        email: null, // オンボーディング時に設定
      })
      .select()
      .single();

    if (insertError) {
      console.error("Staff insert error:", insertError);
      return NextResponse.json(
        { error: "スタッフの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "スタッフを作成しました",
      staff: {
        id: newStaff.id,
        user_id: newStaff.user_id,
        display_name: newStaff.display_name,
        invite_token: newStaff.invite_token,
        invite_expires_at: newStaff.invite_expires_at,
      },
    });
  } catch (error) {
    console.error("Staff creation error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
