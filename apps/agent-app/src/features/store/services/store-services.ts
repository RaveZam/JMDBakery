import { getDb } from "@/src/lib/db";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import type { SessionStoreDetails } from "../types/store-types";

export function getSessionStoreById(id: string): SessionStoreDetails | null {
  return SessionStoresDao.getById(id) ?? null;
}

export function confirmSessionStoreVisit(sessionStoreId: string): void {
  getDb().withTransactionSync(() => {
    SessionStoresDao.markVisited(sessionStoreId);
    enqueueOutbox({
      entityType: "session_store",
      entityId: sessionStoreId,
      operation: "update",
      payload: { id: sessionStoreId, visited: true },
    });
  });
}
