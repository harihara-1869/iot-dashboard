"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-0">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-8 shadow-2xl mx-auto my-16">
        <div className="mb-8 space-y-2">
          <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase tracking-widest">
            Security
          </p>
          <h2 className="font-sans text-[24px] leading-8 font-semibold text-primary uppercase">
            Update Password
          </h2>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase"
              htmlFor="password"
            >
              New Password
            </label>
            <input
              className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all"
              id="password"
              name="password"
              placeholder="Min. 8 characters"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase"
              htmlFor="confirm"
            >
              Confirm Password
            </label>
            <input
              className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all"
              id="confirm"
              name="confirm"
              placeholder="Re-enter password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-error font-mono text-[12px] leading-4 tracking-[0.05em] font-bold">
              {error}
            </p>
          )}

          <button
            className="w-full h-14 bg-primary text-on-primary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold py-4 transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
            type="submit"
            disabled={loading}
          >
            {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
          </button>
        </form>
      </div>
    </div>
  );
}
