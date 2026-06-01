"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { clearReauth } from "@/lib/hooks/useReauth";
import type { AuthUser } from "@/lib/types";

function userToAuthUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  email_confirmed_at?: string;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    operator_id: user.user_metadata?.operator_id as string | undefined,
    email_confirmed_at: user.email_confirmed_at,
    isVerified: !!user.email_confirmed_at,
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(userToAuthUser(session.user));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(userToAuthUser(session.user));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error.message };
    }

    setUser(userToAuthUser(data.user));
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearReauth();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/confirm?next=/update-password`,
    });
    return { error: error?.message ?? null };
  }, []);

  return { user, loading, signIn, signOut, resetPassword };
}
