import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import { isWifiConnected } from "@/src/lib/network";
import { supabase } from "@/src/lib/supabase";

export type OutboxOperation = "create" | "update" | "delete";

/**
 * Maps a local entity type to its Supabase table. The payload enqueued by the
 * services is already remote-shaped (snake_case columns matching Supabase), so
 * dispatch is generic per table — only the operation differs.
 */
const ENTITY_TABLE: Record<string, string> = {
  route: "agent_routes",
  province: "agent_provinces",
  store: "stores",
  planned_route: "planned_routes",
  route_session: "route_sessions",
  session_store: "session_stores",
  sale: "sales",
  session_inventory: "session_inventory",
  ending_inventory: "ending_inventory",
};

type OutboxRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: OutboxOperation;
  payload: string;
};

/**
 * The single write path for queuing a mutation to be pushed to Supabase.
 * Called from feature LocalServices inside the same transaction as the local
 * DAO write, so the local DB and the outbox never diverge.
 */
export function enqueueOutbox(params: {
  entityType: string;
  entityId: string;
  operation: OutboxOperation;
  payload: object;
}): void {
  getDb().runSync(
    `INSERT INTO outbox (id, entity_type, entity_id, operation, payload, created_at, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL)`,
    [
      generateUUID(),
      params.entityType,
      params.entityId,
      params.operation,
      JSON.stringify(params.payload),
      new Date().toISOString(),
    ],
  );
}

async function dispatchRow(row: OutboxRow): Promise<void> {
  const table = ENTITY_TABLE[row.entity_type];

  if (!table) {
    console.warn(`[outbox] unknown entity_type: ${row.entity_type}`);
    return; // leave pending; nothing we can do until a mapping exists
  }

  const payload = JSON.parse(row.payload);

  if (row.operation === "create") {
    const { error } = await supabase.from(table).upsert(payload);
    if (error) throw error;
    return;
  }

  if (row.operation === "update") {
    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq("id", row.entity_id);
    if (error) throw error;
    return;
  }

  if (row.operation === "delete") {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", row.entity_id);
    if (error) throw error;
  }
}

function getPendingRows(): OutboxRow[] {
  return getDb().getAllSync<OutboxRow>(
    `SELECT id, entity_type, entity_id, operation, payload
     FROM outbox
     WHERE synced_at IS NULL
     ORDER BY created_at ASC`,
  );
}

function markSynced(id: string): void {
  getDb().runSync(`UPDATE outbox SET synced_at = ? WHERE id = ?`, [
    new Date().toISOString(),
    id,
  ]);
}

/**
 * Drains the outbox to Supabase. Safe to call repeatedly (launch, foreground,
 * interval). A failed row is left pending so it retries on the next run.
 */
export async function runOutboxSync(): Promise<{
  synced: number;
  failed: number;
}> {
  console.log("[outbox] attempting sync");

  if (!(await isWifiConnected())) {
    console.log("[outbox] skipped: no wifi connection");
    return { synced: 0, failed: 0 };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.log("[outbox] skipped: no active session");
    return { synced: 0, failed: 0 };
  }

  const pending = getPendingRows();
  console.log(`[outbox] ${pending.length} pending row(s)`);

  let synced = 0;
  let failed = 0;

  for (const row of pending) {
    try {
      await dispatchRow(row);
      markSynced(row.id);
      synced++;
    } catch (err) {
      failed++;
      console.warn(
        `[outbox] sync failed for ${row.entity_type}/${row.entity_id} (${row.operation}):`,
        err,
      );
    }
  }

  console.log(`[outbox] sync complete: ${synced} synced, ${failed} failed`);

  return { synced, failed };
}
