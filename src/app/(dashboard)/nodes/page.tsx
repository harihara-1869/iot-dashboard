"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMotorNodes } from "@/lib/hooks/useSupabase";
import FilterBar from "@/components/nodes/filter-bar";
import DeviceCard from "@/components/nodes/device-card";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-secondary",
  Idle: "bg-on-surface-variant",
  Maintenance: "bg-error",
  Offline: "bg-outline",
};

const STATUS_LABELS: Record<string, string> = {
  Active: "Active",
  Idle: "Idle",
  Maintenance: "Maintenance",
  Offline: "Offline",
};

export default function NodesPage() {
  const router = useRouter();
  const { nodes, loading, refetch } = useMotorNodes();

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { Active: 0, Idle: 0, Maintenance: 0, Offline: 0 };
    for (const n of nodes) {
      counts[n.status] = (counts[n.status] ?? 0) + 1;
    }
    return counts;
  }, [nodes]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of nodes) {
      counts[n.type] = (counts[n.type] ?? 0) + 1;
    }
    return counts;
  }, [nodes]);

  const criticalNodes = useMemo(
    () => nodes.filter((n) => n.status === "Maintenance" || n.status === "Offline"),
    [nodes],
  );

  return (
    <div>
      <FilterBar onDeviceRegistered={refetch} nodeCount={nodes.length} />
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {loading ? (
          <p className="col-span-full text-on-surface-variant font-mono text-[14px]">Loading nodes...</p>
        ) : (
          nodes.map((node) => <DeviceCard key={node.id} node={node} onUpdate={refetch} />)
        )}
      </section>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-lg p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="font-sans text-[16px] leading-6 font-semibold text-on-surface">Fleet Status</h4>
            <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant">
              {nodes.length} NODE{nodes.length !== 1 ? "S" : ""}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(["Active", "Idle", "Maintenance", "Offline"] as const).map((status) => (
              <div
                key={status}
                className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-col items-center gap-2"
              >
                <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`} />
                <span className="font-sans text-[24px] leading-8 font-semibold text-on-surface">
                  {loading ? "—" : statusCounts[status]}
                </span>
                <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant">
                  {STATUS_LABELS[status]}
                </span>
              </div>
            ))}
          </div>
          <div className="flex-1 bg-surface border border-outline-variant rounded-lg p-4">
            <h5 className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant mb-3">
              BY MOTOR TYPE
            </h5>
            <div className="space-y-2">
              {Object.entries(typeCounts).length === 0 && (
                <p className="font-sans text-[14px] leading-5 text-on-surface-variant">No nodes registered</p>
              )}
              {Object.entries(typeCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="font-sans text-[14px] leading-5 text-on-surface">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-secondary rounded-full" style={{ width: `${Math.max(count * 12, 8)}px` }} />
                      <span className="font-mono text-[14px] leading-5 font-medium text-on-surface-variant w-4 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="bg-primary text-on-primary rounded-lg p-6 flex flex-col justify-between">
          {criticalNodes.length > 0 ? (
            <>
              <div>
                <h4 className="font-sans text-[32px] leading-10 tracking-[-0.02em] font-bold mb-2">System Alert</h4>
                <p className="font-sans text-[18px] leading-7 opacity-80">
                  {criticalNodes.length} node{criticalNodes.length !== 1 ? "s" : ""} require{criticalNodes.length === 1 ? "s" : ""} attention:{" "}
                  {criticalNodes.slice(0, 3).map((n) => n.name).join(", ")}
                  {criticalNodes.length > 3 ? ` and ${criticalNodes.length - 3} more` : ""}.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => criticalNodes[0] && router.push(`/motor/${criticalNodes[0].id}`)}
                  className="w-full bg-error text-white font-bold py-3 rounded flex items-center justify-center gap-2 font-mono text-[12px] leading-4 tracking-[0.05em]"
                >
                  <span className="material-symbols-outlined">warning</span>
                  INSPECT {criticalNodes[0]?.name ?? "NODE"}
                </button>
                <button
                  onClick={() => router.push("/health")}
                  className="w-full bg-white/10 hover:bg-white/20 py-3 rounded border border-white/20 font-sans text-[14px] leading-5 transition-colors"
                >
                  View System Logs
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-sans text-[32px] leading-10 tracking-[-0.02em] font-bold mb-2">All Systems Nominal</h4>
                <p className="font-sans text-[18px] leading-7 opacity-80">
                  All {nodes.length} node{nodes.length !== 1 ? "s" : ""} operating within normal parameters.
                </p>
              </div>
              <button
                onClick={() => router.push("/health")}
                className="w-full bg-white/10 hover:bg-white/20 py-3 rounded border border-white/20 font-sans text-[14px] leading-5 transition-colors"
              >
                View Health Dashboard
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
