import type { MotorStatus } from "@/lib/types";

const statusStyles: Record<MotorStatus, { bg: string; text: string; border: string }> = {
  Active: {
    bg: "bg-secondary/10",
    text: "text-on-secondary-container",
    border: "border-secondary/20",
  },
  Idle: {
    bg: "bg-on-tertiary-container/10",
    text: "text-on-tertiary-container",
    border: "border-on-tertiary-container/20",
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
      className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
    >
      {status === "Maintenance" ? "Maintenance Required" : status}
    </span>
  );
}
