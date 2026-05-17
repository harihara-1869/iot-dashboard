import type { DiagnosticsLog } from "@/lib/types";

const logs: DiagnosticsLog[] = [
  {
    id: "1",
    timestamp: "2023-10-24 14:30:12",
    check_type: "Full System Diagnostics",
    result: "SUCCESS",
    performance: "All services nominal",
    operator: "SYSTEM_AUTO",
    node_id: null,
  },
  {
    id: "2",
    timestamp: "2023-10-24 12:00:01",
    check_type: "Edge Node Ping",
    result: "WARNING",
    performance: "STP-CP-03 Latency > 100ms",
    operator: "SYSTEM_AUTO",
    node_id: null,
  },
  {
    id: "3",
    timestamp: "2023-10-24 08:00:00",
    check_type: "Full System Diagnostics",
    result: "SUCCESS",
    performance: "All services nominal",
    operator: "OP_042",
    node_id: null,
  },
  {
    id: "4",
    timestamp: "2023-10-23 20:00:45",
    check_type: "DB Integrity Check",
    result: "SUCCESS",
    performance: "0 corrupted blocks",
    operator: "SYSTEM_AUTO",
    node_id: null,
  },
  {
    id: "5",
    timestamp: "2023-10-23 16:15:33",
    check_type: "IOT Server Heartbeat",
    result: "SUCCESS",
    performance: "Uptime reset confirmed",
    operator: "OP_088",
    node_id: null,
  },
];

export default function HealthHistoryTable() {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
        <h3 className="font-sans text-[24px] leading-8 font-semibold text-primary">
          System Health History
        </h3>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 border border-outline-variant rounded text-[14px] leading-5 font-medium hover:bg-surface-container transition-colors">
            Export CSV
          </button>
          <button className="px-4 py-1.5 border border-outline-variant rounded text-[14px] leading-5 font-medium hover:bg-surface-container transition-colors">
            Filter
          </button>
        </div>
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
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-surface-container transition-colors border-b border-outline-variant"
              >
                <td className="px-6 py-4 text-on-surface-variant">{log.timestamp}</td>
                <td className="px-6 py-4 font-bold">{log.check_type}</td>
                <td className="px-6 py-4">
                  <ResultBadge result={log.result} />
                </td>
                <td className="px-6 py-4">{log.performance}</td>
                <td className="px-6 py-4 text-on-surface-variant">{log.operator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
        <span className="font-sans text-[14px] leading-5 text-on-surface-variant">
          Showing 5 of 1,248 history entries
        </span>
        <div className="flex gap-1">
          <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded bg-surface hover:bg-surface-container">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded bg-primary text-on-primary font-sans text-[14px] leading-5">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded bg-surface hover:bg-surface-container font-sans text-[14px] leading-5">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded bg-surface hover:bg-surface-container font-sans text-[14px] leading-5">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded bg-surface hover:bg-surface-container">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function ResultBadge({ result }: { result: DiagnosticsLog["result"] }) {
  if (result === "SUCCESS") {
    return (
      <span className="flex items-center gap-2 text-secondary">
        <span className="material-symbols-outlined text-sm">check_circle</span>
        SUCCESS
      </span>
    );
  }
  if (result === "WARNING") {
    return (
      <span className="flex items-center gap-2 text-on-tertiary-container">
        <span className="material-symbols-outlined text-sm">warning</span>
        WARNING
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 text-error">
      <span className="material-symbols-outlined text-sm">error</span>
      ERROR
    </span>
  );
}
