"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { IMAGES } from "@/lib/images";

export const dynamic = "force-dynamic";

function initialError(params: URLSearchParams): string {
  const e = params.get("error");
  if (e === "email_unconfirmed") return "Please confirm your email before logging in. Check your inbox.";
  if (e === "confirmation_failed") return "Email confirmation failed. Please try signing up again.";
  return "";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const [error, setError] = useState(() => initialError(searchParams));
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError("Authentication failed. Check your credentials.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-0">
      <div className="grid lg:grid-cols-2 w-full min-h-screen">
        <div className="hidden lg:flex relative overflow-hidden bg-primary items-center justify-center">
          <img
            alt="Industrial Motor"
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
            src={IMAGES.hero}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 to-transparent" />
          <div className="relative z-10 p-12 space-y-4 max-w-xl">
            <div className="w-12 h-1 w-24 bg-secondary mb-8" />
            <h2 className="text-white font-sans text-[48px] leading-[56px] tracking-[-0.02em] font-bold uppercase leading-tight">
              Precision Engineering
              <br />
              Industrial Control
            </h2>
            <p className="text-surface-variant font-sans text-[16px] leading-6 opacity-80 uppercase tracking-widest">
              System Node: KNS-ALPHA-01
            </p>
          </div>
          <div className="absolute bottom-8 left-8 flex gap-4">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-secondary/40 rounded-full" />
            <div className="w-2 h-2 bg-secondary/40 rounded-full" />
          </div>
        </div>

        <div className="flex items-center justify-center p-margin-mobile bg-surface-dim technical-grid">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-8 shadow-2xl">
            <div className="mb-8 space-y-2">
              <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase tracking-widest">
                System Access
              </p>
              <h2 className="font-sans text-[24px] leading-8 font-semibold text-primary uppercase">
                Authorized Personnel Only
              </h2>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="relative">
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
              </div>

              <div className="space-y-2">
                <label
                  className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-error font-mono text-[12px] leading-4 tracking-[0.05em] font-bold">
                  {error}
                </p>
              )}

              <button
                className="w-full h-14 bg-primary text-on-primary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold py-4 transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 group"
                type="submit"
                disabled={loading}
              >
                {loading ? "AUTHENTICATING..." : "LOG IN"}
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                  login
                </span>
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-outline-variant flex flex-col gap-4">
              <Link
                href="/forgot-password"
                className="font-sans text-[14px] leading-5 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                Forgot Password
              </Link>
              <Link
                href="/signup"
                className="font-sans text-[14px] leading-5 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
