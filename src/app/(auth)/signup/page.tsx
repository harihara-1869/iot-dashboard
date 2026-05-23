"use client";

import { useState } from "react";
import Link from "next/link";
import { IMAGES } from "@/lib/images";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, operator_id: operatorId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }

    setSuccess(data.message ?? "Account created successfully");
    setLoading(false);
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
              Operator
              <br />
              Registration
            </h2>
            <p className="text-surface-variant font-sans text-[16px] leading-6 opacity-80 uppercase tracking-widest">
              Request system access credentials
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
                New Operator
              </p>
              <h2 className="font-sans text-[24px] leading-8 font-semibold text-primary uppercase">
                Request Access
              </h2>
            </div>

            {success ? (
              <div className="space-y-6">
                <div className="flex items-start gap-3 bg-success/10 border border-success/30 p-4 rounded">
                  <span className="material-symbols-outlined text-success text-[28px]">
                    check_circle
                  </span>
                  <p className="font-sans text-[14px] leading-5 text-success">
                    {success}
                  </p>
                </div>
                <Link
                  href="/login"
                  className="w-full h-12 bg-primary text-on-primary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                >
                  RETURN TO LOGIN
                  <span className="material-symbols-outlined text-[18px]">login</span>
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

                <div className="space-y-2">
                  <label
                    className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase"
                    htmlFor="operator-id"
                  >
                    Operator ID
                  </label>
                  <input
                    className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all"
                    id="operator-id"
                    name="operator-id"
                    placeholder="KNS-000000"
                    type="text"
                    value={operatorId}
                    onChange={(e) => setOperatorId(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all"
                    id="password"
                    name="password"
                    placeholder="Min 8 characters"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase"
                    htmlFor="confirm-password"
                  >
                    Confirm Password
                  </label>
                  <input
                    className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all"
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="Re-enter password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
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
                  {loading ? "REGISTERING..." : "REGISTER"}
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                    person_add
                  </span>
                </button>
              </form>
            )}

            {!success && (
              <div className="mt-8 pt-8 border-t border-outline-variant">
                <Link
                  href="/login"
                  className="font-sans text-[14px] leading-5 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
