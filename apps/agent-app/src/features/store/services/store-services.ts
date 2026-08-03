import { getDb } from "@/src/lib/db";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import { getPhTime } from "@/src/shared/helpers/getPhTime";
import { applyVisitCredit } from "./store-credit-service";
import type { SessionStoreDetails } from "../types/store-types";

export function getSessionStoreById(id: string): SessionStoreDetails | null {
  return SessionStoresDao.getById(id) ?? null;
}

export function confirmSessionStoreVisit(
  sessionStoreId: string,
  paymentType: "cash" | "credit",
  netTotal: number,
): void {
  getDb().withTransactionSync(() => {
    SessionStoresDao.markVisited(sessionStoreId);
    SessionStoresDao.setPaymentType(sessionStoreId, paymentType);
    enqueueOutbox({
      entityType: "session_store",
      entityId: sessionStoreId,
      operation: "update",
      payload: { id: sessionStoreId, visited: true, payment_type: paymentType },
    });

    const sessionStore = SessionStoresDao.getById(sessionStoreId);
    if (!sessionStore) return;

    const session = RouteSessionsDao.getById(sessionStore.route_session_id);
    if (!session) return;

    applyVisitCredit({
      sessionStoreId,
      storeId: sessionStore.store_id,
      paymentType,
      netTotal,
      recordedBy: session.conducted_by,
      recordedByName: session.conducted_by_name ?? "Unknown",
      createdAt: getPhTime().toISOString(),
    });
  });
}
