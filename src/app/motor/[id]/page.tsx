"use client";

import { useRouter, useParams } from "next/navigation";
import MotorVisualization from "@/components/telemetry/motor-visualization";
import TelemetryCharts from "@/components/telemetry/telemetry-charts";
import type { MotorNode } from "@/lib/types";

const node: MotorNode = {
  id: "STP-MR-02",
  name: "Stepper Motor",
  type: "Stepper",
  location: "Motor Room",
  status: "Active",
  voltage: "12.0 V DC",
  torque: "0.45 Nm",
  max_rpm: 3000,
  ip_rating: "IP54",
  image_url:
    "https://lh3.googleusercontent.com/aida/ADBb0uhxb3d990zYoyeJwV7Pl4pk9_jTypUUJMVBjFIKYjiPsAl6Rgw9u7vc8qfm6tW2h62O745WBuhmgXmwiADzrp0DV5KZ9HMjUNQGg2V8rssH8FtEB-SZfpgGwFICyG5xjneEN3jr0RQnwKUiKkDx14td4TbgD7VT_2WNWC6159l1rRdegWEHTIO2B72TcEpU7AMGMCuf8JVbOPF5m-I_vOZ4AN7Ag26XASzyCZiAHgdZ4KueDeA6hmbiNj0",
  iot_device_id: null,
  created_at: "2023-10-01",
};

export default function MotorDetailPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-outline-variant z-40 flex justify-between items-center px-margin-desktop">
        <div className="flex items-center gap-4">
          <button
            className="text-on-surface-variant hover:text-primary transition-colors"
            onClick={() => router.back()}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="font-sans text-[24px] leading-8 font-semibold text-primary">
            {node.name} - {node.location}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-all">
            notifications
          </span>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-all">
            help_outline
          </span>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-all">
            account_circle
          </span>
        </div>
      </div>

      <main className="mt-16 w-full max-w-max-width mx-auto p-margin-desktop flex flex-col gap-[24px]">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4">
            <select className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-sans text-[14px] leading-5 text-on-surface focus:border-primary focus:ring-0">
              <option>{node.name} ({node.location})</option>
              <option>Induction Motor</option>
              <option>Stepper Motor (Control Panel)</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button className="bg-surface-container-lowest border border-outline-variant text-on-surface px-6 py-2 rounded font-sans text-[14px] leading-5 hover:bg-surface-container-low transition-colors border-b-2">
              Calibrate
            </button>
            <button className="bg-error text-on-error px-6 py-2 rounded font-sans text-[14px] leading-5 font-bold hover:bg-on-error-container transition-colors border-b-2 border-on-error-container">
              Emergency Stop
            </button>
          </div>
        </div>

        <MotorVisualization node={node} />
        <TelemetryCharts />
      </main>
    </div>
  );
}
