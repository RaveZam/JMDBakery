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

  confirmSessionStoreVisit(sessionStoreId, "cash", 750);

  const row = getDb().getFirstSync<{ visited: number; payment_type: string }>(
    "SELECT visited, payment_type FROM session_stores WHERE id = ?",
    [sessionStoreId],
  );
  expect(row?.visited).toBe(1);
  expect(row?.payment_type).toBe("cash");
  expect(latestOutboxFor(sessionStoreId)).toEqual({
    entity_type: "session_store",
    operation: "update",
    payload: { id: sessionStoreId, visited: true, payment_type: "cash" },
  });
});

test("confirmSessionStoreVisit as credit records a store_credit_entries row and enqueues it", () => {
  const { sessionStoreId, storeId } = seedVisit();

  confirmSessionStoreVisit(sessionStoreId, "credit", 750);

  const row = getDb().getFirstSync<{
    id: string;
    store_id: string;
    entry_type: string;
    amount: number;
  }>(
    "SELECT id, store_id, entry_type, amount FROM store_credit_entries WHERE session_store_id = ?",
    [sessionStoreId],
  );
  expect(row).toMatchObject({
    store_id: storeId,
    entry_type: "credit",
    amount: 750,
  });

  expect(latestOutboxFor(row!.id)).toMatchObject({
    entity_type: "store_credit_entry",
    operation: "create",
    payload: {
      store_id: storeId,
      session_store_id: sessionStoreId,
      entry_type: "credit",
      amount: 750,
    },
  });
});

test("confirmSessionStoreVisit as credit with zero net total writes no credit entry", () => {
  const { sessionStoreId } = seedVisit();

  confirmSessionStoreVisit(sessionStoreId, "credit", 0);

  const row = getDb().getFirstSync(
    "SELECT id FROM store_credit_entries WHERE session_store_id = ?",
    [sessionStoreId],
  );
  expect(row).toBeNull();
});

test("flipping a credit visit back to cash removes the credit entry and enqueues its delete", () => {
  const { sessionStoreId } = seedVisit();

  confirmSessionStoreVisit(sessionStoreId, "credit", 750);
  const entry = getDb().getFirstSync<{ id: string }>(
    "SELECT id FROM store_credit_entries WHERE session_store_id = ?",
    [sessionStoreId],
  );
  expect(entry).not.toBeNull();

  confirmSessionStoreVisit(sessionStoreId, "cash", 0);

  const rowAfter = getDb().getFirstSync(
    "SELECT id FROM store_credit_entries WHERE session_store_id = ?",
    [sessionStoreId],
  );
  expect(rowAfter).toBeNull();
  expect(latestOutboxFor(entry!.id)).toEqual({
    entity_type: "store_credit_entry",
    operation: "delete",
    payload: { id: entry!.id },
  });
});
