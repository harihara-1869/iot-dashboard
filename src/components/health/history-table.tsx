"use client";

import type { DiagnosticsLog } from "@/lib/types";

interface Props {
  logs: DiagnosticsLog[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function HealthHistoryTable({ logs, loading, page, totalPages, onPageChange }: Props) {
  function exportCSV() {
    if (logs.length === 0) return;
    const header = "timestamp,check_type,result,performance,operator,node_id\n";
    const rows = logs
      .map((l) =>
        [
          new Date(l.timestamp).toISOString().replace("T", " ").slice(0, 19),
          `"${l.check_type}"`,
          l.result,
          `"${l.performance}"`,
          l.operator,
          l.node_id ?? "",
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnostics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      suppressHydrationWarning
      className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
        <h3 className="font-sans text-[24px] leading-8 font-semibold text-primary">System Health History</h3>
        <button
          onClick={exportCSV}
          className="px-4 py-1.5 border border-outline-variant rounded text-[14px] leading-5 font-medium hover:bg-surface-container transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant">
            <tr>
              <th className="px-6 py-3 border-b border-outline-variant font-bold">TIMESTAMP (UTC)</th>
              <th className="px-6 py-3 border-b border-outline-variant font-bold">CHECK TYPE</th>
              <th className="px-6 py-3 border-b border-outline-variant font-bold">RESULT</th>
              <th className="px-6 py-3 border-b border-outline-variant font-bold">PERFORMANCE</th>
              <th className="px-6 py-3 border-b border-outline-variant font-bold">OPERATOR</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[14px] leading-5 font-medium">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                  No diagnostic logs found. Run a system diagnostic to populate data.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container transition-colors border-b border-outline-variant">
                  <td className="px-6 py-4 text-on-surface-variant">
                    {new Date(log.timestamp).toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="px-6 py-4 font-bold">{log.check_type}</td>
                  <td className="px-6 py-4">
                    {log.result === "SUCCESS" ? (
                      <span className="flex items-center gap-2 text-secondary">
                        <span className="material-symbols-outlined text-sm">check_circle</span> SUCCESS
                      </span>
                    ) : log.result === "WARNING" ? (
                      <span className="flex items-center gap-2 text-on-tertiary-container">
                        <span className="material-symbols-outlined text-sm">warning</span> WARNING
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-error">
                        <span className="material-symbols-outlined text-sm">error</span> ERROR
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{log.performance}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{log.operator}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
        <span className="font-sans text-[14px] leading-5 text-on-surface-variant">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded bg-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={page <= 1}
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded bg-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={page >= totalPages}
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  );
}
