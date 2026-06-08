"use client";

import { useState } from "react";
import type { MotorType } from "@/lib/types";
import Button from "@/components/ui/button";

const MOTOR_TYPES: MotorType[] = ["Stepper", "Induction", "Cooling", "Servo", "Conveyor", "Hydraulic"];

export interface DeviceDetailsValues {
  type: MotorType;
  voltage: string;
  torque: string;
  max_rpm: number;
  rated_current: string;
}

interface Props {
  submitting: boolean;
  submitLabel: string;
  defaultValues?: Partial<DeviceDetailsValues>;
  onSubmit: (values: DeviceDetailsValues) => void;
  onSkip?: () => void;
}

export default function DeviceDetailsForm({ submitting, submitLabel, defaultValues, onSubmit, onSkip }: Props) {
  const [type, setType] = useState<MotorType>(defaultValues?.type ?? "Stepper");
  const [voltage, setVoltage] = useState(defaultValues?.voltage ?? "");
  const [torque, setTorque] = useState(defaultValues?.torque ?? "");
  const [maxRpm, setMaxRpm] = useState(defaultValues?.max_rpm?.toString() ?? "");
  const [ratedCurrent, setRatedCurrent] = useState(defaultValues?.rated_current ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      type,
      voltage: voltage.trim(),
      torque: torque.trim(),
      max_rpm: parseInt(maxRpm, 10) || 0,
      rated_current: ratedCurrent.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase" htmlFor="motor-type">
          Motor Type <span className="text-error">*</span>
        </label>
        <select
          id="motor-type"
          className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none outline-none transition-all appearance-none"
          value={type}
          onChange={(e) => setType(e.target.value as MotorType)}
          required
        >
          {MOTOR_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase" htmlFor="rated-voltage">
          Rated Voltage <span className="text-error">*</span>
        </label>
        <input
          id="rated-voltage"
          className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none outline-none transition-all"
          placeholder="e.g. 220V"
          value={voltage}
          onChange={(e) => setVoltage(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase" htmlFor="max-rpm">
          Max RPM <span className="text-error">*</span>
        </label>
        <input
          id="max-rpm"
          type="number"
          className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none outline-none transition-all"
          placeholder="e.g. 3000"
          value={maxRpm}
          onChange={(e) => setMaxRpm(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase" htmlFor="torque">
          Torque <span className="text-error">*</span>
        </label>
        <input
          id="torque"
          className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none outline-none transition-all"
          placeholder="e.g. 2.5 Nm"
          value={torque}
          onChange={(e) => setTorque(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase" htmlFor="rated-current">
          Rated Current <span className="text-error">*</span>
        </label>
        <input
          id="rated-current"
          className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none outline-none transition-all"
          placeholder="e.g. 2.5 A"
          value={ratedCurrent}
          onChange={(e) => setRatedCurrent(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onSkip && (
          <Button type="button" variant="secondary" onClick={onSkip} className="flex-1">
            Skip for Now
          </Button>
        )}
        <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
          {submitting ? "SAVING..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
