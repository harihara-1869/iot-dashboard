"use client";

import { useState } from "react";
import type { RegisterDeviceResult, DeviceCredentials } from "@/lib/iot-hub/index";
import Button from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  onRegistered: () => void;
}

export default function RegisterDeviceDialog({ open, onClose, onRegistered }: Props) {
  const [step, setStep] = useState<"form" | "loading" | "result" | "error">("form");
  const [deviceName, setDeviceName] = useState("");
  const [location, setLocation] = useState("");
  const [customDeviceId, setCustomDeviceId] = useState("");
  const [result, setResult] = useState<RegisterDeviceResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("loading");
    setError("");

    try {
      const res = await fetch("/api/devices/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_name: deviceName,
          location,
          custom_device_id: customDeviceId || undefined,
        }),
      });

      const data: RegisterDeviceResult = await res.json();

      if (data.success) {
        setResult(data);
        setStep("result");
        onRegistered();
      } else {
        setError(data.error ?? "Registration failed.");
        setStep("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setStep("error");
    }
  }

  function handleClose() {
    setStep("form");
    setDeviceName("");
    setLocation("");
    setCustomDeviceId("");
    setResult(null);
    setError("");
    setCopied(false);
    onClose();
  }

  function copyCredentials(creds: DeviceCredentials) {
    const text = [
      `Device ID: ${creds.deviceId}`,
      `IoT Hub Host: ${creds.iotHubHost}`,
      `Primary Key: ${creds.primaryKey}`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-bright">
          <h2 className="font-sans text-[20px] leading-7 font-semibold text-primary">
            Register New Device
          </h2>
          <button onClick={handleClose} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          {step === "loading" && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-[14px] text-on-surface-variant">
                Registering device in Azure IoT Hub...
              </p>
            </div>
          )}

          {step === "result" && result && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[28px]">check_circle</span>
                <div>
                  <p className="font-sans text-[18px] font-semibold text-primary">Device Registered</p>
                  <p className="font-mono text-[14px] text-on-surface-variant">
                    ID: {result.deviceId}
                  </p>
                </div>
              </div>

              <div className="bg-error/5 border border-error/20 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                  <p className="font-sans text-[13px] leading-5 font-bold text-error">
                    Save these credentials now. The primary key will NOT be shown again.
                  </p>
                </div>
                <p className="font-sans text-[13px] leading-5 text-on-surface-variant">
                  Store the primary key securely on your ESP32 device. Never commit it to source control.
                </p>
              </div>

              <CredentialsDisplay
                label="Device ID"
                value={result.device!.deviceId}
                mono
              />
              <CredentialsDisplay
                label="IoT Hub Host"
                value={result.device!.iotHubHost}
                mono
              />
              <CredentialsDisplay
                label="Primary Key"
                value={result.device!.primaryKey}
                mono
                secret
                copied={copied}
              />

              <Button
                variant="primary"
                onClick={() => copyCredentials(result.device!)}
                icon={<span className="material-symbols-outlined text-[18px]">content_copy</span>}
                className="w-full"
              >
                {copied ? "Copied!" : "Copy All Credentials"}
              </Button>

              <Button variant="secondary" onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          )}

          {(step === "form" || step === "error") && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-error/5 border border-error/20 rounded-lg p-3 flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-[18px]">error</span>
                  <p className="font-sans text-[13px] text-error">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase" htmlFor="device-name">
                  Device Name <span className="text-error">*</span>
                </label>
                <input
                  id="device-name"
                  className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded outline-none transition-all"
                  placeholder="e.g. Conveyor Motor B3"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase" htmlFor="location">
                  Location <span className="text-error">*</span>
                </label>
                <input
                  id="location"
                  className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded outline-none transition-all"
                  placeholder="e.g. Bay 03"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface uppercase" htmlFor="custom-id">
                  Custom Device ID
                </label>
                <input
                  id="custom-id"
                  className="w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded outline-none transition-all"
                  placeholder="Optional — auto-generated if empty"
                  value={customDeviceId}
                  onChange={(e) => setCustomDeviceId(e.target.value)}
                />
                <p className="font-sans text-[12px] text-on-surface-variant">
                  Leave blank to auto-generate a unique device ID from the device name.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Register Device
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function CredentialsDisplay({
  label,
  value,
  mono = false,
  secret = false,
  copied = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  secret?: boolean;
  copied?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[11px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <code
          className={`flex-1 bg-surface-container border border-outline-variant rounded px-3 py-2 text-[13px] leading-5 break-all select-all ${
            mono ? "font-mono" : "font-sans"
          } ${secret ? "blur-sm hover:blur-none transition-all" : ""}`}
        >
          {value}
        </code>
        <button
          type="button"
          className="p-2 text-on-surface-variant hover:text-primary transition-colors"
          onClick={() => navigator.clipboard.writeText(value)}
          title="Copy"
        >
          <span className="material-symbols-outlined text-[18px]">
            {copied ? "check" : "content_copy"}
          </span>
        </button>
      </div>
    </div>
  );
}
