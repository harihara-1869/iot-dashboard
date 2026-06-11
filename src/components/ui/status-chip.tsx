import type { MotorStatus } from "@/lib/types";

const statusStyles: Record<MotorStatus, { bg: string; text: string; border: string }> = {
  Active: {
    bg: "bg-secondary-container/30",
    text: "text-on-secondary-fixed",
    border: "border-secondary-container",
  },
  Idle: {
    bg: "bg-surface-dim",
    text: "text-on-surface-variant",
    border: "border-outline-variant",
  },
  Maintenance: {
    bg: "bg-error/10",
    text: "text-error",
    border: "border-error/20",
  },
  Offline: {
    bg: "bg-surface-dim",
    text: "text-on-surface-variant",
    border: "border-outline-variant",
  },
};

export default function StatusChip({ status }: { status: MotorStatus }) {
  const style = statusStyles[status] ?? statusStyles.Offline;
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full font-mono text-[12px] leading-4 tracking-[0.05em] font-bold border ${style.bg} ${style.text} ${style.border}`}
    >
      {status === "Maintenance" ? "Maintenance" : status}
    </span>
  );
}
