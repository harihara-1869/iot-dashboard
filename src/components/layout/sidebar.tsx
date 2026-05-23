"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/nodes", label: "Nodes", icon: "settings_input_component" },
  { href: "/health", label: "Health", icon: "monitor_heart" },
  { href: "/terminal", label: "Terminal", icon: "terminal" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }


  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant bg-surface flex flex-col p-gutter z-50">
      <div className="mb-8 px-4">
        <h1 className="font-sans text-[24px] leading-8 font-semibold font-bold text-primary">
          Control Panel
        </h1>
        <p className="font-sans text-[14px] leading-5 text-on-surface-variant">
          Kinetic Motor Systems
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              replace
              className={`flex items-center gap-3 px-4 py-3 transition-colors active:scale-95 duration-200 rounded-lg ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-sans text-[16px] leading-6">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-outline-variant">
        <div className="flex items-center gap-3 mb-4 px-4">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant">
            <span className="material-symbols-outlined text-primary">
              account_circle
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="font-sans text-[14px] leading-5 font-bold truncate">
              {user?.email ?? "Operator"}
            </p>
            <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant">
              {user?.operator_id ?? "LEVEL 1"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 transition-colors rounded-lg active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-sans text-[16px] leading-6">Logout</span>
        </button>
      </div>
    </aside>
  );
}
