import { allocateCreditPayments } from "@/src/features/store/core/allocate-credit-payments";
import type { CreditEntry } from "@/src/features/store/types/store-types";

function credit(id: string, amount: number, createdAt: string): CreditEntry {
  return {
    id,
    storeId: "store-9",
    sessionStoreId: `sstore-${id}`,
    entryType: "credit",
    amount,
    note: null,
    recordedBy: "agent-1",
    recordedByName: "Raven",
    createdAt,
  };
}

function payment(id: string, amount: number, createdAt: string): CreditEntry {
  return {
    id,
    storeId: "store-9",
    sessionStoreId: null,
    entryType: "payment",
    amount,
    note: null,
    recordedBy: "agent-1",
    recordedByName: "Raven",
    createdAt,
  };
}

const MONDAY = "2026-08-03T01:00:00.000Z";
const TUESDAY = "2026-08-04T01:00:00.000Z";
const WEDNESDAY = "2026-08-05T01:00:00.000Z";

test("a store that has never paid owes every credit in full", () => {
  const remaining = allocateCreditPayments([
    credit("a", 750, MONDAY),
    credit("b", 400, TUESDAY),
  ]);

  expect(remaining).toEqual({ a: 750, b: 400 });
});

test("a payment settles the oldest credit first", () => {
  const remaining = allocateCreditPayments([
    credit("a", 750, MONDAY),
    credit("b", 400, TUESDAY),
    payment("c", 500, WEDNESDAY),
  ]);

  expect(remaining).toEqual({ a: 250, b: 400 });
});

test("payments spill over into newer credits once the oldest is settled", () => {
  const remaining = allocateCreditPayments([
    credit("a", 750, MONDAY),
    credit("b", 400, TUESDAY),
    payment("c", 900, WEDNESDAY),
  ]);

  expect(remaining).toEqual({ a: 0, b: 250 });
});

test("several payments pool together", () => {
  const remaining = allocateCreditPayments([
    credit("a", 750, MONDAY),
    payment("b", 300, TUESDAY),
    payment("c", 450, WEDNESDAY),
  ]);

  expect(remaining).toEqual({ a: 0 });
});

test("paying more than is owed leaves every credit settled", () => {
  const remaining = allocateCreditPayments([
    credit("a", 750, MONDAY),
    payment("b", 1000, TUESDAY),
  ]);

  expect(remaining).toEqual({ a: 0 });
});

test("allocation order does not depend on the order the entries arrive in", () => {
  const entries = [
    credit("b", 400, TUESDAY),
    payment("c", 500, WEDNESDAY),
    credit("a", 750, MONDAY),
  ];

  expect(allocateCreditPayments(entries)).toEqual({ a: 250, b: 400 });
});

test("entries recorded in the same instant settle in a stable order", () => {
  const first = allocateCreditPayments([
    credit("a", 300, MONDAY),
    credit("b", 300, MONDAY),
    payment("c", 300, TUESDAY),
  ]);
  const reversed = allocateCreditPayments([
    credit("b", 300, MONDAY),
    credit("a", 300, MONDAY),
    payment("c", 300, TUESDAY),
  ]);

  expect(first).toEqual(reversed);
  expect(first).toEqual({ a: 0, b: 300 });
});

test("payment entries are not themselves debts", () => {
  const remaining = allocateCreditPayments([payment("c", 500, WEDNESDAY)]);

  expect(remaining).toEqual({});
});

test("does not mutate the entries it is given", () => {
  const entries = [credit("b", 400, TUESDAY), credit("a", 750, MONDAY)];

  allocateCreditPayments(entries);

  expect(entries.map((entry) => entry.id)).toEqual(["b", "a"]);
});
