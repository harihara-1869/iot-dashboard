"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TelemetryPoint, TelemetrySnapshot } from "@/lib/types";
import React from "react";

export function useRealtimeTelemetry(nodeId?: string) {
  const [latest, setLatest] = useState<TelemetrySnapshot | null>(null);
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchHistory() {
      let query = supabase
        .from("telemetry_live")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(60);

      if (nodeId) {
        query = query.eq("node_id", nodeId);
      }

      const { data } = await query;

      if (data) {
        const points = (data as TelemetryPoint[]).reverse();
        setHistory(points);
        if (points.length > 0) {
          setLatest({
            rpm: points[points.length - 1].rpm,
            temperature: points[points.length - 1].temperature_c,
            vibration: points[points.length - 1].vibration_mms,
            current: points[points.length - 1].current_a,
          });
        }
      }
    }

    fetchHistory();

    const filter = nodeId
      ? `node_id=eq.${nodeId}`
      : undefined;

    const channel = supabase
      .channel(`telemetry_${nodeId ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "telemetry_live",
          filter,
        },
        (payload) => {
          const point = payload.new as TelemetryPoint;
          setHistory((prev) => [...prev.slice(-59), point]);
          setLatest({
            rpm: point.rpm,
            temperature: point.temperature_c,
            vibration: point.vibration_mms,
            current: point.current_a,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nodeId]);

  return { latest, history };
}

// Fallback static data generator
export function generateMockTelemetry(baseValues?: Partial<TelemetrySnapshot>) {
  const base = {
    rpm: 3450,
    temperature: 42.5,
    vibration: 1.2,
    current: 12.1,
    ...baseValues,
  };

  return {
    rpm: base.rpm + (Math.random() - 0.5) * 20,
    temperature: base.temperature + (Math.random() - 0.5) * 2,
    vibration: base.vibration + (Math.random() - 0.5) * 0.3,
    current: base.current + (Math.random() - 0.5) * 0.5,
  };
}
