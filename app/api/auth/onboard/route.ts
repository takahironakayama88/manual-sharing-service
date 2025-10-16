import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * オンボーディングAPI
 * スタッフの初回登録処理
 */
export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json();

    // バリデーション
    if (!token || !email || !password) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "パスワードは8文字以上で入力してください" },
        { status: 400 }
      );
    }

    // Admin Client を使用してRLSをバイパス
    const adminClient = createAdminClient();

    // トークンでユーザー情報を取得
    const { data: userData, error: userError } = await adminClient
      .from("users")
      .select("*")
      .eq("invite_token", token)
      .single();

    if (userError || !userData) {
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

    // Supabase Authでユーザー作成（Admin APIを使用）
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // メール確認を自動的に完了
      user_metadata: {
        display_name: userData.display_name,
        user_id: userData.user_id,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: authError.message || "アカウント作成に失敗しました" },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "ユーザー作成に失敗しました" },
        { status: 500 }
      );
    }

    // usersテーブルを更新
    const { error: updateError } = await adminClient
      .from("users")
      .update({
        auth_id: authData.user.id, // Auth IDを設定
        email: email,
        is_onboarded: true,
        invite_token: null, // トークンを無効化
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userData.user_id);

    if (updateError) {
      console.error("User update error:", updateError);
      return NextResponse.json(
        { error: "ユーザー情報の更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "アカウントを作成しました。確認メールをご確認ください。",
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
