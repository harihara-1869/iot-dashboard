"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MotorNode } from "@/lib/types";

export function useNodes() {
  const [nodes, setNodes] = useState<MotorNode[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchNodes() {
      const { data } = await supabase
        .from("motor_nodes")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setNodes(data as MotorNode[]);
      setLoading(false);
    }

    fetchNodes();

    const channel = supabase
      .channel("motor_nodes_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "motor_nodes" },
        () => {
          fetchNodes();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { nodes, loading };
}

export function useNode(id: string) {
  const [node, setNode] = useState<MotorNode | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchNode() {
      const { data } = await supabase
        .from("motor_nodes")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setNode(data as MotorNode);
      setLoading(false);
    }

    if (id) fetchNode();
  }, [id]);

  return { node, loading };
}
