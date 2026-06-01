"use client";

import { createClient } from "@/lib/supabase/client";

const FIVE_MINUTES = 5 * 60 * 1000;

let lastReauth: number | null = null;

export function isReauthed(): boolean {
  return lastReauth !== null && Date.now() - lastReauth < FIVE_MINUTES;
}

export async function reauth(email: string, password: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  lastReauth = Date.now();
  return { error: null };
}

export function clearReauth(): void {
  lastReauth = null;
}
