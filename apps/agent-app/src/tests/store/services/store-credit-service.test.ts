import {
  createSchema,
  resetDb,
  seedRoute,
  seedProvince,
  seedStore,
  seedRouteSession,
  seedSessionStore,
  TEST_AGENT_ID,
} from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import {
  getCreditEntriesForStore,
  getCreditEntryItems,
  recordStorePayment,
  syncVisitCredit,
} from "@/src/features/store/services/store-credit-service";
import {
  addSale,
  removeSale,
} from "@/src/features/store/services/sales-services";
import { computeCreditBalance } from "@/src/features/store/core/compute-credit-balance";
import { setCurrentUserName } from "@/src/lib/current-user";

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

/** Log one order worth `amount` against a visit, priced as a single unit. */
function seedOrder(
  sessionStoreId: string,
  amount: number,
  paymentType: "cash" | "credit",
  productId = "prod-1",
) {
  addSale({
    sessionStoreId,
    productId,
    productName: "Pandesal",
    price: amount,
    qty: 1,
    boQty: 0,
    boReason: "",
    paymentType,
  });
}

function creditEntryFor(storeId: string) {
  return getCreditEntriesForStore(storeId).find(
    (entry) => entry.entryType === "credit",
  );
}

test("getCreditEntriesForStore returns nothing for a store with no history", () => {
  expect(getCreditEntriesForStore("unknown-store")).toEqual([]);
});

test("logging a credit order records what the visit owes", () => {
  const { sessionStoreId, storeId } = seedVisit();

  seedOrder(sessionStoreId, 750, "credit");

  const entries = getCreditEntriesForStore(storeId);
  expect(entries).toHaveLength(1);
  expect(entries[0]).toMatchObject({
    storeId,
    sessionStoreId,
    entryType: "credit",
    amount: 750,
  });
});

test("a second credit order raises the same entry instead of adding another", () => {
  const { sessionStoreId, storeId } = seedVisit();

  seedOrder(sessionStoreId, 750, "credit");
  seedOrder(sessionStoreId, 150, "credit", "prod-2");

  const entries = getCreditEntriesForStore(storeId);
  expect(entries).toHaveLength(1);
  expect(entries[0].amount).toBe(900);
});

test("a mixed visit owes only its credit orders", () => {
  const { sessionStoreId, storeId } = seedVisit();

  seedOrder(sessionStoreId, 250, "credit");
  seedOrder(sessionStoreId, 500, "cash", "prod-2");

  expect(creditEntryFor(storeId)!.amount).toBe(250);
});

test("logging a cash order does not wipe an existing debt", () => {
  // The bug this whole design exists to prevent: the payment type used to live
  // on the visit, so a later cash order rewrote it and the debt vanished.
  const { sessionStoreId, storeId } = seedVisit();

  seedOrder(sessionStoreId, 750, "credit");
  seedOrder(sessionStoreId, 300, "cash", "prod-2");

  expect(creditEntryFor(storeId)!.amount).toBe(750);
});

test("a later order keeps the timestamp from when the debt was first recorded", () => {
  const { sessionStoreId, storeId } = seedVisit();

  seedOrder(sessionStoreId, 750, "credit");
  const firstCreatedAt = creditEntryFor(storeId)!.createdAt;

  seedOrder(sessionStoreId, 150, "credit", "prod-2");

  expect(creditEntryFor(storeId)!.createdAt).toBe(firstCreatedAt);
});

test("deleting the last credit order clears the entry", () => {
  const { sessionStoreId, storeId } = seedVisit();

  seedOrder(sessionStoreId, 750, "credit");

  const sale = getDb().getFirstSync<{ id: string }>(
    "SELECT id FROM sales WHERE session_store_id = ?",
    [sessionStoreId],
  );
  removeSale(sale!.id);
  expect(getCreditEntriesForStore(storeId)).toEqual([]);
});

test("an all-cash visit records no credit, however much is ordered", () => {
  const { sessionStoreId, storeId } = seedVisit();

  seedOrder(sessionStoreId, 750, "cash");

  expect(getCreditEntriesForStore(storeId)).toEqual([]);
});

test("getCreditEntryItems lists only the credit lines of a mixed visit", () => {
  const { sessionStoreId } = seedVisit();

  seedOrder(sessionStoreId, 250, "credit");
  seedOrder(sessionStoreId, 500, "cash", "prod-2");

  const items = getCreditEntryItems(sessionStoreId);
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({ productId: "prod-1", price: 250 });
});

