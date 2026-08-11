import { describe, expect, test } from "vitest";
import { computeProvinceRanking } from "../computeProvinceRanking";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";

function makeRecord(overrides: Partial<SalesRecord> = {}): SalesRecord {
  return {
    id: "sale-1",
    sessionId: "session-1",
    date: "2026-07-15",
    createdAt: "2026-07-15T09:00:00Z",
    agent: "Ana",
    store: "Store A",
    province: "Cebu",
    product: "Pandesal",
    soldQty: 10,
    boQty: 0,
    unitPrice: 10,
    total: 100,
    boReason: null,
    paymentType: "cash",
    ...overrides,
  };
}

describe("computeProvinceRanking", () => {
  test("sums revenue by province and sorts strongest first", () => {
    const records = [
      makeRecord({ province: "Cebu", total: 100 }),
      makeRecord({ province: "Cebu", total: 50 }),
      makeRecord({ province: "Bohol", total: 200 }),
    ];

    expect(computeProvinceRanking(records)).toEqual([
      { province: "Bohol", revenue: 200 },
      { province: "Cebu", revenue: 150 },
    ]);
  });

  test("groups a missing province under Unknown", () => {
    const records = [makeRecord({ province: "", total: 75 })];

    expect(computeProvinceRanking(records)).toEqual([
      { province: "Unknown", revenue: 75 },
    ]);
  });

  test("returns an empty list for no records", () => {
    expect(computeProvinceRanking([])).toEqual([]);
  });
});
