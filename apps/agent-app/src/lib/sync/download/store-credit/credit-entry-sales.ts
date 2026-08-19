import { supabase } from "@/src/lib/supabase";
import CreditEntrySalesDao from "@/src/lib/dao/credit-entry-sales-dao";
import {
  toLocalCreditEntrySale,
  type RemoteSaleRow,
} from "../core/to-local-credit-entry-sale";

// The sales behind a credit entry live in their own local table, apart from
// the normal `sales` table. Keeping them together would mean backfilling
// session_store -> route_session rows just to be able to read them back.

/**
 * Pulls the sale lines belonging to the given session_stores, so a credit
 * entry can show what was actually bought. Failures are logged and swallowed —
 * the credit entries themselves are already saved, and the next run retries.
 */
export async function downloadCreditEntrySales(
  sessionStoreIds: string[],
): Promise<void> {
  if (sessionStoreIds.length === 0) return;

  const { data, error } = await supabase
    .from("sales")
    .select(
      "id, session_store_id, product_id, snapshot_product_name, snapshot_price, quantity_sold, quantity_bo, bo_reason, payment_type, created_at",
    )
    .in("session_store_id", sessionStoreIds);

  if (error || !data) {
    console.warn(
      "[download] failed to fetch credit entry sales:",
      error?.message,
    );
    return;
  }

  for (const row of data as RemoteSaleRow[]) {
    CreditEntrySalesDao.insert(toLocalCreditEntrySale(row));
  }
}
