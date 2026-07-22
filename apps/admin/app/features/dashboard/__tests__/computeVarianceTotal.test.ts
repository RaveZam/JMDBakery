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
    ending: 5,
    expected: 5,
    variance: 0,
    ...overrides,
  };
}

describe("computeVarianceTotal", () => {
  test("returns 0 when there is no data", () => {
    expect(computeVarianceTotal([])).toBe(0);
  });

  test("ignores rows where variance is zero", () => {
    const data = [makeRecord(), makeRecord({ productId: "product-2" })];
    expect(computeVarianceTotal(data)).toBe(0);
  });

  test("sums the absolute variance across rows, mixing overages and shortages", () => {
    const data = [
      makeRecord({ productId: "product-1", variance: 0 }),
      makeRecord({ productId: "product-2", variance: 3 }),
      makeRecord({ productId: "product-3", variance: -2 }),
    ];
    expect(computeVarianceTotal(data)).toBe(5);
  });
});
