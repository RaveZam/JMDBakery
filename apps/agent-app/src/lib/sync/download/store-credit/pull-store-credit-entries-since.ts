import { supabase } from "@/src/lib/supabase";
import { SyncStateDao } from "@/src/lib/dao/sync-state-dao";
import {
  applyStoreCreditRows,
  STORE_CREDIT_SELECT,
} from "./apply-store-credit-rows";
import { sessionStoreIdsFrom } from "../core/session-store-ids-from";
import { latestUpdatedAt } from "../../latest-updated-at";

/**
 * Incremental pull of credit entries for stores already backfilled: only rows
 * newer than the `store_credit_entries` cursor, which keeps this cheap however
 * long the agent's history grows.
 *
 * @returns The session_store ids seen in the batch, for the sales pull.
 */
export async function pullStoreCreditEntriesSince(
  storeIds: string[],
): Promise<string[]> {
  const lastSynced = SyncStateDao.getLastSyncedAt("store_credit_entries");
  let query = supabase
    .from("store_credit_entries")
    .select(STORE_CREDIT_SELECT)
    .in("store_id", storeIds);
  if (lastSynced) query = query.gte("updated_at", lastSynced);

  const { data, error } = await query;
  if (error || !data) {
    console.warn(
      "[download] failed to fetch store credit entries:",
      error?.message,
    );
    return [];
  }

  applyStoreCreditRows(data);
  const newCursor = latestUpdatedAt(data);
  if (newCursor)
    SyncStateDao.setLastSyncedAt("store_credit_entries", newCursor);
  return sessionStoreIdsFrom(data);
}
