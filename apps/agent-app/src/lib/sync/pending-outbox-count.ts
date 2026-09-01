import { getDb } from "@/src/lib/db";

/**
 * How many outbox rows have not reached Supabase yet.
 *
 * Read before anything that destroys local data, so the agent can be told
 * exactly how much unpushed work they are about to lose.
 */
export function countPendingOutbox(): number {
  const row = getDb().getFirstSync<{ pending: number }>(
    `SELECT count(*) AS pending FROM outbox WHERE synced_at IS NULL`,
  );
  return row?.pending ?? 0;
}
