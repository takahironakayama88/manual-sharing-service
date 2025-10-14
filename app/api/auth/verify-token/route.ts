import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * トークン検証API
 * 招待トークンを検証してスタッフ情報を返す
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "トークンが指定されていません" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // usersテーブルからinvite_tokenで検索
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        `
        id,
        user_id,
        display_name,
        language,
        invite_token,
        invite_expires_at,
        is_onboarded,
        organization_id,
        organizations (
          name
        )
      `
      )
      .eq("invite_token", token)
      .single();

    if (userError || !userData) {
      console.error("User fetch error:", userError);
      return NextResponse.json(
        { error: "無効なトークンです" },
        { status: 404 }
      );
    }

    // トークンの有効期限チェック
    if (
      userData.invite_expires_at &&
      new Date(userData.invite_expires_at) < new Date()
    ) {
      return NextResponse.json(
        { error: "トークンの有効期限が切れています" },
        { status: 400 }
      );
    }

    // すでにオンボーディング済みの場合
    if (userData.is_onboarded) {
      return NextResponse.json(
        { error: "このアカウントはすでに登録済みです" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: userData.id,
      displayName: userData.display_name,
      organizationName: (userData.organizations as any).name,
      language: userData.language,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
