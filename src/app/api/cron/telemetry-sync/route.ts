import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { EventHubConsumerClient, earliestEventPosition, type ReceivedEventData } from "@azure/event-hubs";

export const dynamic = "force-dynamic";

interface TelemetryPayload {
  device_id: string;
  timestamp: string;
  rpm: number;
  temperature?: number;
  vibration?: number;
  current?: number;
  temperature_c?: number;
  vibration_mms?: number;
  current_a?: number;
  voltage_v?: number;
  status?: string;
  status_message?: string;
}

interface TelemetryRow {
  node_id: string;
  timestamp: string;
  rpm: number;
  temperature: number;
  vibration: number;
  current: number;
  status: string;
  status_message: string | null;
  partition_id: string;
  event_hub_offset: string;
}

export async function GET(request: Request) {
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (
    !process.env.CRON_SECRET ||
    request.headers.get("Authorization") !== expected
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connectionString = process.env.IOT_HUB_EVENTHUB_CONNECTION;
  if (!connectionString) {
    return NextResponse.json(
      { processed: 0, skipped: 0, errors: 0, error: "IOT_HUB_EVENTHUB_CONNECTION not set" },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { processed: 0, skipped: 0, errors: 0, error: "Supabase credentials not set" },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  const partitionEvents: { partitionId: string; event: ReceivedEventData }[] = [];
  let consumerClient: EventHubConsumerClient | null = null;

  try {
    consumerClient = new EventHubConsumerClient("$Default", connectionString);

    const partitionIds = await consumerClient.getPartitionIds();
    console.log(
      `Telemetry sync: ${partitionIds.length} partitions: ${partitionIds.join(", ")}`,
    );

    const { data: checkpoints } = await supabase
      .from("telemetry_checkpoints")
      .select("partition_id, event_hub_offset");
    const checkpointMap = new Map(
      (checkpoints ?? []).map((c: { partition_id: string; event_hub_offset: string }) => [c.partition_id, c.event_hub_offset]),
    );
    console.log(`Telemetry sync: ${checkpointMap.size} checkpoints loaded`);

    const subscriptions = partitionIds.map((partitionId) => {
      const lastOffset = checkpointMap.get(partitionId);
      const startPosition = lastOffset
        ? { offset: lastOffset, isInclusive: false }
        : earliestEventPosition;

      return consumerClient!.subscribe(
        partitionId,
        {
          processEvents: async (received: ReceivedEventData[]) => {
            for (const e of received) {
              partitionEvents.push({ partitionId, event: e });
            }
          },
          processError: async (err) => {
            console.error(`Telemetry sync: partition ${partitionId} error:`, err.message);
          },
        },
        {
          startPosition,
          maxBatchSize: 50,
          maxWaitTimeInSeconds: 4,
        },
      );
    });

    console.log(`Telemetry sync: draining ${subscriptions.length} partitions for 8s...`);
    await new Promise((resolve) => setTimeout(resolve, 8000));
    console.log(`Telemetry sync: collected ${partitionEvents.length} events, closing...`);

    await consumerClient.close();
  } catch (e) {
    if (consumerClient) {
      try { await consumerClient.close(); } catch { /* ignore */ }
    }
    const message = e instanceof Error ? e.message : String(e);
    console.error("Telemetry sync: Event Hub connection failed:", message);
    return NextResponse.json(
      { processed: 0, skipped: 0, errors: 0, error: message },
    );
  }

  const batch = partitionEvents.slice(0, 150);
  const rows: TelemetryRow[] = [];
  const newCheckpoints = new Map<string, string>();

  for (const { partitionId, event } of batch) {
    try {
      const raw = typeof event.body === "string" ? event.body : JSON.stringify(event.body);
      console.log(`Telemetry sync: raw event body: ${raw}`);

      let payload: TelemetryPayload;
      if (typeof event.body === "string") {
        payload = JSON.parse(event.body);
      } else {
        payload = event.body as TelemetryPayload;
      }

      if (!payload.device_id) {
        skipped++;
        continue;
      }

      const { data: motorNode, error: nodeError } = await supabase
        .from("motor_nodes")
        .select("id")
        .eq("iot_device_id", payload.device_id)
        .maybeSingle();

      if (nodeError || !motorNode) {
        console.log(
          `Telemetry sync: skipping unknown device "${payload.device_id}"`,
        );
        skipped++;
        continue;
      }

      rows.push({
        node_id: motorNode.id,
        timestamp: payload.timestamp || new Date().toISOString(),
        rpm: payload.rpm,
        temperature: payload.temperature ?? payload.temperature_c ?? 0,
        vibration: payload.vibration ?? payload.vibration_mms ?? 0,
        current: payload.current ?? payload.current_a ?? 0,
        status: payload.status ?? "ok",
        status_message: payload.status_message ?? null,
        partition_id: partitionId,
        event_hub_offset: event.offset.toString(),
      });

      const currentMax = newCheckpoints.get(partitionId);
      if (!currentMax || Number(event.offset) > Number(currentMax)) {
        newCheckpoints.set(partitionId, event.offset.toString());
      }

      processed++;
    } catch (e) {
      errors++;
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Telemetry sync: event parse error: ${message}`);
    }
  }

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("telemetry_live")
      .upsert(rows, {
        onConflict: "partition_id, event_hub_offset",
        ignoreDuplicates: true,
      });

    if (insertError) {
      console.error("Telemetry sync: batch insert failed:", insertError.message);
      errors += rows.length;
      processed = 0;
    }
  }

  if (newCheckpoints.size > 0) {
    const checkpointRows = Array.from(newCheckpoints.entries()).map(
      ([partitionId, event_hub_offset]) => ({
        partition_id: partitionId,
        event_hub_offset,
        updated_at: new Date().toISOString(),
      }),
    );

    const { error: checkpointError } = await supabase
      .from("telemetry_checkpoints")
      .upsert(checkpointRows, { onConflict: "partition_id" });

    if (checkpointError) {
      console.error("Telemetry sync: checkpoint upsert failed:", checkpointError.message);
    }
  }

  return NextResponse.json({ processed, skipped, errors });
}
