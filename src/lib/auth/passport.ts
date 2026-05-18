import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword, dummyVerify } from "./password";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Operator {
  id: string;
  email: string;
  operator_id: string;
}

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      const { data: operator, error } = await supabase
        .from("operators")
        .select("id, email, operator_id, argon2_hash")
        .eq("email", email)
        .maybeSingle();

      if (error || !operator) {
        await dummyVerify();
        return done(null, false, { message: "Invalid credentials" });
      }

      const valid = await verifyPassword(operator.argon2_hash, password);

      if (!valid) {
        return done(null, false, { message: "Invalid credentials" });
      }

      return done(null, {
        id: operator.id,
        email: operator.email,
        operator_id: operator.operator_id,
      });
    }
  )
);

export function authenticate(
  email: string,
  password: string
): Promise<Operator> {
  return new Promise((resolve, reject) => {
    passport.authenticate("local", (err: Error | null, user: Operator | false) => {
      if (err) return reject(err);
      if (!user) return reject(new Error("Invalid credentials"));
      resolve(user);
    })({ body: { email, password } });
  });
}

export default passport;
