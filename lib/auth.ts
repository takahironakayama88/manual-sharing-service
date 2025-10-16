import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 現在ログインしているユーザーの情報を取得
 * Server Component専用
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  // 認証ユーザーを取得
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  // Admin Clientでusersテーブルからユーザー情報を取得
  const adminClient = createAdminClient();
  const { data: userData, error: userError } = await adminClient
    .from("users")
    .select("*")
    .eq("auth_id", authUser.id)
    .single();

  if (userError || !userData) {
    return null;
  }

  return {
    id: userData.id,
    authId: userData.auth_id,
    userId: userData.user_id,
    email: userData.email,
    role: userData.role,
    displayName: userData.display_name,
    language: userData.language,
    organizationId: userData.organization_id,
    isOnboarded: userData.is_onboarded,
  };
}
