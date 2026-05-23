"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export default function PrivacyPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex justify-between items-center h-16 px-margin-desktop bg-surface border-b border-outline-variant">
        <Link href="/" className="font-sans text-[24px] leading-8 font-semibold font-bold text-primary">
          Control Panel
        </Link>
        {!loading && (
          <Link
            href={user ? "/dashboard" : "/login"}
            className="h-10 bg-primary text-on-primary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 px-6"
          >
            {user ? "Dashboard" : "Login"}
          </Link>
        )}
      </header>

      <main className="flex-1 p-margin-desktop max-w-3xl mx-auto w-full flex flex-col gap-[24px]">
        <div>
          <h2 className="font-sans text-[24px] leading-8 font-semibold text-primary">
            Privacy Policy
          </h2>
          <p className="font-sans text-[16px] leading-6 text-on-surface-variant mt-1">
            How we handle your data
          </p>
        </div>

        <section className="bg-surface border border-outline-variant rounded-lg p-6 space-y-4 font-sans text-[14px] leading-5 text-on-surface-variant">
          <div className="flex items-start gap-3 p-4 bg-surface-container-lowest border border-outline-variant rounded-lg">
            <span className="material-symbols-outlined text-secondary text-[24px] mt-0.5 flex-shrink-0">
              school
            </span>
            <p className="text-on-surface">
              This application is a <strong>college academic project</strong> developed as
              part of the Internet of Things / Embedded Laboratory coursework at R.V. College
              of Engineering, Bengaluru. It is not a commercial product.
            </p>
          </div>

          <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mt-6">
            Data Collection
          </h3>
          <p>
            The dashboard collects basic account information (email address and operator
            identifier) for authentication purposes, along with telemetry data from
            connected sensor nodes (vibration, temperature, current, voltage, power
            quality metrics). All data is stored in a Supabase project instance used
            exclusively for academic evaluation.
          </p>

          <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mt-6">
            Data Usage
          </h3>
          <p>
            No data collected through this dashboard is sold, shared with third parties,
            or used for commercial purposes. Data is retained only for the duration of
            the academic project and may be wiped after evaluation.
          </p>

          <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mt-6">
            Disclaimer
          </h3>
          <div className="flex items-start gap-3 p-4 bg-error/5 border border-error/20 rounded-lg">
            <span className="material-symbols-outlined text-error text-[24px] mt-0.5 flex-shrink-0">
              warning
            </span>
            <p className="text-error">
              <strong>Safety is not guaranteed.</strong> This is a research prototype.
              The authentication, data storage, and hardware control mechanisms have
              not been audited for production security. Do not use this system for
              safety-critical or life-safety applications. The authors and R.V. College
              of Engineering assume no liability for any damages or data loss arising
              from use of this software.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
