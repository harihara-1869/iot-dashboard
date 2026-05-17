import type { ReactNode } from "react";

export default function GlassPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`backdrop-blur-[12px] bg-white/70 border border-white/50 ${className}`}
    >
      {children}
    </div>
  );
}
