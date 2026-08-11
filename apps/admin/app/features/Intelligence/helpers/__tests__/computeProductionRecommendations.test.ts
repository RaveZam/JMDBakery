import { describe, expect, test } from "vitest";
import { computeProductionRecommendations } from "../computeProductionRecommendations";
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

describe("computeProductionRecommendations", () => {
  test("averages sold and bad-order units per distinct active day", () => {
    const records = [
      makeRecord({ date: "2026-07-01", product: "Pandesal", soldQty: 20, boQty: 2 }),
      makeRecord({ date: "2026-07-02", product: "Pandesal", soldQty: 30, boQty: 4 }),
    ];

    const [rec] = computeProductionRecommendations(records);

    expect(rec.totalSold).toBe(50);
    expect(rec.avgSoldPerDay).toBe(25);
    expect(rec.avgBadOrderPerDay).toBe(3);
    expect(rec.recommended).toBe(25);
  });

  test("rounds the recommended batch to the nearest whole unit", () => {
    const records = [
      makeRecord({ date: "2026-07-01", soldQty: 10 }),
      makeRecord({ date: "2026-07-02", soldQty: 11 }),
      makeRecord({ date: "2026-07-03", soldQty: 10 }),
    ];

    // total 31 over 3 active days = 10.33.. -> rounds to 10
    expect(computeProductionRecommendations(records)[0].recommended).toBe(10);
  });

  test("counts active days once per distinct date, not per record", () => {
    const records = [
      makeRecord({ date: "2026-07-01", soldQty: 10 }),
      makeRecord({ date: "2026-07-01", soldQty: 10 }),
    ];

    expect(computeProductionRecommendations(records)[0].avgSoldPerDay).toBe(20);
  });

  test("sorts by recommended batch size, largest first", () => {
    const records = [
      makeRecord({ date: "2026-07-01", product: "Small", soldQty: 5 }),
      makeRecord({ date: "2026-07-01", product: "Big", soldQty: 50 }),
    ];

    expect(computeProductionRecommendations(records).map((r) => r.product)).toEqual([
      "Big",
      "Small",
    ]);
  });

  test("returns an empty list and does not divide by zero with no records", () => {
    expect(computeProductionRecommendations([])).toEqual([]);
  });
});
