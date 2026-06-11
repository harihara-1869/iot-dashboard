"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MotorNode, TelemetryPoint, DiagnosticsLog, TelemetrySnapshot } from "@/lib/types";
import { getNodeHealth, type FleetHealth, type Severity } from "@/lib/node-health";

const supabase = createClient();

export function useMotorNodes() {
  const [nodes, setNodes] = useState<MotorNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNodes = useCallback(async () => {
    const { data } = await supabase
      .from("motor_nodes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setNodes(data as MotorNode[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNodes();
    try {
      const channel = supabase
        .channel("motor_nodes_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "motor_nodes" }, fetchNodes)
        .subscribe((status, err) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.warn("Realtime subscription unavailable — data will be fetched via REST.", err?.message ?? status);
            supabase.removeChannel(channel);
          }
        });
      return () => { supabase.removeChannel(channel); };
    } catch {
      // Realtime subscription unavailable (SSR hydration or WebSocket not ready)
    }
  }, [fetchNodes]);

  return { nodes, loading, refetch: fetchNodes };
}

export function useMotorNode(id: string | undefined) {
  const [node, setNode] = useState<MotorNode | null>(null);
  const [loading, setLoading] = useState(true);

  function fetchNode() {
    if (!id) return;
    setLoading(true);
    supabase
      .from("motor_nodes")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) setNode(data as MotorNode);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchNode();
  }, [id]);

  return { node, loading, refetch: fetchNode };
}

export function useDashboardKpis() {
  const [kpis, setKpis] = useState({ activeDevices: 0, vibration: "—", temperature: "—", current: "—" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: nodes } = await supabase
        .from("motor_nodes")
        .select("id, status");

      const activeCount = nodes?.filter((n: Record<string, unknown>) => n.status === "Active").length ?? 0;

      let avgVib = "—";
      let avgTemp = "—";
      let avgCur = "—";

      const { data: latest, error: rpcError } = await supabase.rpc("latest_telemetry_averages");

      if (!rpcError && latest) {
        const avg = (Array.isArray(latest) ? latest[0] : latest) as Record<string, number>;
        avgVib = String(avg?.vibration?.toFixed?.(1) ?? avgVib);
        avgTemp = String(avg?.temperature?.toFixed?.(0) ?? avgTemp);
        avgCur = String(avg?.current?.toFixed?.(1) ?? avgCur);
      }

      setKpis({
        activeDevices: activeCount,
        vibration: avgVib,
        temperature: avgTemp,
        current: avgCur,
      });
      setLoading(false);
    }
    load();
  }, []);

  return { kpis, loading };
}

export function useDiagnosticsLogs(page = 1, pageSize = 10) {
  const [logs, setLogs] = useState<DiagnosticsLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, count, error } = await supabase
      .from("diagnostics_logs")
      .select("*", { count: "exact" })
      .order("timestamp", { ascending: false })
      .range(from, to);
    if (error) {
      console.error("Diagnostics fetch error:", error.message);
    }
    if (data) setLogs(data as DiagnosticsLog[]);
    if (count !== null) setTotalCount(count);
    setLoading(false);
  }, [page, pageSize]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, totalCount, totalPages, loading, refetch: fetchLogs };
}

export function useLatestTelemetry(nodeId?: string) {
  const [latest, setLatest] = useState<TelemetrySnapshot | null>(null);

  useEffect(() => {
    if (!nodeId) return;

    function fetch() {
      supabase
        .from("telemetry_live")
        .select("rpm, temperature, vibration, current, status, status_message")
        .eq("node_id", nodeId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data) {
            const d = data as TelemetryPoint;
            setLatest({
              rpm: d.rpm,
            temperature: d.temperature,
            vibration: d.vibration,
            current: d.current,
            status: d.status,
            status_message: d.status_message,
            });
          }
        });
    }

    fetch();
    const interval = setInterval(fetch, 10_000);
    return () => clearInterval(interval);
  }, [nodeId]);

  return { latest };
}

export function useTelemetryHistory(nodeId?: string, limit = 60) {
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nodeId) { setLoading(false); return; }

    function fetch() {
      supabase
        .from("telemetry_live")
        .select("*")
        .eq("node_id", nodeId)
        .order("timestamp", { ascending: false })
        .limit(limit)
        .then(({ data }) => {
          if (data) setHistory((data as TelemetryPoint[]).reverse());
          setLoading(false);
        });
    }

    fetch();
    const interval = setInterval(fetch, 10_000);
    return () => clearInterval(interval);
  }, [nodeId, limit]);

  return { history, loading };
}

export function useTerminalLogs(nodeId?: string) {
  const [logs, setLogs] = useState<{ type: string; text?: string; prompt?: string; cmd?: string }[]>([]);

  useEffect(() => {
    if (!nodeId) return;
    supabase
      .from("terminal_logs")
      .select("*")
      .eq("node_id", nodeId)
      .order("timestamp", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const entries = [];
          for (const log of data as Array<Record<string, unknown>>) {
            entries.unshift({ type: "cmd", prompt: `root@${nodeId}:~#`, cmd: log.command as string });
            entries.unshift({ type: "dim", text: log.output as string });
          }
          setLogs(entries as typeof logs);
        }
      });
  }, [nodeId]);

  return { logs };
}

export type { FleetHealth };

export function useFleetHealth() {
  const [health, setHealth] = useState<FleetHealth | null>(null);
  const [healthByNode, setHealthByNode] = useState<Map<string, { status: string; severity: Severity }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: nodes } = await supabase
        .from("motor_nodes")
        .select("id, name, type, status, max_rpm, rated_current");

      if (!nodes?.length) {
        setHealth({ status: "Initializing", message: "No devices registered.", severity: "good" });
        setHealthByNode(new Map());
        setLoading(false);
        return;
      }

      const { data: telemetry } = await supabase
        .from("telemetry_live")
        .select("node_id, temperature, vibration, current, rpm, status, status_message, timestamp")
        .order("timestamp", { ascending: false })
        .limit(500);

      const latestPerNode = new Map<string, Record<string, unknown>>();
      for (const t of (telemetry ?? []) as Record<string, unknown>[]) {
        const nid = t.node_id as string;
        if (!latestPerNode.has(nid)) latestPerNode.set(nid, t);
      }

      const nodesList = nodes as MotorNode[];

      const nodeMap = new Map<string, { status: string; severity: Severity }>();
      const issues: { name: string; severity: Severity; message: string }[] = [];

      for (const node of nodesList) {
        const t = latestPerNode.get(node.id) as TelemetryPoint | undefined;
        const h = getNodeHealth(node, t);
        nodeMap.set(node.id, { status: h.status, severity: h.severity });
        if (h.severity !== "good") {
          issues.push({ name: node.name, severity: h.severity, message: h.message });
        }
      }

      setHealthByNode(nodeMap);

      issues.sort((a, b) => {
        const order: Record<string, number> = { critical: 0, degraded: 1, warning: 2 };
        return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
      });

      const topIssues = issues
        .slice(0, 3)
        .map((i) => i.message)
        .join(" ");

      if (issues.length === 0) {
        setHealth({
          status: "Good",
          severity: "good",
          message: `All ${nodesList.length} devices operational.`,
        });
      } else {
        const worst = issues[0].severity;
        const label = worst === "critical" ? "Critical" : worst === "degraded" ? "Degraded" : "Warning";
        setHealth({
          status: label,
          severity: worst,
          message: topIssues + (issues.length > 3 ? ` ${issues.length - 3} more.` : ""),
        });
      }
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  return { health, healthByNode, loading };
}
