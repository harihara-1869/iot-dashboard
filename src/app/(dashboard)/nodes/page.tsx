"use client";

import { useRouter } from "next/navigation";
import FilterBar from "@/components/nodes/filter-bar";
import DeviceCard from "@/components/nodes/device-card";
import type { MotorNode } from "@/lib/types";

const nodes: MotorNode[] = [
  {
    id: "MOT-17-A",
    name: "NEMA-17-Precision",
    type: "Stepper",
    location: "Room 4 Stepper",
    status: "Active",
    voltage: "12.0 V DC",
    torque: "0.45 Nm",
    max_rpm: 3000,
    ip_rating: "IP54",
    image_url:
      "https://lh3.googleusercontent.com/aida/ADBb0uhxb3d990zYoyeJwV7Pl4pk9_jTypUUJMVBjFIKYjiPsAl6Rgw9u7vc8qfm6tW2h62O745WBuhmgXmwiADzrp0DV5KZ9HMjUNQGg2V8rssH8FtEB-SZfpgGwFICyG5xjneEN3jr0RQnwKUiKkDx14td4TbgD7VT_2WNWC6159l1rRdegWEHTIO2B72TcEpU7AMGMCuf8JVbOPF5m-I_vOZ4AN7Ag26XASzyCZiAHgdZ4KueDeA6hmbiNj0",
    iot_device_id: null,
    created_at: "2023-10-01",
  },
  {
    id: "MOT-01-A",
    name: "Main Induction Drive",
    type: "Induction",
    location: "Bay 01 Main",
    status: "Active",
    voltage: "480.0 V AC",
    torque: "150.2 Nm",
    max_rpm: 1750,
    ip_rating: "IP67",
    image_url: null,
    iot_device_id: null,
    created_at: "2023-09-15",
  },
  {
    id: "MOT-FAN-B",
    name: "Cooling Fan Motor",
    type: "Cooling",
    location: "HVAC Zone 02",
    status: "Maintenance",
    voltage: "230.0 V AC",
    torque: "12.5 Nm",
    max_rpm: 2400,
    ip_rating: "IP44",
    image_url: null,
    iot_device_id: null,
    created_at: "2023-08-20",
  },
  {
    id: "MOT-CON-03",
    name: "Conveyor Drive",
    type: "Conveyor",
    location: "Line 3 Feed",
    status: "Idle",
    voltage: "110.0 V DC",
    torque: "45.0 Nm",
    max_rpm: 1200,
    ip_rating: "IP65",
    image_url: null,
    iot_device_id: null,
    created_at: "2023-07-10",
  },
  {
    id: "MOT-SRV-09",
    name: "High-Torque Servo",
    type: "Servo",
    location: "Arm A-4 Axis 1",
    status: "Active",
    voltage: "48.0 V DC",
    torque: "8.2 Nm",
    max_rpm: 6000,
    ip_rating: "IP68",
    image_url: null,
    iot_device_id: null,
    created_at: "2023-06-05",
  },
  {
    id: "MOT-PMP-12",
    name: "Hydraulic Pump Drive",
    type: "Hydraulic",
    location: "Coolant Pump",
    status: "Active",
    voltage: "208.0 V AC",
    torque: "22.0 Nm",
    max_rpm: 3500,
    ip_rating: "IP66",
    image_url: null,
    iot_device_id: null,
    created_at: "2023-05-18",
  },
];

export default function NodesPage() {
  const router = useRouter();

  return (
    <div>
      <FilterBar />
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {nodes.map((node) => (
          <DeviceCard key={node.id} node={node} />
        ))}
      </section>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-lg p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="font-sans text-[24px] leading-8 font-semibold text-primary">
              Real-time Node Distribution
            </h4>
            <span className="font-mono text-[14px] leading-5 font-medium text-secondary">
              LIVE FEED
            </span>
          </div>
          <div className="h-48 fluid-indicator rounded-lg flex items-center justify-center">
            <div className="text-white text-center">
              <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold opacity-70 mb-2">
                NETWORK THROUGHPUT
              </p>
              <p className="font-mono text-[20px] leading-7 font-semibold font-sans text-[32px] leading-10 tracking-[-0.02em] font-bold">
                2.4 GB/s
              </p>
            </div>
          </div>
        </div>
        <div className="bg-primary text-on-primary rounded-lg p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-sans text-[24px] leading-8 font-semibold mb-2">System Alert</h4>
            <p className="font-sans text-[14px] leading-5 opacity-80">
              Node MOT-FAN-B is reporting abnormal thermal oscillation. Maintenance lockout
              recommended.
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
