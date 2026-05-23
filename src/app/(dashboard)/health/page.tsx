"use client";

import { useState, useMemo, useCallback } from "react";
import { useDiagnosticsLogs, useMotorNodes } from "@/lib/hooks/useSupabase";
import DiagnosticsGrid from "@/components/health/diagnostics-grid";
import HealthHistoryTable from "@/components/health/history-table";

export default function HealthPage() {
  const [page, setPage] = useState(1);
  const [running, setRunning] = useState(false);
  const { nodes, loading: nodesLoading } = useMotorNodes();
  const { logs, totalPages, loading: logsLoading, refetch } = useDiagnosticsLogs(page, 10);

  const statusText = useMemo(() => {
    const latest = logs[0];
    if (!latest) return "SYSTEM OPERATIONAL: NOMINAL";
    if (latest.result === "ERROR") return "SYSTEM DEGRADED";
    if (latest.result === "WARNING") return "SYSTEM WARNING";
    return "SYSTEM OPERATIONAL: NOMINAL";
  }, [logs]);

  const runDiagnostics = useCallback(async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/diagnostics/run", { method: "POST" });
      if (res.ok) {
        await refetch();
      }
    } catch (e) {
      console.error("Diagnostics run failed:", e);
    } finally {
      setRunning(false);
    }
  }, [refetch]);

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <nav className="flex gap-2 mb-2">
            <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant">SYSTEM</span>
            <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-outline">/</span>
            <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-primary">DIAGNOSTICS</span>
          </nav>
          <h2 className="font-sans text-[48px] leading-[56px] tracking-[-0.02em] font-bold text-primary">System Health Diagnostics</h2>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={running}
          className="bg-primary text-on-primary px-8 py-3 rounded-lg flex items-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-sm border-b-2 border-primary-container disabled:opacity-50"
        >
          <span className="material-symbols-outlined" style={running ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            {running ? "sync" : "play_arrow"}
          </span>
          <span className="font-sans text-[16px] leading-6 font-bold">
            {running ? "RUNNING..." : "Run System Diagnostics"}
          </span>
        </button>
      </div>

      <div className="mb-8 rounded-xl border border-outline-variant overflow-hidden relative">
        <div className="lava-flow absolute inset-0 opacity-20" />
        <div className="relative glass-effect p-gutter flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-4">
            <div
              className={`w-4 h-4 rounded-full shadow-[0_0_12px_#82f5c1] status-pulse ${
                statusText.includes("DEGRADED") ? "bg-error" : statusText.includes("WARNING") ? "bg-on-tertiary-container" : "bg-secondary"
              }`}
            />
            <span
              className={`font-mono text-[20px] leading-7 font-semibold ${
                statusText.includes("DEGRADED") ? "text-error" : statusText.includes("WARNING") ? "text-on-tertiary-container" : "text-secondary"
              }`}
            >
              {statusText}
            </span>
          </div>
          <div className="text-right">
            <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant">NODES</p>
            <p className="font-mono text-[14px] leading-5 font-medium">{nodesLoading ? "—" : nodes.length}</p>
          </div>
        </div>
      </div>

      <DiagnosticsGrid logs={logs} />
      <HealthHistoryTable
        logs={logs}
        loading={logsLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
