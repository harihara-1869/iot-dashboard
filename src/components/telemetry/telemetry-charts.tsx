"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { TelemetryPoint } from "@/lib/types";

function formatChartData(history: TelemetryPoint[]) {
  return history.map((p) => ({
    time: new Date(p.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    vibration: Number(p.vibration_mms),
    temperature: Number(p.temperature_c),
    current: Number(p.current_a),
    rpm: Number(p.rpm),
  }));
}

// Fallback data when no DB data is available
const fallbackData = [
  { time: "00:00", vibration: 1.1, temperature: 40, current: 1.3, rpm: 3000 },
  { time: "02:00", vibration: 1.3, temperature: 42, current: 1.5, rpm: 3010 },
  { time: "04:00", vibration: 1.0, temperature: 41, current: 1.4, rpm: 2990 },
  { time: "06:00", vibration: 1.4, temperature: 43, current: 1.6, rpm: 3020 },
  { time: "08:00", vibration: 1.2, temperature: 42.5, current: 1.5, rpm: 3005 },
  { time: "10:00", vibration: 1.1, temperature: 44, current: 1.7, rpm: 3015 },
  { time: "12:00", vibration: 1.3, temperature: 43, current: 1.5, rpm: 3000 },
  { time: "14:00", vibration: 1.2, temperature: 42.5, current: 1.5, rpm: 3002 },
];

export default function TelemetryCharts({ data }: { data: TelemetryPoint[] }) {
  const chartData = data.length > 0 ? formatChartData(data) : fallbackData;

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
