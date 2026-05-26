"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMotorNode, useLatestTelemetry, useTelemetryHistory } from "@/lib/hooks/useSupabase";
import MotorVisualization from "@/components/telemetry/motor-visualization";
import TelemetryCharts from "@/components/telemetry/telemetry-charts";
import CalibrateDialog from "@/components/nodes/calibrate-dialog";

export default function MotorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const motorId = params.id as string;
  const { node, loading: nodeLoading, refetch } = useMotorNode(motorId);
  const { latest } = useLatestTelemetry(motorId);
  const { history } = useTelemetryHistory(motorId);
  const [showCalibrate, setShowCalibrate] = useState(false);

  if (nodeLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-outline-variant z-40 flex items-center px-margin-desktop">
          <div className="font-sans text-[24px] leading-8 font-semibold text-primary">Loading...</div>
        </div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-outline-variant z-40 flex items-center justify-between px-margin-desktop">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="font-sans text-[24px] leading-8 font-semibold text-primary">Motor Not Found</div>
          </div>
        </div>
        <main className="mt-16 w-full max-w-max-width mx-auto p-margin-desktop">
          <p className="text-on-surface-variant font-mono">No motor found with ID: {motorId}</p>
        </main>
      </div>
    );
  }

  const vizNode = latest ? { ...node } : node;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-outline-variant z-40 flex justify-between items-center px-margin-desktop">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="font-sans text-[24px] leading-8 font-semibold text-primary">
            {node.name} - {node.location}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-all">notifications</span>
          <Link href="/help" className="text-on-surface-variant hover:text-primary transition-all active:opacity-80">
            <span className="material-symbols-outlined">help_outline</span>
          </Link>
          <Link href="/preferences" className="text-on-surface-variant hover:text-primary transition-all active:opacity-80">
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
        </div>
      </div>

      <main className="mt-16 w-full max-w-max-width mx-auto p-margin-desktop flex flex-col gap-[24px]">
        <div className="flex justify-between items-center w-full">
          <select className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-sans text-[14px] leading-5 text-on-surface focus:border-primary focus:ring-0">
            <option>{node.name} ({node.location})</option>
          </select>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCalibrate(true)}
              className="bg-surface-container-lowest border border-outline-variant text-on-surface px-6 py-2 rounded font-sans text-[14px] leading-5 hover:bg-surface-container-low transition-colors border-b-2"
            >
              Calibrate
            </button>
            <button className="bg-error text-on-error px-6 py-2 rounded font-sans text-[14px] leading-5 font-bold hover:bg-on-error-container transition-colors border-b-2 border-on-error-container">Emergency Stop</button>
          </div>
        </div>

        <MotorVisualization node={vizNode} telemetry={latest ?? undefined} />
        <TelemetryCharts data={history} />
      </main>

      <CalibrateDialog
        open={showCalibrate}
        node={node}
        onClose={() => setShowCalibrate(false)}
        onUpdated={() => {
          setShowCalibrate(false);
          refetch();
        }}
      />
    </div>
  );
}
