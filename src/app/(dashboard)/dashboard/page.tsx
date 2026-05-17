"use client";

import { useRouter } from "next/navigation";
import KpiCard from "@/components/ui/kpi-card";
import FluidStatus from "@/components/ui/fluid-status";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-[24px]">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <KpiCard
          label="Active Devices"
          value="42"
          icon={
            <span
              className="material-symbols-outlined text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          }
        />
        <KpiCard
          label="Vibration"
          value="1.2"
          unit="mm/s"
          icon={<span className="material-symbols-outlined text-on-surface-variant">waves</span>}
        />
        <KpiCard
          label="Ambient temperature"
          value="24"
          unit="°C"
          icon={
            <span className="material-symbols-outlined text-on-surface-variant">thermostat</span>
          }
        />
        <KpiCard
          label="Avg Current"
          value="18.5"
          unit="A"
          icon={
            <span className="material-symbols-outlined text-on-surface-variant">electric_bolt</span>
          }
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
        <section className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col h-full shadow-sm">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright rounded-t-xl">
            <h3 className="font-sans text-[24px] leading-8 font-semibold font-bold text-primary">
              Device List
            </h3>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <DeviceItem
              name="Induction Motor"
              id="MOT-01-A"
              status="Active"
              icon="autorenew"
              onClick={() => router.push("/motor/MOT-01-A")}
            />
            <DeviceItem
              name="Stepper Motor (Motor Room)"
              id="STP-MR-02"
              status="Active"
              icon="settings_b_roll"
              onClick={() => router.push("/motor/STP-MR-02")}
            />
            <DeviceItem
              name="Stepper Motor (Control Panel)"
              id="STP-CP-03"
              status="Idle"
              icon="settings_b_roll"
              onClick={() => router.push("/motor/STP-CP-03")}
            />
          </div>
          <div className="p-4 border-t border-outline-variant bg-surface-bright rounded-b-xl text-center">
            <button
              onClick={() => router.push("/nodes")}
              className="font-mono text-[14px] leading-5 font-medium text-primary hover:text-secondary-fixed-dim transition-colors flex items-center justify-center gap-2 w-full"
            >
              View All Devices{" "}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>

        <FluidStatus />
      </div>
    </div>
  );
}

function DeviceItem({
  name,
  id,
  status,
  icon,
  onClick,
}: {
  name: string;
  id: string;
  status: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 mb-2 rounded-lg hover:bg-surface-container transition-colors group cursor-pointer border border-transparent hover:border-outline-variant"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center text-primary border border-outline-variant">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="font-sans text-[16px] leading-6 font-bold text-primary">{name}</p>
          <p className="font-sans text-[14px] leading-5 text-on-surface-variant">ID: {id}</p>
        </div>
      </div>
      <span
        className={`px-2 py-1 rounded-full font-mono text-[12px] leading-4 tracking-[0.05em] font-bold border ${
          status === "Active"
            ? "bg-secondary-container/30 text-on-secondary-fixed border-secondary-container"
            : "bg-surface-dim text-on-surface-variant border-outline-variant"
        }`}
      >
        {status}
      </span>
    </div>
  );
}
