import { computeCreditBalance } from "@/src/features/store/core/compute-credit-balance";
import type { CreditEntry } from "@/src/features/store/types/store-types";

function entry(overrides: Partial<CreditEntry>): CreditEntry {
  return {
    id: "e1",
    storeId: "store-1",
    sessionStoreId: null,
    entryType: "credit",
    amount: 0,
    note: null,
    recordedBy: "agent-1",
    recordedByName: "Raven",
    createdAt: "2026-07-28T00:00:00.000Z",
    ...overrides,
  };
}

test("no entries means no balance", () => {
  expect(computeCreditBalance([])).toBe(0);
});

test("credits add to the balance, payments subtract from it", () => {
  const entries = [
    entry({ entryType: "credit", amount: 1000 }),
    entry({ entryType: "payment", amount: 500 }),
    entry({ entryType: "credit", amount: 750 }),
  ];
  expect(computeCreditBalance(entries)).toBe(1250);
});
