"use client";

import { useState } from "react";
import type { MotorNode } from "@/lib/types";
import DeviceDetailsForm, { type DeviceDetailsValues } from "@/components/nodes/device-details-form";

interface Props {
  open: boolean;
  node: MotorNode;
  onClose: () => void;
  onUpdated: () => void;
}

export default function CalibrateDialog({ open, node, onClose, onUpdated }: Props) {
  const [step, setStep] = useState<"form" | "saving" | "success" | "error">("form");
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(values: DeviceDetailsValues) {
    setStep("saving");
    setError("");

    try {
      const res = await fetch(`/api/devices/${node.id}/details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (data.success) {
        setStep("success");
        onUpdated();
      } else {
        setError(data.error ?? "Failed to update device.");
        setStep("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setStep("error");
    }
  }

  function handleClose() {
    setStep("form");
    setError("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-bright">
          <h2 className="font-sans text-[20px] leading-7 font-semibold text-primary">
            Calibrate Device
          </h2>
          <button onClick={handleClose} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          {step === "saving" && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-[14px] text-on-surface-variant">
                Updating device details...
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[28px]">check_circle</span>
                <div>
                  <p className="font-sans text-[18px] font-semibold text-primary">Device Updated</p>
                  <p className="font-mono text-[14px] text-on-surface-variant">
                    ID: {node.id}
                  </p>
                </div>
              </div>
              <Button variant="secondary" onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          )}

          {(step === "form" || step === "error") && (
            <>
              {error && (
                <div className="bg-error/5 border border-error/20 rounded-lg p-3 flex items-start gap-2 mb-5">
                  <span className="material-symbols-outlined text-error text-[18px]">error</span>
                  <p className="font-sans text-[13px] text-error">{error}</p>
                </div>
              )}

              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">precision_manufacturing</span>
                <p className="font-mono text-[14px] font-medium text-on-surface">{node.name}</p>
              </div>

              <DeviceDetailsForm
                submitting={false}
                submitLabel="Update Device"
                defaultValues={node}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Button({ variant, onClick, className, disabled, children }: {
  variant: "primary" | "secondary";
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const base = variant === "primary"
    ? "h-12 bg-primary text-on-primary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
    : "h-12 bg-surface border border-outline text-on-surface font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:bg-surface-container-high active:scale-95 flex items-center justify-center gap-2 cursor-pointer";

  return (
    <button className={`${base} ${className ?? ""}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
