import { buildVisitCreditEntry } from "@/src/features/store/core/build-visit-credit-entry";

const BASE = {
  id: "entry-1",
  sessionStoreId: "session-store-1",
  storeId: "store-1",
  recordedBy: "user-1",
  recordedByName: "Raven",
  createdAt: "2026-07-28T00:00:00.000Z",
};

test("a visit with no credit orders writes no entry", () => {
  expect(buildVisitCreditEntry({ ...BASE, creditTotal: 0 })).toBeNull();
  expect(buildVisitCreditEntry({ ...BASE, creditTotal: -5 })).toBeNull();
});

test("a positive credit total builds a credit entry for that amount", () => {
  expect(buildVisitCreditEntry({ ...BASE, creditTotal: 750 })).toEqual({
    id: "entry-1",
    storeId: "store-1",
    sessionStoreId: "session-store-1",
    entryType: "credit",
    amount: 750,
    recordedBy: "user-1",
    recordedByName: "Raven",
    createdAt: "2026-07-28T00:00:00.000Z",
  });
});

test("the amount is the credit total, not the visit's whole net total", () => {
  // A stop that took ₱250 on credit and ₱500 in cash owes only the ₱250.
  expect(buildVisitCreditEntry({ ...BASE, creditTotal: 250 })?.amount).toBe(
    250,
  );
});

test("reuses the given id, so re-syncing a visit updates instead of duplicating", () => {
  const entry = buildVisitCreditEntry({
    ...BASE,
    id: "existing-entry",
    creditTotal: 500,
  });
  expect(entry?.id).toBe("existing-entry");
});
