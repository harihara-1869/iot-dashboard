/**
 * Next.js instrumentation — runs once at server startup.
 * Checks that Supabase tables exist.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { createClient } = await import("@supabase/supabase-js");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    );

    const { error } = await supabase
      .from("motor_nodes")
      .select("id")
      .limit(1);

    if (error) {
      console.warn("\n⚠  Supabase tables not found. Run the SQL setup:");
      console.warn("   1. Go to https://supabase.com/dashboard/project/_/sql/new");
      console.warn("   2. Run supabase/schema.sql");
      console.warn("   3. Run supabase/rpc.sql");
      console.warn("   4. Run: npx tsx supabase/seed.ts\n");
    } else {
      console.log("✅ Supabase tables verified — DB is ready.");
    }
  }
}
