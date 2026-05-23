"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export default function ContactPage() {
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
            Contact
          </h2>
          <p className="font-sans text-[16px] leading-6 text-on-surface-variant mt-1">
            Reach the team behind this project
          </p>
        </div>

        <section className="bg-surface border border-outline-variant rounded-lg p-6">
          <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mb-4">
            R.V. College of Engineering
          </h3>
          <div className="space-y-4 font-sans text-[14px] leading-5 text-on-surface-variant">
            <p>
              Department of Electronics &amp; Instrumentation Engineering<br />
              R.V. College of Engineering<br />
              Mysuru Road, R.V. Vidyaniketan Post<br />
              Bengaluru &mdash; 560 059, Karnataka
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">call</span>
                <a href="tel:+918028667148" className="text-primary hover:underline font-mono text-[14px] leading-5">
                  +91-80-2866-7148
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">mail</span>
                <a href="mailto:principal@rvce.edu.in" className="text-primary hover:underline font-mono text-[14px] leading-5">
                  principal@rvce.edu.in
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface border border-outline-variant rounded-lg p-6">
          <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mb-4">
            Project Administration
          </h3>
          <p className="font-sans text-[14px] leading-5 text-on-surface-variant">
            For issues related to this dashboard, sensor nodes, or data access, contact
            the course instructor or lab supervisor for the IoT / Embedded Lab (4th Semester).
          </p>
        </section>
      </main>
    </div>
  );
}
