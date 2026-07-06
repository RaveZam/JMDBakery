import SalesDao, { type LoggedItem } from "@/src/lib/dao/sales-dao";

// Reads the raw sale rows logged for one session store.
export function getSalesBySessionStore(sessionStoreId: string): LoggedItem[] {
  return SalesDao.getBySessionStoreId(sessionStoreId);
}
