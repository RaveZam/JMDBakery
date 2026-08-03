import {
  createSchema,
  resetDb,
  seedRoute,
  seedProvince,
  seedStore,
  seedRouteSession,
  seedSessionStore,
} from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import {
  applyVisitCredit,
  getCreditEntriesForStore,
} from "@/src/features/store/services/store-credit-service";

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
