import { describe, expect, test } from "vitest";
import { computeBoRateByKey } from "../computeBoRateByKey";
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

describe("computeBoRateByKey", () => {
  test("groups sold/bo quantities by the given key and computes the bo rate", () => {
    const records = [
      makeRecord({ product: "Pandesal", soldQty: 80, boQty: 20 }),
      makeRecord({ product: "Pandesal", soldQty: 0, boQty: 0 }),
      makeRecord({ product: "Ensaymada", soldQty: 90, boQty: 10 }),
    ];

    const rows = computeBoRateByKey(records, (r) => r.product);

    expect(rows).toEqual([
      { key: "Pandesal", sold: 80, bo: 20, boRatePct: 20 },
      { key: "Ensaymada", sold: 90, bo: 10, boRatePct: 10 },
    ]);
  });

  test("sorts worst bo rate first", () => {
    const records = [
      makeRecord({ product: "Low", soldQty: 95, boQty: 5 }),
      makeRecord({ product: "High", soldQty: 50, boQty: 50 }),
      makeRecord({ product: "Mid", soldQty: 75, boQty: 25 }),
    ];

    const rows = computeBoRateByKey(records, (r) => r.product);

    expect(rows.map((r) => r.key)).toEqual(["High", "Mid", "Low"]);
  });

  test("returns a 0% rate for a group with no sold or bo units", () => {
    const records = [makeRecord({ product: "Idle", soldQty: 0, boQty: 0 })];

    expect(computeBoRateByKey(records, (r) => r.product)[0].boRatePct).toBe(0);
  });

  test("caps the ranking at 5 rows", () => {
    const records = Array.from({ length: 8 }, (_, i) =>
      makeRecord({ product: `Product ${i}`, soldQty: 90 - i, boQty: 10 + i }),
    );

    expect(computeBoRateByKey(records, (r) => r.product)).toHaveLength(5);
  });

  test("returns an empty list for no records", () => {
    expect(computeBoRateByKey([], (r) => r.product)).toEqual([]);
  });
});
