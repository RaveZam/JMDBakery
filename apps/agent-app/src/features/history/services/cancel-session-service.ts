import { getDb } from "@/src/lib/db";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import { enqueueOutbox } from "@/src/lib/sync/outbox";

export function cancelHistorySession(sessionId: string): void {
  getDb().withTransactionSync(() => {
    RouteSessionsDao.cancel(sessionId);
    const row = RouteSessionsDao.getById(sessionId);
    if (row) {
      enqueueOutbox({
        entityType: "route_session",
        entityId: sessionId,
        operation: "create", // upsert the full, now-cancelled row
        payload: row,
      });
    }
  });
}
