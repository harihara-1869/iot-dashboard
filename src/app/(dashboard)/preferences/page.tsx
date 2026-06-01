"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { clearReauth } from "@/lib/hooks/useReauth";

export default function PreferencesPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        clearReauth();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPwSuccess("Password updated. All other sessions have been signed out.");
      } else {
        setPwError(data.error ?? "Password change failed.");
      }
    } catch {
      setPwError("Network error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-[24px] max-w-3xl">
      <div>
        <h2 className="font-sans text-[24px] leading-8 font-semibold text-primary">
          Account Preferences
        </h2>
        <p className="font-sans text-[16px] leading-6 text-on-surface-variant mt-1">
          Your operator profile
        </p>
      </div>

      <section className="bg-surface border border-outline-variant rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold uppercase text-on-surface-variant">
              Email
            </label>
            <p className="font-mono text-[14px] leading-5 font-medium text-on-surface mt-1">
              {user?.email ?? "—"}
            </p>
          </div>
          <div>
            <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold uppercase text-on-surface-variant">
              Operator ID
            </label>
            <p className="font-mono text-[14px] leading-5 font-medium text-on-surface mt-1">
              {user?.operator_id ?? "—"}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface border border-outline-variant rounded-lg p-6">
        <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mb-4">
          Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold uppercase text-on-surface-variant" htmlFor="current-password">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all mt-1"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold uppercase text-on-surface-variant" htmlFor="new-password">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all mt-1"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold uppercase text-on-surface-variant" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all mt-1"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {pwError && (
            <p className="text-error font-mono text-[12px] leading-4 tracking-[0.05em] font-bold">{pwError}</p>
          )}
          {pwSuccess && (
            <p className="text-secondary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold">{pwSuccess}</p>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="h-12 bg-primary text-on-primary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 px-6"
          >
            {pwLoading ? "UPDATING..." : "UPDATE PASSWORD"}
          </button>
        </form>
      </section>

      <section className="bg-surface border border-outline-variant rounded-lg p-6">
        <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mb-4">
          Display
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-outline accent-primary" />
            <span className="font-sans text-[14px] leading-5 text-on-surface">
              Use metric units
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-outline accent-primary" />
            <span className="font-sans text-[14px] leading-5 text-on-surface">
              Auto-refresh telemetry (every 10s)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-outline accent-primary" />
            <span className="font-sans text-[14px] leading-5 text-on-surface">
              Show terminal timestamps
            </span>
          </label>
        </div>
      </section>

      <section className="bg-surface border border-outline-variant rounded-lg p-6">
        <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mb-4">
          Data
        </h3>
        <button
          className="h-12 bg-surface border border-outline text-on-surface font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:bg-surface-container-high active:scale-95 flex items-center justify-center gap-2 px-6"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          Clear Local Cache
        </button>
        <p className="font-sans text-[12px] leading-4 text-on-surface-variant mt-2">
          Clears cached telemetry and settings stored in your browser. Does not affect cloud data.
        </p>
      </section>
    </div>
  );
}
