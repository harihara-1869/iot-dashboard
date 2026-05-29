"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-0">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-8 shadow-2xl mx-auto my-16">
        <div className="mb-8 space-y-2">
          <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase tracking-widest">
            Account Recovery
          </p>
          <h2 className="font-sans text-[24px] leading-8 font-semibold text-primary uppercase">
            Reset Password
          </h2>
        </div>

        {sent ? (
          <div className="space-y-6">
            <p className="font-sans text-[16px] leading-6 text-on-surface">
              If an account exists for <span className="font-mono text-primary">{email}</span>, a password reset link has been sent.
            </p>
            <p className="font-sans text-[14px] leading-5 text-on-surface-variant">
              Check your inbox and follow the link to choose a new password.
            </p>
            <Link
              href="/login"
              className="w-full h-14 bg-surface border border-outline text-on-surface font-mono text-[12px] leading-4 tracking-[0.05em] font-bold py-4 transition-all hover:bg-surface-container-high active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              RETURN TO LOGIN
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all"
                id="email"
                name="email"
                placeholder="operator@kinetic.local"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "SENDING..." : "SEND RESET LINK"}
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>

            <Link
              href="/login"
              className="font-sans text-[14px] leading-5 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
