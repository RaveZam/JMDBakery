import { describe, expect, test } from "vitest";
import { computeBoReasonRanking } from "../computeBoReasonRanking";
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
    boQty: 5,
    unitPrice: 10,
    total: 100,
    boReason: "Rotten",
    paymentType: "cash",
    ...overrides,
  };
}

describe("computeBoReasonRanking", () => {
  test("sums bo units by reason and shares them against the total", () => {
    const records = [
      makeRecord({ boReason: "Rotten", boQty: 15 }),
      makeRecord({ boReason: "Damaged", boQty: 5 }),
    ];

    const rows = computeBoReasonRanking(records);

    expect(rows).toEqual([
      { reason: "Rotten", bo: 15, sharePct: 75 },
      { reason: "Damaged", bo: 5, sharePct: 25 },
    ]);
  });

  test("ignores rows with no bo units, even if a reason is set", () => {
    const records = [makeRecord({ boQty: 0, boReason: "Rotten" })];

    expect(computeBoReasonRanking(records)).toEqual([]);
  });

  test("ignores bo units with a blank or missing reason", () => {
    const records = [
      makeRecord({ boQty: 5, boReason: null }),
      makeRecord({ boQty: 5, boReason: "   " }),
    ];

    expect(computeBoReasonRanking(records)).toEqual([]);
  });

  test("normalizes casing/whitespace of preset reasons to their canonical form", () => {
    const records = [
      makeRecord({ boReason: "  rotten  ", boQty: 4 }),
      makeRecord({ boReason: "ROTTEN", boQty: 6 }),
    ];

    const rows = computeBoReasonRanking(records);

    expect(rows).toEqual([{ reason: "Rotten", bo: 10, sharePct: 100 }]);
  });

  test("keeps a free-text reason as-is, only trimmed", () => {
    const records = [makeRecord({ boReason: "  Truck delay  ", boQty: 3 })];

    expect(computeBoReasonRanking(records)[0].reason).toBe("Truck delay");
  });

  test("sorts by units lost, worst first, and caps at 5 reasons", () => {
    const reasons = ["A", "B", "C", "D", "E", "F"];
    const records = reasons.map((reason, i) =>
      makeRecord({ boReason: reason, boQty: i + 1 }),
    );

    const rows = computeBoReasonRanking(records);

    expect(rows).toHaveLength(5);
    expect(rows[0].reason).toBe("F");
    expect(rows.map((r) => r.bo)).toEqual([6, 5, 4, 3, 2]);
  });
});
