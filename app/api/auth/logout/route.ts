import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * ログアウトAPI
 * Supabaseセッションを終了
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return NextResponse.json(
        { error: "ログアウトに失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "ログアウトしました",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
