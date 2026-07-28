import { enqueueOutbox } from "@/src/lib/sync/outbox";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import { generateUUID } from "@/src/lib/uuid";

type StoreRef = {
  id: string;
  province_id: string;
};

type InsertSessionStoreInput = {
  sessionId: string;
  store: StoreRef;
  createdAt: string;
};

// Must be called inside a withTransactionSync block — has no transaction of its own.
export function insertSessionStore(input: InsertSessionStoreInput): void {
  const id = generateUUID();
  SessionStoresDao.insert({
    routeSessionId: input.sessionId,
    storeId: input.store.id,
    createdAt: input.createdAt,
    provinceId: input.store.province_id,
    id,
  });
  // province_id stays local. Remotely it is redundant (reachable through
  // store_id) but carries session_stores_province_id_fkey, which rejects any
  // province this device still knows about after it was deleted server-side —
  // stranding the row and every sale that references it.
  enqueueOutbox({
    entityType: "session_store",
    entityId: id,
    operation: "create",
    payload: {
      id,
      route_session_id: input.sessionId,
      store_id: input.store.id,
      visited: false,
      created_at: input.createdAt,
    },
  });
}
