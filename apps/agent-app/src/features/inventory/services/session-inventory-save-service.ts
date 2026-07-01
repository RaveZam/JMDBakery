import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import { enqueueOutbox } from "@/src/lib/sync/outbox";

type AddInventoryInput = {
  sessionId: string;
  productId: string;
  productName: string;
  qty: number;
};

export function addMorningInventoryItem(input: AddInventoryInput): void {
  const id = generateUUID();
  getDb().withTransactionSync(() => {
    SessionInventoryDao.insert(
      input.sessionId,
      input.productId,
      input.productName,
      input.qty,
      id,
    );
    enqueueOutbox({
      entityType: "session_inventory",
      entityId: id,
      operation: "create",
      payload: {
        id,
        route_session_id: input.sessionId,
        product_id: input.productId,
        snapshot_product_name: input.productName,
        quantity: input.qty,
      },
    });
  });
}
