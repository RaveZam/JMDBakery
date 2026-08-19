import { supabase } from "@/src/lib/supabase";
import StoreCreditDao from "@/src/lib/dao/store-credit-dao";
import {
  applyStoreCreditRows,
  STORE_CREDIT_SELECT,
} from "./apply-store-credit-rows";
import { sessionStoreIdsFrom } from "../core/session-store-ids-from";

/**
 * Pulls the *entire* credit history of stores this device has never synced
 * before — no cursor, because there is no local history to be incremental
 * against. Marks them synced afterwards so later runs take the cheap
 * cursor-based path instead.
 *
 * @param unsyncedStoreIds Stores absent from the store_credit_synced table.
 * @returns The session_store ids seen in the batch, for the sales pull.
 *          Empty on failure — the stores stay unmarked and retry next run.
 */
export async function backfillNewStoreCreditHistory(
  unsyncedStoreIds: string[],
): Promise<string[]> {
  const { data, error } = await supabase
    .from("store_credit_entries")
    .select(STORE_CREDIT_SELECT)
    .in("store_id", unsyncedStoreIds);

  if (error || !data) {
    console.warn(
      "[download] failed to backfill store credit entries:",
      error?.message,
    );
    return [];
  }
  applyStoreCreditRows(data);
  StoreCreditDao.markStoresSynced(unsyncedStoreIds);
  return sessionStoreIdsFrom(data);
}
