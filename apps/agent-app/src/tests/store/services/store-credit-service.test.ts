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
  applyVisitCredit,
  getCreditEntriesForStore,
  recordStorePayment,
} from "@/src/features/store/services/store-credit-service";
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

const CREATED_AT = "2026-07-28T00:00:00.000Z";

test("getCreditEntriesForStore returns nothing for a store with no history", () => {
  expect(getCreditEntriesForStore("unknown-store")).toEqual([]);
});

test("applyVisitCredit writes a credit entry for a credit visit", () => {
  const { sessionStoreId, storeId } = seedVisit();

  getDb().withTransactionSync(() => {
    applyVisitCredit({
      sessionStoreId,
      storeId,
      paymentType: "credit",
      netTotal: 750,
      recordedBy: "user-1",
      recordedByName: "Raven",
      createdAt: CREATED_AT,
    });
  });

  const entries = getCreditEntriesForStore(storeId);
  expect(entries).toHaveLength(1);
  expect(entries[0]).toMatchObject({
    storeId,
    sessionStoreId,
    entryType: "credit",
    amount: 750,
    recordedByName: "Raven",
  });
});

test("re-applying the same visit updates the existing entry instead of duplicating", () => {
  const { sessionStoreId, storeId } = seedVisit();

  getDb().withTransactionSync(() => {
    applyVisitCredit({
      sessionStoreId,
      storeId,
      paymentType: "credit",
      netTotal: 750,
      recordedBy: "user-1",
      recordedByName: "Raven",
      createdAt: CREATED_AT,
    });
  });
  getDb().withTransactionSync(() => {
    applyVisitCredit({
      sessionStoreId,
      storeId,
      paymentType: "credit",
      netTotal: 900,
      recordedBy: "user-1",
      recordedByName: "Raven",
      createdAt: CREATED_AT,
    });
  });

  const entries = getCreditEntriesForStore(storeId);
  expect(entries).toHaveLength(1);
  expect(entries[0].amount).toBe(900);
});

test("applying cash after a credit entry exists deletes it", () => {
  const { sessionStoreId, storeId } = seedVisit();

  getDb().withTransactionSync(() => {
    applyVisitCredit({
      sessionStoreId,
      storeId,
      paymentType: "credit",
      netTotal: 750,
      recordedBy: "user-1",
      recordedByName: "Raven",
      createdAt: CREATED_AT,
    });
  });
  getDb().withTransactionSync(() => {
    applyVisitCredit({
      sessionStoreId,
      storeId,
      paymentType: "cash",
      netTotal: 750,
      recordedBy: "user-1",
      recordedByName: "Raven",
      createdAt: CREATED_AT,
    });
  });

  expect(getCreditEntriesForStore(storeId)).toEqual([]);
});

function seedCreditVisit(netTotal: number, sessionId?: string) {
  const routeId = seedRoute();
  const provinceId = seedProvince(routeId);
  const storeId = seedStore(provinceId);
  const session = sessionId ?? seedRouteSession();
  const sessionStoreId = seedSessionStore(session, storeId, provinceId);

  getDb().withTransactionSync(() => {
    applyVisitCredit({
      sessionStoreId,
      storeId,
      paymentType: "credit",
      netTotal,
      recordedBy: TEST_AGENT_ID,
      recordedByName: "Raven",
      createdAt: CREATED_AT,
    });
  });

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
