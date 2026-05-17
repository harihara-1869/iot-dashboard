import type { SystemHealthService, EdgeNodePing } from "@/lib/types";

export default function DiagnosticsGrid() {
  const services: SystemHealthService[] = [
    { name: "Dashboard Server", service_id: "SERVICE 01", status: "Online", metric: "99.98% SLA" },
    { name: "IOT Server", service_id: "SERVICE 02", status: "Active", metric: "4,102 PKTS/S" },
  ];

  const pings: EdgeNodePing[] = [
    { node_id: "MOT-01-A", latency_ms: 8, status: "good" },
    { node_id: "STP-MR-02", latency_ms: 12, status: "good" },
    { node_id: "STP-CP-03", latency_ms: 42, status: "warning" },
  ];

  return (
    <div className="grid grid-cols-12 gap-gutter mb-8">
      {services.map((s) => (
        <div
          key={s.service_id}
          className="col-span-12 md:col-span-3 bg-surface-container-lowest border border-outline-variant p-6 flex flex-col justify-between min-h-[160px] rounded-lg"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant mb-1">
                {s.service_id}
              </p>
              <h3 className="font-sans text-[24px] leading-8 font-semibold text-primary leading-tight">
                {s.name}
              </h3>
            </div>
            <span className="material-symbols-outlined text-outline">
              {s.name.includes("Dashboard") ? "storage" : "sensors"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary" />
            <span className="font-mono text-[14px] leading-5 font-medium text-secondary uppercase">
              {s.status}
            </span>
            <span className="font-sans text-[14px] leading-5 text-outline ml-auto">
              {s.metric}
            </span>
          </div>
        </div>
      ))}

      <div className="col-span-12 md:col-span-6 bg-surface-container-lowest border border-outline-variant p-6 rounded-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant mb-1">
              NETWORK TOPOLOGY
            </p>
            <h3 className="font-sans text-[24px] leading-8 font-semibold text-primary leading-tight">
              Edge Node Ping Status
            </h3>
          </div>
          <span className="material-symbols-outlined text-outline">router</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {pings.map((p) => {
            const isWarning = p.status === "warning";
            return (
              <div
                key={p.node_id}
                className={`bg-surface p-3 border rounded ${
                  isWarning
                    ? "border-on-tertiary-container/30 bg-tertiary-fixed/10"
                    : "border-outline-variant"
                }`}
              >
                <p
                  className={`font-mono text-[12px] leading-4 tracking-[0.05em] font-bold ${
                    isWarning ? "text-on-tertiary-container" : "text-on-surface-variant"
                  }`}
                >
                  {p.node_id}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`font-mono text-[14px] leading-5 font-medium ${
                      isWarning ? "text-on-tertiary-container" : "text-secondary"
                    }`}
                  >
                    {p.latency_ms}ms
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isWarning
                        ? "bg-on-tertiary-container animate-pulse"
                        : "bg-secondary"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="col-span-12 bg-surface-container-lowest border border-outline-variant p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center border border-outline-variant">
            <span className="material-symbols-outlined text-primary">database</span>
          </div>
          <div>
            <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant">
              PRIMARY CLUSTER
            </p>
            <h3 className="font-sans text-[24px] leading-8 font-semibold text-primary">
              Database Connectivity
            </h3>
          </div>
        </div>
        <div className="flex flex-1 md:justify-center items-center gap-12">
          <Metric label="LATENCY" value="1.2ms" className="text-secondary" />
          <Metric label="POOL USAGE" value="12 / 100" className="text-primary" />
          <div className="text-center">
            <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant mb-1">
              REPLICATION
            </p>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-sm">sync</span>
              <p className="font-mono text-[20px] leading-7 font-semibold text-secondary uppercase">
                Synced
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded font-mono text-[12px] leading-4 tracking-[0.05em] font-bold">
            STABLE
          </span>
          <span className="px-3 py-1 bg-surface-container text-on-surface-variant border border-outline-variant rounded font-mono text-[12px] leading-4 tracking-[0.05em] font-bold">
            READ-WRITE
          </span>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="text-center">
      <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant mb-1">
        {label}
      </p>
      <p className={`font-mono text-[20px] leading-7 font-semibold ${className ?? "text-primary"}`}>
        {value}
      </p>
    </div>
  );
}
