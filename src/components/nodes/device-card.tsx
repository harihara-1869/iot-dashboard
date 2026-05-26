"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MotorNode } from "@/lib/types";
import StatusChip from "@/components/ui/status-chip";
import CalibrateDialog from "@/components/nodes/calibrate-dialog";
import { getNodeImage } from "@/lib/images";

export default function DeviceCard({ node, onUpdate }: { node: MotorNode; onUpdate?: () => void }) {
  const router = useRouter();
  const [showCalibrate, setShowCalibrate] = useState(false);
  const imageUrl = getNodeImage(node.id, node.type);

  return (
    <article
      className={`bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col ${
        node.status === "Maintenance" ? "opacity-80 grayscale" : ""
      }`}
    >
      <div className="relative h-48 bg-surface-container overflow-hidden">
        {imageUrl ? (
          <img
            alt={node.name}
            className="w-full h-full object-cover"
            src={imageUrl}
          />
        ) : (
          <div className="w-full h-full border border-dashed border-outline-variant rounded flex items-center justify-center bg-surface">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30">
              settings
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusChip status={node.status} />
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase mb-1">
              {node.location}
            </p>
            <h3 className="font-sans text-[16px] leading-6 font-bold text-primary">
              {node.name}
            </h3>
          </div>
          <span className="font-mono text-[14px] leading-5 font-medium text-on-surface-variant">
            {node.id}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-4 mb-6">
          <div>
            <p className="font-mono text-[10px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
              Voltage
            </p>
            <p className="font-mono text-[14px] leading-5 font-medium">
              {node.voltage}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
              Rated Torque
            </p>
            <p className="font-mono text-[14px] leading-5 font-medium">
              {node.torque}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
              Max RPM
            </p>
            <p className="font-mono text-[14px] leading-5 font-medium">
              {node.max_rpm}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
              IP Rating
            </p>
            <p className="font-mono text-[14px] leading-5 font-medium">
              {node.ip_rating}
            </p>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowCalibrate(true)}
            className="border border-outline-variant py-2 rounded font-sans text-[14px] leading-5 hover:bg-surface-container transition-colors"
          >
            {node.status === "Maintenance" ? "Order Parts" : "Calibrate"}
          </button>
          {node.status === "Maintenance" ? (
            <button className="bg-error text-on-primary py-2 rounded font-sans text-[14px] leading-5 hover:opacity-90">
              Diagnose
            </button>
          ) : (
            <button
              onClick={() => router.push(`/motor/${node.id}`)}
              className="bg-primary text-on-primary py-2 rounded font-sans text-[14px] leading-5 hover:opacity-90"
            >
              Telemetry
            </button>
          )}
        </div>
      </div>

      <CalibrateDialog
        open={showCalibrate}
        node={node}
        onClose={() => setShowCalibrate(false)}
        onUpdated={() => {
          setShowCalibrate(false);
          onUpdate?.();
        }}
      />
    </article>
  );
}