test("syncVisitCredit does nothing for an unknown visit", () => {
  expect(() => syncVisitCredit("missing-id")).not.toThrow();
  expect(getCreditEntriesForStore("unknown-store")).toEqual([]);
});

function seedCreditVisit(creditTotal: number, sessionId?: string) {
  const routeId = seedRoute();
  const provinceId = seedProvince(routeId);
  const storeId = seedStore(provinceId);
  const session = sessionId ?? seedRouteSession();
  const sessionStoreId = seedSessionStore(session, storeId, provinceId);

  seedOrder(sessionStoreId, creditTotal, "credit");

  return { sessionStoreId, storeId };
}

function outboxPayloadsFor(entityId: string) {
  return getDb()
    .getAllSync<{
      payload: string;
    }>(`SELECT payload FROM outbox WHERE entity_id = ?`, [entityId])
    .map((row) => JSON.parse(row.payload));
}

test("recordStorePayment writes a payment entry against the store's balance", () => {
  setCurrentUserName("Raven");
  const { sessionStoreId, storeId } = seedCreditVisit(750);

  recordStorePayment({ sessionStoreId, amount: 500 });

  const payment = getCreditEntriesForStore(storeId).find(
    (entry) => entry.entryType === "payment",
  );
  expect(payment).toMatchObject({
    storeId,
    sessionStoreId: null,
    entryType: "payment",
    amount: 500,
    recordedByName: "Raven",
  });
});

test("a payment brings the outstanding balance down", () => {
  setCurrentUserName("Raven");
  const { sessionStoreId, storeId } = seedCreditVisit(750);

  recordStorePayment({ sessionStoreId, amount: 500 });

  expect(computeCreditBalance(getCreditEntriesForStore(storeId))).toBe(250);
});

test("a payment is queued for push", () => {
  setCurrentUserName("Raven");
  const { sessionStoreId, storeId } = seedCreditVisit(750);

  recordStorePayment({ sessionStoreId, amount: 500 });

  const payment = getCreditEntriesForStore(storeId).find(
    (entry) => entry.entryType === "payment",
  );
  expect(outboxPayloadsFor(payment!.id)[0]).toMatchObject({
    id: payment!.id,
    store_id: storeId,
    session_store_id: null,
    entry_type: "payment",
    amount: 500,
  });
});

test("the pushed payment names the collector when another agent ran the session", () => {
  setCurrentUserName("Raven");
  const sessionId = seedRouteSession("South Route", "user-2", "Juan");
  const { sessionStoreId, storeId } = seedCreditVisit(750, sessionId);

  recordStorePayment({ sessionStoreId, amount: 500 });

  const payment = getCreditEntriesForStore(storeId).find(
    (entry) => entry.entryType === "payment",
  );
  expect(outboxPayloadsFor(payment!.id)[0]).toMatchObject({
    recorded_by: TEST_AGENT_ID,
    tendered_by: "user-2",
    tendered_by_name: "Juan",
  });
});

test("the pushed payment omits the collector when the recorder took the cash", () => {
  setCurrentUserName("Raven");
  const { sessionStoreId, storeId } = seedCreditVisit(750);

  recordStorePayment({ sessionStoreId, amount: 500 });

  const payment = getCreditEntriesForStore(storeId).find(
    (entry) => entry.entryType === "payment",
  );
  expect(outboxPayloadsFor(payment!.id)[0]).not.toHaveProperty("tendered_by");
});

test("recordStorePayment writes nothing when the store owes nothing", () => {
  setCurrentUserName("Raven");
  const routeId = seedRoute();
  const provinceId = seedProvince(routeId);
  const storeId = seedStore(provinceId);
  const sessionStoreId = seedSessionStore(
    seedRouteSession(),
    storeId,
    provinceId,
  );

  recordStorePayment({ sessionStoreId, amount: 500 });

  expect(getCreditEntriesForStore(storeId)).toEqual([]);
});

test("recordStorePayment writes nothing for an amount of zero", () => {
  setCurrentUserName("Raven");
  const { sessionStoreId, storeId } = seedCreditVisit(750);

  recordStorePayment({ sessionStoreId, amount: 0 });

  expect(getCreditEntriesForStore(storeId)).toHaveLength(1);
});
