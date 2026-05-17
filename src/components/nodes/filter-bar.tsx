"use client";

import { useState } from "react";
import RegisterDeviceDialog from "./register-device-dialog";

interface Props {
  onDeviceRegistered: () => void;
  nodeCount: number;
}

export default function FilterBar({ onDeviceRegistered, nodeCount }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-sans text-[24px] leading-8 font-semibold text-primary mb-1">
              Nodes Inventory
            </h2>
            <p className="font-sans text-[14px] leading-5 text-on-surface-variant">
              Total active system components: {nodeCount}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect label="Filter by Status">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Idle</option>
              <option>Maintenance</option>
            </FilterSelect>
            <FilterSelect label="Device Type">
              <option>All Types</option>
              <option>Stepper</option>
              <option>Induction</option>
              <option>Cooling</option>
            </FilterSelect>
            <FilterSelect label="Room">
              <option>All Rooms</option>
              <option>Bay 01</option>
              <option>Room 4</option>
              <option>HVAC Zone</option>
            </FilterSelect>
            <button
              onClick={() => setDialogOpen(true)}
              className="bg-primary text-on-primary px-6 py-2 rounded font-sans text-[14px] leading-5 self-end hover:opacity-90 transition-opacity flex items-center gap-2 h-[42px]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Register New Node
            </button>
          </div>
        </div>
      </section>

      <RegisterDeviceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onRegistered={onDeviceRegistered}
      />
    </>
  );
}

function FilterSelect({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
        {label}
      </label>
      <select className="bg-white border border-outline-variant rounded px-3 py-2 text-[14px] leading-5 min-w-[120px] focus:ring-1 focus:ring-primary outline-none">
        {children}
      </select>
    </div>
  );
}
