import {
  createSchema,
  resetDb,
  seedRoute,
  seedProvince,
  seedStore,
  seedRouteSession,
  seedSessionStore,
  latestOutboxFor,
} from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import {
  getSessionStoreById,
  confirmSessionStoreVisit,
} from "@/src/features/store/services/store-services";

beforeAll(async () => {
  await createSchema();
});
beforeEach(() => {
  resetDb();
});

function seedVisit() {
  const routeId = seedRoute();
  const provinceId = seedProvince(routeId);
  const storeId = seedStore(provinceId);
  const sessionId = seedRouteSession();
  const sessionStoreId = seedSessionStore(sessionId, storeId, provinceId);
  return { sessionStoreId, storeId };
}

test("getSessionStoreById joins in the store details", () => {
  const { sessionStoreId, storeId } = seedVisit();

  const details = getSessionStoreById(sessionStoreId);

  expect(details).toMatchObject({
    id: sessionStoreId,
    store_id: storeId,
    store_name: "Store A",
    visited: 0,
  });
});

test("getSessionStoreById returns null for an unknown id", () => {
  expect(getSessionStoreById("missing-id")).toBeNull();
});

test("confirmSessionStoreVisit marks the row visited and enqueues the update", () => {
  const { sessionStoreId } = seedVisit();

  confirmSessionStoreVisit(sessionStoreId);

  const row = getDb().getFirstSync<{ visited: number }>(
    "SELECT visited FROM session_stores WHERE id = ?",
    [sessionStoreId],
  );
  expect(row?.visited).toBe(1);
  expect(latestOutboxFor(sessionStoreId)).toEqual({
    entity_type: "session_store",
    operation: "update",
    payload: { id: sessionStoreId, visited: true },
  });
});
