import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * サインアップAPI
 * 新規組織と管理者アカウントを作成
 */
export async function POST(request: NextRequest) {
  try {
    const { organizationName, adminName, email, password } =
      await request.json();

    // バリデーション
    if (!organizationName || !adminName || !email || !password) {
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

    // Admin Client（RLSバイパス）を使用
    const supabase = createAdminClient();

    // 1. Supabase Authでユーザー作成
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // メール確認が必要
      user_metadata: {
        display_name: adminName,
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

    // 2. 組織を作成
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: organizationName,
        plan: "free",
      })
      .select()
      .single();

    if (orgError) {
      console.error("Organization creation error:", orgError);
      // ユーザーは作成されたがorganization作成失敗
      // 本来はトランザクション処理が必要
      return NextResponse.json(
        { error: "組織の作成に失敗しました" },
        { status: 500 }
      );
    }

    // 3. usersテーブルに管理者を追加
    const userId = `admin_${Date.now().toString().slice(-6)}`;

    const { error: userError } = await supabase.from("users").insert({
      auth_id: authData.user.id, // Supabase Auth IDを設定
      user_id: userId,
      email: email,
      role: "admin",
      display_name: adminName,
      language: "ja",
      organization_id: orgData.id,
      is_onboarded: true,
    });

    if (userError) {
      console.error("User table insert error:", userError);
      return NextResponse.json(
        { error: "ユーザー情報の保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "アカウントを作成しました。確認メールをご確認ください。",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        organizationId: orgData.id,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
