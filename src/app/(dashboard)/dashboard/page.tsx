"use client";

import { useRouter } from "next/navigation";
import { useMotorNodes, useDashboardKpis, useFleetHealth } from "@/lib/hooks/useSupabase";
import KpiCard from "@/components/ui/kpi-card";
import FluidStatus from "@/components/ui/fluid-status";
import type { Severity } from "@/lib/node-health";

const severityColors: Record<Severity, string> = {
  good: "bg-secondary-container/30 text-on-secondary-fixed border-secondary-container",
  warning: "bg-amber-100 text-amber-900 border-amber-200",
  degraded: "bg-orange-100 text-orange-900 border-orange-200",
  critical: "bg-error/10 text-error border-error/20",
};

export default function DashboardPage() {
  const router = useRouter();
  const { nodes, loading: nodesLoading } = useMotorNodes();
  const { kpis, loading: kpisLoading } = useDashboardKpis();
  const { health, healthByNode, loading: healthLoading } = useFleetHealth();

  const loading = nodesLoading || kpisLoading;

  return (
    <div className="flex flex-col gap-[24px]">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <KpiCard
          label="Active Devices"
          value={loading ? "—" : String(kpis.activeDevices)}
          icon={
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          }
        />
        <KpiCard
          label="Vibration"
          value={kpis.vibration}
          unit="mm/s"
          icon={<span className="material-symbols-outlined text-on-surface-variant">waves</span>}
        />
        <KpiCard
          label="Ambient temperature"
          value={kpis.temperature}
          unit="°C"
          icon={<span className="material-symbols-outlined text-on-surface-variant">thermostat</span>}
        />
        <KpiCard
          label="Avg Current"
          value={kpis.current}
          unit="A"
          icon={<span className="material-symbols-outlined text-on-surface-variant">electric_bolt</span>}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
        <section className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col h-full shadow-sm">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright rounded-t-xl">
            <h3 className="font-sans text-[24px] leading-8 font-semibold font-bold text-primary">Device List</h3>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {nodes.slice(0, 6).map((node) => (
              <div
                key={node.id}
                onClick={() => router.push(`/motor/${node.id}`)}
                className="flex items-center justify-between p-3 mb-2 rounded-lg hover:bg-surface-container transition-colors group cursor-pointer border border-transparent hover:border-outline-variant"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center text-primary border border-outline-variant">
                    <span className="material-symbols-outlined">
                      {node.type === "Stepper" ? "settings_b_roll" :
                       node.type === "Induction" ? "autorenew" :
                       node.type === "Cooling" ? "mode_fan" :
                       node.type === "Conveyor" ? "conveyor_belt" :
                       node.type === "Servo" ? "precision_manufacturing" : "water_drop"}
                    </span>
                  </div>
                  <div>
                    <p className="font-sans text-[16px] leading-6 font-bold text-primary">{node.name}</p>
                    <p className="font-sans text-[14px] leading-5 text-on-surface-variant">ID: {node.id}</p>
                  </div>
                </div>
                {(() => {
                  const nodeHealth = healthByNode.get(node.id);
                  const sev = nodeHealth?.severity ?? "good";
                  const label = nodeHealth?.status ?? node.status;
                  return (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full font-mono text-[12px] leading-4 tracking-[0.05em] font-bold border ${severityColors[sev]}`}>
                      {label}
                    </span>
                  );
                })()}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-outline-variant bg-surface-bright rounded-b-xl text-center">
            <button
              onClick={() => router.push("/nodes")}
              className="font-mono text-[14px] leading-5 font-medium text-primary hover:text-secondary-fixed-dim transition-colors flex items-center justify-center gap-2 w-full"
            >
              View All Devices <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>

        <section className="lg:col-span-8">
          <FluidStatus
            status={healthLoading ? "Initializing" : (health?.status ?? "Good")}
            message={healthLoading ? "Loading system data..." : (health?.message ?? "")}
            severity={health?.severity}
          />
        </section>
      </div>
    </div>
  );
}
