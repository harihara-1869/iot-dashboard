"use client";

const severityColors: Record<string, { gradient: string; blur: string }> = {
  good: {
    gradient: "from-secondary-container via-secondary to-secondary-fixed",
    blur: "bg-secondary",
  },
  warning: {
    gradient: "from-amber-200 via-amber-400 to-amber-600",
    blur: "bg-amber-400",
  },
  degraded: {
    gradient: "from-orange-200 via-orange-400 to-orange-600",
    blur: "bg-orange-400",
  },
  critical: {
    gradient: "from-red-200 via-red-400 to-red-600",
    blur: "bg-red-400",
  },
};

export default function FluidStatus({
  status = "Good",
  message = "System operating within optimal parameters.",
  severity,
}: {
  status?: string;
  message?: string;
  severity?: "good" | "warning" | "degraded" | "critical";
}) {
  const colors = severityColors[severity ?? "good"];

  return (
    <section className="flex flex-col items-center justify-center p-[48px] min-h-[500px] relative">
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className={`absolute inset-[-12px] rounded-full bg-gradient-to-tr ${colors.gradient} bg-[length:200%_200%] animate-[fluid_5s_ease_infinite] blur-xl opacity-80`} />
          <div className={`absolute inset-[-4px] rounded-full bg-gradient-to-tr ${colors.gradient} bg-[length:200%_200%] animate-[fluid_5s_ease_infinite]`} />
          <div className="relative w-full h-full bg-surface-container-lowest rounded-full flex items-center justify-center z-10">
            <span className={`font-sans text-[48px] leading-[56px] tracking-[-0.02em] font-bold ${
              severity === "critical" ? "text-red-600" :
              severity === "degraded" ? "text-orange-600" :
              severity === "warning" ? "text-amber-600" :
              "text-primary"
            }`}>
              {status}
            </span>
          </div>
        </div>
        <p className="font-mono text-[14px] leading-5 font-medium text-on-surface-variant mt-8 uppercase tracking-widest text-center max-w-xs">
          {message}
        </p>
      </div>
    </section>
  );
}
