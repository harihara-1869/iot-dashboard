"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const vibrationData = [
  { time: "00:00", value: 1.1 },
  { time: "02:00", value: 1.3 },
  { time: "04:00", value: 1.0 },
  { time: "06:00", value: 1.4 },
  { time: "08:00", value: 1.2 },
  { time: "10:00", value: 1.1 },
  { time: "12:00", value: 1.3 },
  { time: "14:00", value: 1.2 },
];

const temperatureData = [
  { time: "00:00", value: 40 },
  { time: "02:00", value: 42 },
  { time: "04:00", value: 41 },
  { time: "06:00", value: 43 },
  { time: "08:00", value: 42.5 },
  { time: "10:00", value: 44 },
  { time: "12:00", value: 43 },
  { time: "14:00", value: 42.5 },
];

const currentData = [
  { time: "00:00", value: 1.3 },
  { time: "02:00", value: 1.5 },
  { time: "04:00", value: 1.4 },
  { time: "06:00", value: 1.6 },
  { time: "08:00", value: 1.5 },
  { time: "10:00", value: 1.7 },
  { time: "12:00", value: 1.5 },
  { time: "14:00", value: 1.5 },
];

function ChartCard({ title, data, color, unit }: { title: string; data: { time: string; value: number }[]; color: string; unit: string }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 flex flex-col gap-4 h-64">
      <div className="flex justify-between items-center">
        <h3 className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
          {title}
        </h3>
        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
          show_chart
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="time"
              stroke="#75777a"
              tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickLine={false}
            />
            <YAxis
              stroke="#75777a"
              tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              unit={unit}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #c5c6ca",
                borderRadius: "4px",
                fontFamily: "JetBrains Mono",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function TelemetryCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-[24px]">
      <ChartCard title="Vibration History" data={vibrationData} color="#006c4a" unit=" mm/s" />
      <ChartCard title="Temperature Trends" data={temperatureData} color="#c86c00" unit="°C" />
      <ChartCard title="Current Draw" data={currentData} color="#000101" unit=" A" />
    </div>
  );
}
