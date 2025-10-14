import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

/**
 * Supabase Admin クライアント（Service Role Key使用）
 * RLSをバイパスして管理操作を実行
 * ⚠️ サーバーサイドでのみ使用すること
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables for admin client"
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
