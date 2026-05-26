"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MotorNode, TelemetryPoint, DiagnosticsLog, TelemetrySnapshot } from "@/lib/types";

const supabase = createClient();

export function useMotorNodes() {
  const [nodes, setNodes] = useState<MotorNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNodes = useCallback(async () => {
    const { data } = await supabase
      .from("motor_nodes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setNodes(data as MotorNode[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNodes();
    const channel = supabase
      .channel("motor_nodes_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "motor_nodes" }, fetchNodes)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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
        avgVib = String(avg?.vibration_mms?.toFixed?.(1) ?? avgVib);
        avgTemp = String(avg?.temperature_c?.toFixed?.(0) ?? avgTemp);
        avgCur = String(avg?.current_a?.toFixed?.(1) ?? avgCur);
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
    supabase
      .from("telemetry_live")
      .select("rpm, temperature_c, vibration_mms, current_a")
      .eq("node_id", nodeId)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          const d = data as TelemetryPoint;
          setLatest({
            rpm: d.rpm,
            temperature: d.temperature_c,
            vibration: d.vibration_mms,
            current: d.current_a,
          });
        }
      });
  }, [nodeId]);

  return { latest };
}

export function useTelemetryHistory(nodeId?: string, limit = 60) {
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nodeId) { setLoading(false); return; }
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
