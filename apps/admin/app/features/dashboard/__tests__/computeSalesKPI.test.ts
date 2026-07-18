import { describe, expect, test } from "vitest";
import { computeSalesKPI } from "../helpers/computeSalesKPI";
import type { SalesKpiRecord } from "../types/dashboard-types";

function makeRecord(overrides: Partial<SalesKpiRecord> = {}): SalesKpiRecord {
  return { store: "Store A", total: 100, soldQty: 10, boQty: 0, ...overrides };
}

describe("computeSalesKPI", () => {
  test("sums totals and counts distinct stores across rows", () => {
    const data = [
      makeRecord({ store: "Store A", total: 100, soldQty: 10, boQty: 2 }),
      makeRecord({ store: "Store A", total: 50, soldQty: 5, boQty: 0 }),
      makeRecord({ store: "Store B", total: 150, soldQty: 15, boQty: 3 }),
    ];

    const kpi = computeSalesKPI(data);

    expect(kpi.totalSales).toBe(300);
    expect(kpi.totalSold).toBe(30);
    expect(kpi.totalBO).toBe(5);
    expect(kpi.uniqueStores).toBe(2);
  });

  test("averages sales across distinct stores, not across rows", () => {
    const data = [
      makeRecord({ store: "Store A", total: 100 }),
      makeRecord({ store: "Store A", total: 100 }),
      makeRecord({ store: "Store B", total: 200 }),
    ];

    // 400 total over 2 stores = 200, not 400 over 3 rows
    expect(computeSalesKPI(data).avgPerStore).toBe(200);
  });

  test("expresses BO rate as a share of all units handled", () => {
    const data = [makeRecord({ soldQty: 75, boQty: 25 })];

    const kpi = computeSalesKPI(data);

    expect(kpi.boRate).toBe(0.25);
    expect(kpi.finalBboRate).toBe(25);
  });

  test("returns zeroes for an empty dataset without dividing by zero", () => {
    const kpi = computeSalesKPI([]);

    expect(kpi).toEqual({
      totalSales: 0,
      totalBO: 0,
      totalSold: 0,
      uniqueStores: 0,
      avgPerStore: 0,
      boRate: 0,
      finalBboRate: 0,
    });
  });

  test("keeps BO rate at zero when no units moved at all", () => {
    const data = [makeRecord({ total: 0, soldQty: 0, boQty: 0 })];

    expect(computeSalesKPI(data).boRate).toBe(0);
  });

  test("reports a full BO rate when nothing sold", () => {
    const data = [makeRecord({ soldQty: 0, boQty: 8 })];

    expect(computeSalesKPI(data).finalBboRate).toBe(100);
  });
});
