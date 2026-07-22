import { describe, expect, test } from "vitest";
import { computeRecordsSummary } from "../helpers/computeRecordsSummary";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";

function makeRecord(overrides: Partial<SalesRecord> = {}): SalesRecord {
  return {
    id: "record-1",
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
    ...overrides,
  };
}

describe("computeRecordsSummary", () => {
  test("counts rows and sums sold and bad-order quantities", () => {
    const records = [
      makeRecord({ soldQty: 10, boQty: 2 }),
      makeRecord({ soldQty: 5, boQty: 0 }),
      makeRecord({ soldQty: 15, boQty: 3 }),
    ];

    const summary = computeRecordsSummary(records);

    expect(summary.totalRecords).toBe(3);
    expect(summary.totalSoldQty).toBe(30);
    expect(summary.totalBoQty).toBe(5);
  });

  test("expresses BO rate as a percentage of all units handled", () => {
    const records = [makeRecord({ soldQty: 75, boQty: 25 })];

    expect(computeRecordsSummary(records).boRate).toBe(25);
  });

  test("reports a full BO rate when nothing sold", () => {
    const records = [makeRecord({ soldQty: 0, boQty: 8 })];

    expect(computeRecordsSummary(records).boRate).toBe(100);
  });

  test("returns zeroes for an empty list without dividing by zero", () => {
    expect(computeRecordsSummary([])).toEqual({
      totalRecords: 0,
      totalSoldQty: 0,
      totalBoQty: 0,
      boRate: 0,
    });
  });

  test("keeps BO rate at zero when no units moved at all", () => {
    const records = [makeRecord({ soldQty: 0, boQty: 0 })];

    const summary = computeRecordsSummary(records);

    expect(summary.totalRecords).toBe(1);
    expect(summary.boRate).toBe(0);
  });
});
