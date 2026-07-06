import { getDb } from "@/src/lib/db";
import SalesDao, { type LoggedItem } from "@/src/lib/dao/sales-dao";
import { enqueueOutbox } from "@/src/lib/sync/outbox";

// Reads the raw sale rows logged for one session store.
export function getSalesBySessionStore(sessionStoreId: string): LoggedItem[] {
  return SalesDao.getBySessionStoreId(sessionStoreId);
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
