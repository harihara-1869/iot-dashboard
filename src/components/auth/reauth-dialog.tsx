"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { reauth } from "@/lib/hooks/useReauth";

interface Props {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReauthDialog({ open, onSuccess, onCancel }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  if (!open || !user?.email) return null;

  const email = user.email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: reauthError } = await reauth(email, password);

    if (reauthError) {
      setError("Incorrect password.");
      setLoading(false);
    } else {
      setPassword("");
      onSuccess();
    }
  }

  function handleCancel() {
    setPassword("");
    setError("");
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-outline-variant rounded-lg p-6 w-full max-w-sm shadow-2xl">
        <h3 className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold uppercase text-on-surface-variant mb-4">
          Re-authentication Required
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase"
              htmlFor="reauth-password"
            >
              Password
            </label>
            <input
              className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all"
              id="reauth-password"
              type="password"
              placeholder="Enter your password to continue"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          {error && (
            <p className="text-error font-mono text-[12px] leading-4 tracking-[0.05em] font-bold">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 bg-primary text-on-primary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:opacity-90 active:scale-95"
            >
              {loading ? "VERIFYING..." : "CONFIRM"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 h-12 bg-surface border border-outline text-on-surface font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:bg-surface-container-high active:scale-95"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
