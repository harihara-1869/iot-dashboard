"use client";

import { useRouter } from "next/navigation";
import { useMotorNodes } from "@/lib/hooks/useSupabase";
import FilterBar from "@/components/nodes/filter-bar";
import DeviceCard from "@/components/nodes/device-card";

export default function NodesPage() {
  const router = useRouter();
  const { nodes, loading } = useMotorNodes();

  return (
    <div>
      <FilterBar />
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {loading ? (
          <p className="col-span-full text-on-surface-variant font-mono text-[14px]">Loading nodes...</p>
        ) : (
          nodes.map((node) => <DeviceCard key={node.id} node={node} />)
        )}
      </section>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-lg p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="font-sans text-[24px] leading-8 font-semibold text-primary">Real-time Node Distribution</h4>
            <span className="font-mono text-[14px] leading-5 font-medium text-secondary">LIVE FEED</span>
          </div>
          <div className="h-48 fluid-indicator rounded-lg flex items-center justify-center">
            <div className="text-white text-center">
              <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold opacity-70 mb-2">NETWORK THROUGHPUT</p>
              <p className="font-sans text-[32px] leading-10 tracking-[-0.02em] font-bold">2.4 GB/s</p>
            </div>
          </div>
        </div>
        <div className="bg-primary text-on-primary rounded-lg p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-sans text-[24px] leading-8 font-semibold mb-2">System Alert</h4>
            <p className="font-sans text-[14px] leading-5 opacity-80">
              Node MOT-FAN-B is reporting abnormal thermal oscillation. Maintenance lockout recommended.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button className="w-full bg-error text-white font-bold py-3 rounded flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              EMERGENCY STOP
            </button>
            <button
              onClick={() => router.push("/health")}
              className="w-full bg-white/10 hover:bg-white/20 py-3 rounded border border-white/20 font-sans text-[14px] leading-5 transition-colors"
            >
              View System Logs
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
