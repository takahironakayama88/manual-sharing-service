import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";

/**
 * Supabase クライアント（ブラウザ用）
 * クライアントコンポーネントで使用
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
