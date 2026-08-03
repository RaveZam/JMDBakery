import { buildVisitCreditEntry } from "@/src/features/store/core/build-visit-credit-entry";

const BASE = {
  id: "entry-1",
  sessionStoreId: "session-store-1",
  storeId: "store-1",
  recordedBy: "user-1",
  recordedByName: "Raven",
  createdAt: "2026-07-28T00:00:00.000Z",
};

test("cash visits write no credit entry", () => {
  expect(
    buildVisitCreditEntry({ ...BASE, paymentType: "cash", netTotal: 750 }),
  ).toBeNull();
});

test("a credit visit with nothing owed writes no entry", () => {
  expect(
    buildVisitCreditEntry({ ...BASE, paymentType: "credit", netTotal: 0 }),
  ).toBeNull();
  expect(
    buildVisitCreditEntry({ ...BASE, paymentType: "credit", netTotal: -5 }),
  ).toBeNull();
});

test("a credit visit with a positive net total builds a credit entry", () => {
  expect(
    buildVisitCreditEntry({ ...BASE, paymentType: "credit", netTotal: 750 }),
  ).toEqual({
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

test("reuses the given id, so re-confirming a visit updates instead of duplicating", () => {
  const entry = buildVisitCreditEntry({
    ...BASE,
    id: "existing-entry",
    paymentType: "credit",
    netTotal: 500,
  });
  expect(entry?.id).toBe("existing-entry");
});
