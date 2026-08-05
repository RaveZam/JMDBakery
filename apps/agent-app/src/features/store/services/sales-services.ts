import { getDb } from "@/src/lib/db";
import { generateUUID } from "@/src/lib/uuid";
import SalesDao, { type LoggedItem } from "@/src/lib/dao/sales-dao";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import { getPhTime } from "@/src/shared/helpers/getPhTime";
import { syncVisitCredit } from "./store-credit-service";

type AddSaleInput = {
  sessionStoreId: string;
  productId: string;
  productName: string;
  price: number;
  qty: number;
  boQty: number;
  boReason: string;
  paymentType: "cash" | "credit";
};

// Reads the raw sale rows logged for one session store.
export function getSalesBySessionStore(sessionStoreId: string): LoggedItem[] {
  return SalesDao.getBySessionStoreId(sessionStoreId);
}

// Reads every sale row logged anywhere on the route session (all stores),
// so remaining stock reflects the truck's whole-day stock, not just this stop.
export function getSalesByRouteSession(routeSessionId: string): LoggedItem[] {
  return SalesDao.getByRouteSessionId(routeSessionId);
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
    payment_type: input.paymentType,
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
      paymentType: input.paymentType,
      createdAt,
    });
    enqueueOutbox({
      entityType: "sale",
      entityId: id,
      operation: "create",
      payload: { ...toSalePayload(id, input), created_at: createdAt },
    });
    // A sale and the debt it creates are one fact, so they commit together. The
    // caller never has to remember to reconcile the ledger afterwards.
    syncVisitCredit(input.sessionStoreId);
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
      paymentType: input.paymentType,
    });
    enqueueOutbox({
      entityType: "sale",
      entityId: input.saleId,
      operation: "update",
      payload: toSalePayload(input.saleId, input),
    });
    // Editing a credit order down to cash has to lower the debt too.
    syncVisitCredit(input.sessionStoreId);
  });
}

export function removeSale(saleId: string): void {
  // Read before the delete: afterwards there's no row left to say which visit
  // the debt belonged to.
  const sessionStoreId = SalesDao.getSessionStoreId(saleId);

  getDb().withTransactionSync(() => {
    SalesDao.deleteSale(saleId);
    enqueueOutbox({
      entityType: "sale",
      entityId: saleId,
      operation: "delete",
      payload: { id: saleId },
    });
    // Dropping a credit order lowers what's owed — and clears the entry
    // entirely if it was the last one.
    if (sessionStoreId) syncVisitCredit(sessionStoreId);
  });
}
