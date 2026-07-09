import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import SalesDao, { type LoggedItem } from "@/src/lib/dao/sales-dao";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import { getPhTime } from "@/src/shared/helpers/getPhTime";

type AddSaleInput = {
  sessionStoreId: string;
  productId: string;
  productName: string;
  price: number;
  qty: number;
  boQty: number;
  boReason: string;
};

// Reads the raw sale rows logged for one session store.
export function getSalesBySessionStore(sessionStoreId: string): LoggedItem[] {
  return SalesDao.getBySessionStoreId(sessionStoreId);
}

// Sums sold revenue for one session store, computed in SQL from the sales table.
export function getNetTotalBySessionStore(sessionStoreId: string): number {
  return SalesDao.getNetTotal(sessionStoreId);
}

function toSalePayload(id: string, input: AddSaleInput) {
  return {
    id,
    session_store_id: input.sessionStoreId,
    product_id: input.productId,
    snapshot_product_name: input.productName,
    snapshot_price: input.price,
    quantity_sold: input.qty,
    quantity_bo: input.boQty,
    bo_reason: input.boReason,
  };
}

export function addSale(input: AddSaleInput): void {
  const id = generateUUID();
  const createdAt = getPhTime().toISOString();
  getDb().withTransactionSync(() => {
    SalesDao.insertSale({
      id,
      sessionStoreId: input.sessionStoreId,
      productId: input.productId,
      snapshotName: input.productName,
      snapshotPrice: input.price,
      quantitySold: input.qty,
      quantityBo: input.boQty,
      boReason: input.boReason,
      createdAt,
    });
    enqueueOutbox({
      entityType: "sale",
      entityId: id,
      operation: "create",
      payload: { ...toSalePayload(id, input), created_at: createdAt },
    });
  });
}

type UpdateSaleInput = AddSaleInput & { saleId: string };

export function updateSale(input: UpdateSaleInput): void {
  getDb().withTransactionSync(() => {
    SalesDao.updateSale({
      saleId: input.saleId,
      productId: input.productId,
      snapshotName: input.productName,
      snapshotPrice: input.price,
      quantitySold: input.qty,
      quantityBo: input.boQty,
      boReason: input.boReason,
    });
    enqueueOutbox({
      entityType: "sale",
      entityId: input.saleId,
      operation: "update",
      payload: toSalePayload(input.saleId, input),
    });
  });
}

export function removeSale(saleId: string): void {
  getDb().withTransactionSync(() => {
    SalesDao.deleteSale(saleId);
    enqueueOutbox({
      entityType: "sale",
      entityId: saleId,
      operation: "delete",
      payload: { id: saleId },
    });
  });
}
