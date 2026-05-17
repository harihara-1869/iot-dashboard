import type { ReactNode } from "react";

export default function KpiCard({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col border-b-2 border-b-primary-fixed">
      <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase mb-2">
        {label}
      </span>
      <div className="flex items-end justify-between mt-auto">
        <span className="font-sans text-[48px] leading-[56px] tracking-[-0.02em] font-bold text-primary">
          {value}
          {unit && (
            <span className="font-mono text-[20px] leading-7 font-semibold text-on-surface-variant ml-1">
              {unit}
            </span>
          )}
        </span>
        {icon}
      </div>
    </div>
  );
}
