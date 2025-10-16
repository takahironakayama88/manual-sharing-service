import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * ログインAPI
 * メールアドレスとパスワードで認証
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        { error: "メールアドレスとパスワードを入力してください" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Supabase Authでログイン
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.error("Login error:", authError);
      return NextResponse.json(
        {
          error:
            authError.message === "Invalid login credentials"
              ? "メールアドレスまたはパスワードが正しくありません"
              : authError.message,
        },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "ログインに失敗しました" },
        { status: 401 }
      );
    }

    // Admin Clientを使用してusersテーブルからユーザー情報を取得（RLSバイパス）
    const adminClient = createAdminClient();
    const { data: userData, error: userError } = await adminClient
      .from("users")
      .select("*")
      .eq("auth_id", authData.user.id)
      .single();

    if (userError || !userData) {
      console.error("User fetch error:", userError);
      return NextResponse.json(
        { error: "ユーザー情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    // レスポンスを作成して、ユーザーの言語設定でCookieを設定
    const response = NextResponse.json({
      success: true,
      message: "ログインしました",
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        isAdmin: userData.is_admin ?? false,
        displayName: userData.display_name,
        organizationId: userData.organization_id,
      },
    });

    // ユーザーの言語設定をCookieに保存
    response.cookies.set("NEXT_LOCALE", userData.language, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1年
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
