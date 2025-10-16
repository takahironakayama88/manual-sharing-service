import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkTables() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("Checking manual_translations table...\n");

  // Check if table exists by trying to select from it
  const { data, error } = await supabase
    .from("manual_translations")
    .select("*")
    .limit(1);

  if (error) {
    console.error("❌ Error accessing manual_translations table:");
    console.error(error.message);
    console.error("\nThe table probably doesn't exist yet.");
    console.error("\n📋 Please run the SQL migration:");
    console.error("   File: supabase/fix-translation-tables.sql");
    console.error("   Location: Supabase Dashboard > SQL Editor");
  } else {
    console.log("✅ manual_translations table exists!");
    console.log(`   Found ${data?.length || 0} translation(s)`);

    if (data && data.length > 0) {
      console.log("\nSample data:");
      console.log(JSON.stringify(data[0], null, 2));
    }
  }

  // Also check if RLS is enabled
  const { data: policies, error: policyError } = await supabase.rpc(
    "exec",
    {
      sql: `
        SELECT tablename, policyname
        FROM pg_policies
        WHERE tablename = 'manual_translations';
      `,
    }
  ).catch(() => ({ data: null, error: null }));

  if (policies && policies.length > 0) {
    console.log("\n✅ RLS Policies found:");
    policies.forEach((p: any) => console.log(`   - ${p.policyname}`));
  }
}

checkTables();
