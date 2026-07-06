import { getDb } from "@/src/lib/db";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import StoresDao from "@/src/lib/dao/store-dao";
import { generateUUID } from "@/src/lib/uuid";
import { supabase } from "@/src/lib/supabase";
import { getPhTime } from "@/src/shared/helpers/getPhTime";
import { insertRouteSession } from "./route-session-create-service";
import { insertSessionStore } from "./session-store-save-service";
import { enqueueOutbox } from "@/src/lib/sync/outbox";

export class OngoingSessionExistsError extends Error {
  constructor() {
    super("An ongoing session already exists");
    this.name = "OngoingSessionExistsError";
  }
}

export async function startSession(
  routeId: string,
  routeName: string,
): Promise<string> {
  const sessionDate = getPhTime().toISOString().split("T")[0];

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const conductedBy = session?.user?.id;
  if (!conductedBy) throw new Error("User not authenticated");

  if (RouteSessionsDao.getOngoing()) throw new OngoingSessionExistsError();

  const sessionId = generateUUID();

  const stores = StoresDao.getStoresForRoute(routeId);

  if (stores.length === 0) throw new Error("No stores on this route");

  const createdAt = getPhTime().toISOString();

  getDb().withTransactionSync(() => {
    insertRouteSession({
      sessionId,
      routeName,
      sessionDate,
      conductedBy,
      createdAt,
    });
    for (const store of stores) {
      insertSessionStore({ sessionId, store, createdAt });
    }
  });

  return sessionId;
}

export function completeSession(sessionId: string): void {
  getDb().withTransactionSync(() => {
    RouteSessionsDao.complete(sessionId);
    const row = RouteSessionsDao.getById(sessionId);
    if (row) {
      enqueueOutbox({
        entityType: "route_session",
        entityId: sessionId,
        operation: "create", // upsert the full, now-completed row
        payload: row,
      });
    }
  });
}

export function cancelSession(sessionId: string): void {
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
