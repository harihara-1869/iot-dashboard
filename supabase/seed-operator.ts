/**
 * Seed a test operator with an Argon2id-hashed password.
 *
 * Usage:
 *   npx tsx supabase/seed-operator.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import * as argon2 from "argon2";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_OPERATORS = [
  { email: "operator@kinetic.local", operator_id: "KNS-000001", password: "access-key-123" },
  { email: "admin@kinetic.local", operator_id: "KNS-ADMIN", password: "admin-key-456" },
];

async function seed() {
  for (const op of TEST_OPERATORS) {
    const hash = await argon2.hash(op.password, {
      type: argon2.argon2id,
      timeCost: 10,
      memoryCost: 65536,
      parallelism: 1,
      hashLength: 32,
    });

    const { error } = await supabase.from("operators").upsert({
      id: op.operator_id,
      email: op.email,
      operator_id: op.operator_id,
      argon2_hash: hash,
    });

    if (error) {
      console.error(`Failed to seed ${op.email}:`, error.message);
    } else {
      console.log(`Seeded ${op.email} (${op.operator_id})`);
    }
  }
}

seed()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
