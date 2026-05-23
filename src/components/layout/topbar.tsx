"use client";

import Link from "next/link";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 flex justify-between items-center h-16 px-margin-desktop bg-surface border-b border-outline-variant">
      <div className="flex items-center gap-4">
        <span className="font-sans text-[24px] leading-8 font-semibold font-bold text-primary hidden md:block">
          Industrial Motor Control
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded text-[14px] leading-5 focus:ring-2 focus:ring-primary focus:border-primary outline-none w-64"
            placeholder="Global search..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-all active:opacity-80">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Link
            href="/help"
            className="text-on-surface-variant hover:text-primary transition-all active:opacity-80"
          >
            <span className="material-symbols-outlined">help_outline</span>
          </Link>
          <Link
            href="/preferences"
            className="text-on-surface-variant hover:text-primary transition-all active:opacity-80"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
