import { buildStorePaymentEntry } from "@/src/features/store/core/build-store-payment-entry";

const CREATED_AT = "2026-08-03T00:00:00.000Z";

function input(
  overrides: Partial<Parameters<typeof buildStorePaymentEntry>[0]> = {},
) {
  return {
    id: "entry-1",
    storeId: "store-9",
    amount: 500,
    outstandingBalance: 1150,
    recordedBy: "user-1",
    recordedByName: "Raven",
    tenderedBy: "user-1",
    tenderedByName: "Raven",
    createdAt: CREATED_AT,
    ...overrides,
  };
}

test("builds a payment entry for an amount against an outstanding balance", () => {
  expect(buildStorePaymentEntry(input())).toEqual({
    id: "entry-1",
    storeId: "store-9",
    sessionStoreId: null,
    entryType: "payment",
    amount: 500,
    recordedBy: "user-1",
    recordedByName: "Raven",
    tenderedBy: null,
    tenderedByName: null,
    createdAt: CREATED_AT,
  });
});

test("keeps the collector when a different agent took the cash", () => {
  const entry = buildStorePaymentEntry(
    input({ tenderedBy: "user-2", tenderedByName: "Juan" }),
  );

  expect(entry).toMatchObject({
    recordedBy: "user-1",
    tenderedBy: "user-2",
    tenderedByName: "Juan",
  });
});

test("drops the collector when it is the same person who recorded it", () => {
  expect(buildStorePaymentEntry(input())).toMatchObject({
    tenderedBy: null,
    tenderedByName: null,
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

test("a payment is never tied to a visit", () => {
  expect(buildStorePaymentEntry(input())?.sessionStoreId).toBeNull();
});
