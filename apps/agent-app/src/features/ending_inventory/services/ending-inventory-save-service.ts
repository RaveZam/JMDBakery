import { getDb } from "@/src/lib/db";
import EndingInventoryDao from "@/src/lib/dao/ending-inventory-dao";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import { getPhTime } from "@/src/shared/helpers/getPhTime";

type UpsertEndingInventoryInput = {
  id?: string;
  sessionId: string;
  productId: string;
  productName: string;
  quantity: number;
};

/**
 * Persists one product's ending-inventory count for a session, locally and to the
 * sync outbox, in a single transaction.
 *
 * @param input.id - Existing row id, if this product was already saved once this
 *                    session (pass the id returned from a prior call). Omit for
 *                    the first save of a product; a new id is generated for it.
 * @param input.sessionId - The route session this count belongs to.
 * @param input.productId - Product being counted.
 * @param input.productName - Product name, snapshotted onto the row so it still
 *                             reads correctly if the product is later renamed.
 * @param input.quantity - The ending count to store; caller is responsible for
 *                          clamping to a valid (e.g. non-negative) value.
 * @returns The row's id — the same value as `input.id` if one was passed in,
 *          otherwise a freshly generated id. Callers should hold onto this and
 *          pass it back in on the next call for the same product, so repeated
 *          saves update the same row instead of creating duplicates.
 * @sideEffects Writes/updates one row in the local `ending_inventory` table, and
 *              enqueues a matching "create" entry in the outbox for the next
 *              sync push to Supabase.
 */
export function upsertEndingInventoryQty(
  input: UpsertEndingInventoryInput,
): string {
  const createdAt = getPhTime().toISOString();
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
      quantity: input.quantity,
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
        quantity: input.quantity,
        created_at: createdAt,
      },
    });
  });
  return id;
}
