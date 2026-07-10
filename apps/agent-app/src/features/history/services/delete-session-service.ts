import { getDb } from "@/src/lib/db";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import { enqueueOutbox } from "@/src/lib/sync/outbox";

export class CompletedSessionNotDeletableError extends Error {
  constructor() {
    super("A completed session cannot be deleted");
    this.name = "CompletedSessionNotDeletableError";
  }
}

export function deleteHistorySession(sessionId: string): void {
  const row = RouteSessionsDao.getById(sessionId);
  if (row?.status === "completed") throw new CompletedSessionNotDeletableError();

  getDb().withTransactionSync(() => {
    RouteSessionsDao.delete(sessionId);
    enqueueOutbox({
      entityType: "route_session",
      entityId: sessionId,
      operation: "update",
      payload: { id: sessionId, deleted_at: new Date().toISOString() },
    });
  });
}
