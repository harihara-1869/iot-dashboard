"use client";

import { useState } from "react";

const initialLog = [
  { type: "info", text: "Kinetic Industrial OS v4.2.0-stable" },
  { type: "dim", text: "Last login: Wed Oct 25 14:22:01 2023 from 192.168.1.42" },
  { type: "cmd", prompt: "root@MOT-01-A:~#", cmd: "systemctl status motor-controller.service" },
  { type: "dim", text: "● motor-controller.service - Kinetic High-Precision Motor Controller" },
  { type: "dim", text: "   Loaded: loaded (/etc/systemd/system/motor-controller.service; enabled)" },
  { type: "green", text: "   Active: active (running) since Wed 2023-10-25 08:00:15 UTC; 6h ago" },
  { type: "dim", text: "   Main PID: 1284 (motor-d)" },
  { type: "dim", text: "    Tasks: 4 (limit: 4915)" },
  { type: "log", text: "[LOG] 14:25:01 RPM fluctuation detected: 3450 -> 3452 (+0.05%)" },
  { type: "log", text: "[LOG] 14:25:30 Thermal sensor 02 reporting steady 42.5°C" },
  { type: "warn", text: "[WARN] 14:26:15 Comm-Link latency spiked to 14ms" },
  { type: "cmd", prompt: "root@MOT-01-A:~#", cmd: "tail -f /var/log/kinetic/diagnostics.log" },
  { type: "dim", text: "14:27:01 - TICK - Voltage: 220.4V - Current: 12.1A" },
  { type: "dim", text: "14:27:02 - TICK - Voltage: 220.3V - Current: 12.0A" },
  { type: "dim", text: "14:27:03 - TICK - Voltage: 220.4V - Current: 12.2A" },
  { type: "dim", text: "14:27:04 - TICK - Voltage: 220.5V - Current: 12.1A" },
];

type LogEntry = (typeof initialLog)[number];

export default function TerminalWindow() {
  const [logs, setLogs] = useState<LogEntry[]>(initialLog);
  const [command, setCommand] = useState("");

  function handleCommand(e: React.FormEvent) {
    e.preventDefault();
    if (!command.trim()) return;

    const newEntry: LogEntry = {
      type: "cmd",
      prompt: "root@MOT-01-A:~#",
      cmd: command,
    };

    let response: LogEntry;

    if (command.toLowerCase().includes("status")) {
      response = {
        type: "green",
        text: "● motor-controller.service - active (running) - RPM: 3450, Temp: 42.5°C, Current: 12.1A",
      };
    } else if (command.toLowerCase().includes("help")) {
      response = {
        type: "dim",
        text: 'Available commands: status, logs, ping, restart, help',
      };
    } else if (command.toLowerCase().includes("ping")) {
      response = { type: "log", text: "[PING] 64 bytes from MOT-01-A: time=8ms" };
    } else {
      response = {
        type: "dim",
        text: `Command "${command}" executed. No output.`,
      };
    }

    setLogs((prev) => [...prev, newEntry, response]);
    setCommand("");
  }

  return (
    <div className="bg-[#121212] flex flex-col border border-outline shadow-xl overflow-hidden h-full">
      <div className="bg-[#1e1e1e] border-b border-[#333] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="font-mono text-[14px] leading-5 font-medium text-gray-400 ml-4">
            ssh root@kinetic-os-01a
          </span>
        </div>
        <span className="font-mono text-[14px] leading-5 font-medium text-secondary-fixed">
          CONNECTED
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto terminal-scroll font-mono text-[14px] leading-5 font-medium space-y-1 min-h-0">
        {logs.map((entry, i) => (
          <div key={i}>
            {entry.type === "cmd" ? (
              <div className="flex gap-2">
                <span className="text-secondary-fixed">{entry.prompt}</span>
                <span className="text-white">{entry.cmd}</span>
              </div>
            ) : entry.type === "green" ? (
              <div className="text-secondary-fixed">{entry.text}</div>
            ) : entry.type === "log" ? (
              <div className="text-white border-l-2 border-secondary pl-2 my-2 bg-secondary/10 py-1">
                {entry.text}
              </div>
            ) : entry.type === "warn" ? (
              <div className="text-tertiary-fixed border-l-2 border-tertiary-fixed pl-2 my-2 bg-tertiary-fixed/5 py-1">
                {entry.text}
              </div>
            ) : entry.type === "info" ? (
              <div className="text-secondary-fixed opacity-80">{entry.text}</div>
            ) : (
              <div className="text-gray-400">{entry.text}</div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleCommand} className="p-4 bg-[#1a1a1a] border-t border-[#333] flex items-center gap-2">
        <span className="text-secondary-fixed font-mono text-[14px] leading-5 font-medium">
          root@MOT-01-A:~#
        </span>
        <input
          autoFocus
          className="bg-transparent border-none focus:ring-0 text-white font-mono text-[14px] leading-5 font-medium flex-1 p-0 outline-none"
          placeholder="type command here..."
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <div className="w-2 h-5 bg-secondary-fixed animate-pulse" />
      </form>
    </div>
  );
}
