import { getDb } from "@/src/lib/db";
import EndingInventoryDao from "@/src/lib/dao/ending-inventory-dao";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import { manilaTimestamp } from "@/src/shared/helpers/manilaTimestamp";

type UpsertEndingInventoryInput = {
  id?: string;
  sessionId: string;
  productId: string;
  productName: string;
  endingBo: number;
  endingBalance: number;
};

/**
 * Persists one product's ending-inventory counts for a session, locally and to the
 * sync outbox, in a single transaction.
 *
 * @param input.id - Existing row id, if this product was already saved once this
 *                    session (pass the id returned from a prior call). Omit for
 *                    the first save of a product; a new id is generated for it.
 * @param input.sessionId - The route session these counts belong to.
 * @param input.productId - Product being counted.
 * @param input.productName - Product name, snapshotted onto the row so it still
 *                             reads correctly if the product is later renamed.
 * @param input.endingBo - Bad-order units counted at the end of the route.
 * @param input.endingBalance - Good stock counted at the end of the route. Caller
 *                               is responsible for clamping both to a valid
 *                               (e.g. non-negative) value.
 * @returns The row's id — the same value as `input.id` if one was passed in,
 *          otherwise a freshly generated id. Callers should hold onto this and
 *          pass it back in on the next call for the same product, so repeated
 *          saves update the same row instead of creating duplicates.
 * @sideEffects Writes/updates one row in the local `ending_inventory` table, and
 *              enqueues a matching "create" entry in the outbox for the next
 *              sync push to Supabase.
 */
export function upsertEndingInventoryCounts(
  input: UpsertEndingInventoryInput,
): string {
  const createdAt = manilaTimestamp();
  // withTransactionSync runs its callback synchronously, but TS can't see
  // that through the callback boundary — assert we always assign below.
  let id!: string;
  getDb().withTransactionSync(() => {
    // writes (or updates, if input.id was given) the local row and gives back its id
    id = EndingInventoryDao.upsert({
      id: input.id,
      sessionId: input.sessionId,
      productId: input.productId,
      snapshotName: input.productName,
      endingBo: input.endingBo,
      endingBalance: input.endingBalance,
      createdAt,
    });
    // queues the same write to be pushed to Supabase next sync, shaped like the remote table's columns
    enqueueOutbox({
      entityType: "ending_inventory",
      entityId: id,
      operation: "create",
      payload: {
        id,
        route_session_id: input.sessionId,
        product_id: input.productId,
        snapshot_product_name: input.productName,
        ending_bo: input.endingBo,
        ending_balance: input.endingBalance,
        created_at: createdAt,
      },
    });
  });
  return id;
}
