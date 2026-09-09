import { describe, expect, test } from "vitest";
import { computeVarianceTotal } from "../helpers/computeVarianceTotal";
import type { VarianceRecord } from "@/app/server/varianceData/getVarianceDataset";

function makeRecord(overrides: Partial<VarianceRecord> = {}): VarianceRecord {
  return {
    sessionId: "session-1",
    date: "2026-07-15",
    productId: "product-1",
    morning: 10,
    sold: 5,
    boQty: 0,
    endingBo: 0,
    endingBalance: 5,
    expectedBo: 0,
    expectedBalance: 5,
    boVariance: 0,
    balanceVariance: 0,
    ...overrides,
  };
}

describe("computeVarianceTotal", () => {
  test("returns 0 when there is no data", () => {
    expect(computeVarianceTotal([])).toBe(0);
  });

  test("ignores rows where both variances are zero", () => {
    const data = [makeRecord(), makeRecord({ productId: "product-2" })];
    expect(computeVarianceTotal(data)).toBe(0);
  });

  test("sums the absolute balance variance across rows, mixing overages and shortages", () => {
    const data = [
      makeRecord({ productId: "product-1", balanceVariance: 0 }),
      makeRecord({ productId: "product-2", balanceVariance: 3 }),
      makeRecord({ productId: "product-3", balanceVariance: -2 }),
    ];
    expect(computeVarianceTotal(data)).toBe(5);
  });

  test("a bad order miscounted as balance no longer cancels out", () => {
    // 10 expected BO counted as 0, and those same 10 units counted into balance instead.
    const data = [makeRecord({ boVariance: -10, balanceVariance: 10 })];
    expect(computeVarianceTotal(data)).toBe(20);
  });

  test("bo and balance variances both contribute to the same row's total", () => {
    const data = [makeRecord({ boVariance: 2, balanceVariance: -3 })];
    expect(computeVarianceTotal(data)).toBe(5);
  });
});
