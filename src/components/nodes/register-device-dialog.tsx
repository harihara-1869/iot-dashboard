"use client";

import { useState } from "react";
import type { RegisterDeviceResult, DeviceCredentials } from "@/lib/iot-hub/index";
import DeviceDetailsForm, { type DeviceDetailsValues } from "@/components/nodes/device-details-form";
import Button from "@/components/ui/button";
import { isReauthed } from "@/lib/hooks/useReauth";
import ReauthDialog from "@/components/auth/reauth-dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onRegistered: () => void;
}

export default function RegisterDeviceDialog({ open, onClose, onRegistered }: Props) {
  const [step, setStep] = useState<"register" | "loading" | "details" | "saving" | "result" | "error">("register");
  const [deviceName, setDeviceName] = useState("");
  const [location, setLocation] = useState("");
  const [registerResult, setRegisterResult] = useState<RegisterDeviceResult | null>(null);
  const [error, setError] = useState("");
  const [reauthOpen, setReauthOpen] = useState(false);

  if (!open) return null;

  function beginRegistration(e?: React.FormEvent) {
    e?.preventDefault();
    if (isReauthed()) {
      handleRegister(e);
    } else {
      setReauthOpen(true);
    }
  }

  async function handleRegister(e?: React.FormEvent) {
    e?.preventDefault();
    setStep("loading");
    setError("");

    try {
      const res = await fetch("/api/devices/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_name: deviceName, location }),
      });

      const data: RegisterDeviceResult = await res.json();

      if (data.success) {
        setRegisterResult(data);
        setStep("details");
      } else {
        setError(data.error ?? "Registration failed.");
        setStep("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setStep("error");
    }
  }

  async function handleDetailsSubmit(values: DeviceDetailsValues) {
    if (!registerResult?.supabaseId) return;

    setStep("saving");
    setError("");

    try {
      const res = await fetch(`/api/devices/${registerResult.supabaseId}/details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (data.success) {
        setStep("result");
        onRegistered();
      } else {
        setError(data.error ?? "Failed to save details.");
        setStep("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setStep("error");
    }
  }

  function handleSkipDetails() {
    setStep("result");
    onRegistered();
  }

  function handleClose() {
    setStep("register");
    setDeviceName("");
    setLocation("");
    setRegisterResult(null);
    setError("");
    onClose();
  }

  function downloadCredentials(creds: DeviceCredentials) {
    const json = JSON.stringify(
      {
        deviceId: creds.deviceId,
        iotHubHost: creds.iotHubHost,
        primaryKey: creds.primaryKey,
      },
      null,
      2,
    );
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "credentials.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-bright">
          <h2 className="font-sans text-[20px] leading-7 font-semibold text-primary">
            {step === "details" || step === "saving" ? "Device Details" : "Register New Device"}
          </h2>
          <button onClick={handleClose} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
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

          {step === "saving" && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-[14px] text-on-surface-variant">
                Saving device details...
              </p>
            </div>
          )}

          {step === "details" && (
            <DeviceDetailsForm
              submitting={false}
              submitLabel="Save Details"
              onSubmit={handleDetailsSubmit}
              onSkip={handleSkipDetails}
            />
          )}

          {step === "result" && registerResult && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[28px]">check_circle</span>
                <div>
                  <p className="font-sans text-[18px] font-semibold text-primary">Device Registered</p>
                  <p className="font-mono text-[14px] text-on-surface-variant">
                    ID: {registerResult.deviceId}
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
                value={registerResult.device!.deviceId}
                mono
              />
              <CredentialsDisplay
                label="IoT Hub Host"
                value={registerResult.device!.iotHubHost}
                mono
              />
              <CredentialsDisplay
                label="Primary Key"
                value={registerResult.device!.primaryKey}
                mono
                secret
              />

              <Button
                variant="primary"
                onClick={() => downloadCredentials(registerResult.device!)}
                icon={<span className="material-symbols-outlined text-[18px]">download</span>}
                className="w-full"
              >
                Download credentials.json
              </Button>

              <Button variant="secondary" onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          )}

          {(step === "register" || step === "error") && (
            <form onSubmit={beginRegistration} className="space-y-5">
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

    <ReauthDialog
      open={reauthOpen}
      onSuccess={() => { setReauthOpen(false); handleRegister(); }}
      onCancel={() => { setReauthOpen(false); }}
    />
    </>
  );
}

function CredentialsDisplay({
  label,
  value,
  mono = false,
  secret = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  secret?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
          className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          onClick={handleCopy}
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
