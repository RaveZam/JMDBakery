import { describe, expect, test } from "vitest";
import { attachCreditToStores } from "../core/attachCreditToStores";
import type { GroupedStoreRow, StoreCredit } from "../types/store-types";

function makeStore(overrides: Partial<GroupedStoreRow> = {}): GroupedStoreRow {
  return {
    id: "store-1",
    storeName: "Store A",
    contactNumber: null,
    contactName: null,
    province: "Cebu",
    city: "Cebu City",
    barangay: "Lahug",
    createdAt: "2026-07-15T09:00:00Z",
    totalRevenue: 0,
    memberIds: ["store-1"],
    ...overrides,
  };
}

function makeCredit(overrides: Partial<StoreCredit> = {}): StoreCredit {
  return {
    storeId: "store-1",
    creditTaken: 0,
    paidBack: 0,
    balance: 0,
    lastPaymentAt: null,
    ...overrides,
  };
}

describe("attachCreditToStores", () => {
  test("sums credit across every merged memberIds", () => {
    const store = makeStore({ id: "store-1", memberIds: ["store-1", "store-1-dup"] });
    const credits = [
      makeCredit({
        storeId: "store-1",
        creditTaken: 5000,
        paidBack: 2000,
        balance: 3000,
        lastPaymentAt: "2026-08-01T00:00:00Z",
      }),
      makeCredit({
        storeId: "store-1-dup",
        creditTaken: 1000,
        paidBack: 1000,
        balance: 0,
        lastPaymentAt: "2026-08-05T00:00:00Z",
      }),
    ];

    const [result] = attachCreditToStores([store], credits);

    expect(result.creditTaken).toBe(6000);
    expect(result.paidBack).toBe(3000);
    expect(result.balance).toBe(3000);
    expect(result.lastPaymentAt).toBe("2026-08-05T00:00:00Z");
  });

  test("store with no matching entries gets zeros", () => {
    const store = makeStore({ id: "store-2", memberIds: ["store-2"] });

    const [result] = attachCreditToStores([store], []);

    expect(result.creditTaken).toBe(0);
    expect(result.paidBack).toBe(0);
    expect(result.balance).toBe(0);
    expect(result.lastPaymentAt).toBeNull();
  });
});
