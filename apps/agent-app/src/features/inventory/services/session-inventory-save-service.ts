import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import { getPhTime } from "@/src/shared/helpers/getPhTime";

type AddInventoryInput = {
  sessionId: string;
  productId: string;
  productName: string;
  price: number;
  qty: number;
};

export function updateMorningInventoryQty(
  inventoryId: string,
  qty: number,
): void {
  getDb().withTransactionSync(() => {
    SessionInventoryDao.updateQuantity(inventoryId, qty);
    enqueueOutbox({
      entityType: "session_inventory",
      entityId: inventoryId,
      operation: "update",
      payload: { quantity: qty },
    });
  });
}

export function removeMorningInventoryItem(inventoryId: string): void {
  getDb().withTransactionSync(() => {
    SessionInventoryDao.delete(inventoryId);
    enqueueOutbox({
      entityType: "session_inventory",
      entityId: inventoryId,
      operation: "delete",
      payload: { id: inventoryId },
    });
  });
}

export function addMorningInventoryItem(input: AddInventoryInput): void {
  const id = generateUUID();
  const createdAt = getPhTime().toISOString();
  getDb().withTransactionSync(() => {
    SessionInventoryDao.insert({
      sessionId: input.sessionId,
      productId: input.productId,
      snapshotName: input.productName,
      snapshotPrice: input.price,
      quantity: input.qty,
      createdAt,
      id,
    });
    enqueueOutbox({
      entityType: "session_inventory",
      entityId: id,
      operation: "create",
      payload: {
        id,
        route_session_id: input.sessionId,
        product_id: input.productId,
        snapshot_product_name: input.productName,
        snapshot_price: input.price,
        quantity: input.qty,
        created_at: createdAt,
      },
    });
  });
}
