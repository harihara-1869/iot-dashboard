import { useMemo } from "react";
import type { DiagnosticsLog } from "@/lib/types";

interface Props {
  logs: DiagnosticsLog[];
}

function parseMs(perf: string): number | null {
  const match = perf.match(/(\d+)ms/);
  return match ? parseInt(match[1], 10) : null;
}

export default function DiagnosticsGrid({ logs }: Props) {
  const summary = useMemo(() => {
    if (logs.length === 0) return null;

    const dbCheck = logs.find((l) => l.check_type === "Database");
    const deviceLogs = logs.filter((l) => l.check_type.startsWith("Device:"));

    const latestByNode: Record<string, DiagnosticsLog> = {};
    for (const l of deviceLogs) {
      const key = l.node_id ?? l.check_type;
      if (!latestByNode[key]) {
        latestByNode[key] = l;
      }
    }

    const pings = Object.values(latestByNode);
    const pingsWithLatency = pings
      .map((p) => ({ ...p, ms: parseMs(p.performance) }))
      .filter((p) => p.ms != null);

    const avgLatency = pingsWithLatency.length > 0
      ? Math.round(pingsWithLatency.reduce((sum, p) => sum + (p.ms ?? 0), 0) / pingsWithLatency.length)
      : null;

    const slowPings = pingsWithLatency.filter((p) => (p.ms ?? 0) > 500);
    const dbLatencyMs = dbCheck ? parseMs(dbCheck.performance) : null;

    return { dbCheck, dbLatencyMs, pings, pingsWithLatency, avgLatency, slowPings };
  }, [logs]);

  if (!summary) {
    return (
      <p className="text-on-surface-variant font-mono text-[14px] mb-8">
        Run system diagnostics to check infrastructure health.
      </p>
    );
  }

  const { dbCheck, dbLatencyMs, pingsWithLatency, avgLatency, slowPings } = summary;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Server */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
        <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant mb-1">
          SERVER
        </p>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
          <span className="font-sans text-[16px] leading-6 font-semibold text-on-surface">Online</span>
        </div>
        <p className="font-sans text-[14px] leading-5 text-on-surface-variant">
          Deployed on Vercel from GitHub
        </p>
      </div>

      {/* Database */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
        <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant mb-1">
          DATABASE
        </p>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2.5 h-2.5 rounded-full ${dbCheck?.result === "SUCCESS" ? "bg-secondary" : dbCheck?.result === "WARNING" ? "bg-on-tertiary-container" : "bg-error"}`} />
          <span className="font-sans text-[16px] leading-6 font-semibold text-on-surface">Supabase</span>
        </div>
        <p className="font-sans text-[14px] leading-5 text-on-surface-variant">
          {dbLatencyMs != null ? `${dbLatencyMs}ms` : "—"}
        </p>
      </div>

      {/* Edge Pings */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
        <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant mb-1">
          EDGE PINGS
        </p>
        <div className="flex items-center gap-2 mb-1">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              pingsWithLatency.length === 0 ? "bg-outline" : slowPings.length > 0 ? "bg-on-tertiary-container" : "bg-secondary"
            }`}
          />
          <span className="font-sans text-[16px] leading-6 font-semibold text-on-surface">
            {pingsWithLatency.length === 0
              ? "No devices"
              : `Avg ${avgLatency}ms`}
          </span>
        </div>
        <p className="font-sans text-[14px] leading-5 text-on-surface-variant">
          {pingsWithLatency.length === 0
            ? "No IoT devices registered"
            : `${pingsWithLatency.length} device${pingsWithLatency.length !== 1 ? "s" : ""} pinged`}
        </p>

        {slowPings.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {slowPings.map((p) => (
              <div key={p.id} className="flex items-center gap-1.5 text-on-tertiary-container">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold">
                  {p.check_type.replace("Device: ", "")} — {p.ms}ms
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
