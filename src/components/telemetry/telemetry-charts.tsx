"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { TelemetryPoint } from "@/lib/types";

function formatChartData(history: TelemetryPoint[]) {
  return history.map((p) => ({
    time: new Date(p.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    vibration: Number(p.vibration),
    temperature: Number(p.temperature),
    current: Number(p.current),
    rpm: Number(p.rpm),
  }));
}

export default function TelemetryCharts({ data }: { data: TelemetryPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-[24px]">
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-center h-64">
          <p className="font-mono text-[14px] text-on-surface-variant">No telemetry data</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-center h-64">
          <p className="font-mono text-[14px] text-on-surface-variant">No telemetry data</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-center h-64">
          <p className="font-mono text-[14px] text-on-surface-variant">No telemetry data</p>
        </div>
      </div>
    );
  }

  const chartData = formatChartData(data);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-[24px]">
      <ChartCard title="Vibration History" data={chartData} dataKey="vibration" color="#006c4a" unit=" mm/s" />
      <ChartCard title="Temperature Trends" data={chartData} dataKey="temperature" color="#c86c00" unit="°C" />
      <ChartCard title="Current Draw" data={chartData} dataKey="current" color="#000101" unit=" A" />
    </div>
  );
}

function ChartCard({
  title, data, dataKey, color, unit,
}: {
  title: string;
  data: Array<Record<string, unknown>>;
  dataKey: string;
  color: string;
  unit: string;
}) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 flex flex-col gap-4 h-64">
      <div className="flex justify-between items-center">
        <h3 className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">{title}</h3>
        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">show_chart</span>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="time" stroke="#75777a" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} tickLine={false} />
            <YAxis stroke="#75777a" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} unit={unit} />
            <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #c5c6ca", borderRadius: "4px", fontFamily: "JetBrains Mono", fontSize: "12px" }} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ fill: color, r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
