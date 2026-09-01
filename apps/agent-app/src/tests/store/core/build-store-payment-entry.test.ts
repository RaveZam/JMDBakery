import { buildStorePaymentEntry } from "@/src/features/store/core/build-store-payment-entry";

const CREATED_AT = "2026-08-03T00:00:00.000Z";

function input(
  overrides: Partial<Parameters<typeof buildStorePaymentEntry>[0]> = {},
) {
  return {
    id: "entry-1",
    storeId: "store-9",
    sessionStoreId: "session-store-1",
    amount: 500,
    outstandingBalance: 1150,
    recordedBy: "user-1",
    recordedByName: "Raven",
    createdAt: CREATED_AT,
    ...overrides,
  };
}

test("builds a payment entry for an amount against an outstanding balance", () => {
  expect(buildStorePaymentEntry(input())).toEqual({
    id: "entry-1",
    storeId: "store-9",
    sessionStoreId: "session-store-1",
    entryType: "payment",
    amount: 500,
    recordedBy: "user-1",
    recordedByName: "Raven",
    createdAt: CREATED_AT,
  });
});

test("writes nothing for an amount of zero or less", () => {
  expect(buildStorePaymentEntry(input({ amount: 0 }))).toBeNull();
  expect(buildStorePaymentEntry(input({ amount: -50 }))).toBeNull();
});

test("writes nothing when the store owes nothing", () => {
  expect(buildStorePaymentEntry(input({ outstandingBalance: 0 }))).toBeNull();
});

test("does not cap the amount at the balance", () => {
  const entry = buildStorePaymentEntry(
    input({ amount: 800, outstandingBalance: 500 }),
  );

  expect(entry?.amount).toBe(800);
});

test("carries the visit it was collected on", () => {
  expect(buildStorePaymentEntry(input())?.sessionStoreId).toBe(
    "session-store-1",
  );
});
