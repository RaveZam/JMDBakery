import type { StoreCreditEntryRow } from "@/src/lib/dao/store-credit-dao";

/**
 * The payments of a session keyed by the visit each was collected on, so a
 * store card can pick up its own without scanning the whole list.
 *
 * A payment with no visit on it is dropped: it was taken before the app
 * recorded where a payment happened, or encoded outside a session, and there
 * is no store card in this session it belongs under.
 */
export function groupPaymentsBySessionStore(
  payments: StoreCreditEntryRow[],
): Record<string, StoreCreditEntryRow[]> {
  const grouped: Record<string, StoreCreditEntryRow[]> = {};
  for (const payment of payments) {
    const sessionStoreId = payment.session_store_id;
    if (!sessionStoreId) continue;
    grouped[sessionStoreId] = [...(grouped[sessionStoreId] ?? []), payment];
  }
  return grouped;
}
