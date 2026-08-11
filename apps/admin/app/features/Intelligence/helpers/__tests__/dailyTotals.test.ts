import { describe, expect, test } from "vitest";
import { toDailyTotals } from "../dailyTotals";
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

describe("toDailyTotals", () => {
  test("sums revenue for records sharing the same date", () => {
    const records = [
      makeRecord({ date: "2026-07-15", total: 100 }),
      makeRecord({ date: "2026-07-15", total: 50 }),
    ];

    expect(toDailyTotals(records)).toEqual([{ date: "2026-07-15", revenue: 150 }]);
  });

  test("sorts results chronologically regardless of input order", () => {
    const records = [
      makeRecord({ date: "2026-07-16", total: 10 }),
      makeRecord({ date: "2026-07-14", total: 10 }),
      makeRecord({ date: "2026-07-15", total: 10 }),
    ];

    expect(toDailyTotals(records).map((d) => d.date)).toEqual([
      "2026-07-14",
      "2026-07-15",
      "2026-07-16",
    ]);
  });

  test("returns an empty list for no records", () => {
    expect(toDailyTotals([])).toEqual([]);
  });
});
