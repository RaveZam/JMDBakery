import StoresDao from "@/src/lib/dao/store-dao";
import StoreCreditDao from "@/src/lib/dao/store-credit-dao";
import CreditEntrySalesDao from "@/src/lib/dao/credit-entry-sales-dao";
import { backfillNewStoreCreditHistory } from "./backfill-new-store-credit-history";
import { pullStoreCreditEntriesSince } from "./pull-store-credit-entries-since";
import { downloadCreditEntrySales } from "./credit-entry-sales";

/**
 * Pulls credit entries for every local store, then the sales behind them.
 *
 * Stores are split in two so the query stays cheap as history grows. A store
 * this device has never synced has no local history to compare against, so it
 * gets its full history once and is then marked synced. Every other store is
 * already marked, so it only asks for rows newer than the cursor.
 *
 * Both halves report which session_stores they touched. Those are merged,
 * dropped if their sales are already local, and the rest fetched in one query.
 *
 * Must run after downloadAgentStoresAndLinks — it works off local stores.
 */
export async function downloadStoreCreditEntries(): Promise<void> {
  const allStoreIds = StoresDao.getAllStoreIds();
  if (allStoreIds.length === 0) return;

  const unsyncedStoreIds = StoreCreditDao.getUnsyncedStoreIds(allStoreIds);

  const backfilledSessionStoreIds =
    unsyncedStoreIds.length > 0
      ? await backfillNewStoreCreditHistory(unsyncedStoreIds)
      : [];

  const incrementalSessionStoreIds =
    await pullStoreCreditEntriesSince(allStoreIds);

  // Both halves can name the same session_store; fetch its sales once, and
  // only if they aren't already local.
  const sessionStoreIdsToFetch = [
    ...new Set([...backfilledSessionStoreIds, ...incrementalSessionStoreIds]),
  ].filter((id) => !CreditEntrySalesDao.hasSessionStoreId(id));

  await downloadCreditEntrySales(sessionStoreIdsToFetch);
}
