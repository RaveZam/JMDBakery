import { describe, expect, test } from "vitest";
import {
  formatSessionDate,
  sumInventory,
  sumSales,
  visitRate,
} from "../helpers/sessionHelpers";
import type { InventorySummaryRow } from "../types/session-types";

describe("formatSessionDate", () => {
  test("renders a plain date as weekday, month, day and year", () => {
    expect(formatSessionDate("2026-07-15")).toBe("Wed, Jul 15, 2026");
  });

  test("reads the date as local time so the day does not shift", () => {
    expect(formatSessionDate("2026-01-01")).toBe("Thu, Jan 1, 2026");
  });
});

describe("visitRate", () => {
  test("returns the visited share as a whole percent", () => {
    expect(visitRate(3, 4)).toBe("75%");
  });

  test("returns 0% when no stores were planned", () => {
    expect(visitRate(0, 0)).toBe("0%");
  });

  test("returns 0% when none of the planned stores were visited", () => {
    expect(visitRate(0, 5)).toBe("0%");
  });

  test("returns 100% when every planned store was visited", () => {
    expect(visitRate(5, 5)).toBe("100%");
  });

  test("rounds to the nearest whole percent", () => {
    expect(visitRate(1, 3)).toBe("33%");
    expect(visitRate(2, 3)).toBe("67%");
  });
});

describe("sumSales", () => {
  test("adds up sold quantity, bad orders and total across sales", () => {
    const sales = [
      { quantitySold: 10, quantityBO: 1, total: 100 },
      { quantitySold: 5, quantityBO: 2, total: 50 },
    ];

    expect(sumSales(sales)).toEqual({
      quantitySold: 15,
      quantityBO: 3,
      total: 150,
    });
  });

  test("returns zeroes when there are no sales", () => {
    expect(sumSales([])).toEqual({ quantitySold: 0, quantityBO: 0, total: 0 });
  });

  test("returns the single sale's figures when there is only one", () => {
    expect(sumSales([{ quantitySold: 7, quantityBO: 1, total: 70 }])).toEqual({
      quantitySold: 7,
      quantityBO: 1,
      total: 70,
    });
  });
});

describe("sumInventory", () => {
  function makeRow(overrides: Partial<InventorySummaryRow> = {}): InventorySummaryRow {
    return {
      productId: "p1",
      productName: "Pandesal",
      morning: 100,
      sold: 60,
      expectedBo: 5,
      endingBo: 5,
      boVariance: 0,
      expectedBalance: 35,
      endingBalance: 35,
      balanceVariance: 0,
      ...overrides,
    };
  }

  test("adds every numeric column across rows", () => {
    const rows = [
      makeRow({
        morning: 100,
        sold: 60,
        expectedBo: 5,
        endingBo: 5,
        boVariance: 0,
        expectedBalance: 35,
        endingBalance: 33,
        balanceVariance: -2,
      }),
      makeRow({
        productId: "p2",
        morning: 50,
        sold: 20,
        expectedBo: 1,
        endingBo: 1,
        boVariance: 0,
        expectedBalance: 29,
        endingBalance: 29,
        balanceVariance: 0,
      }),
    ];

    expect(sumInventory(rows)).toEqual({
      morning: 150,
      sold: 80,
      expectedBo: 6,
      endingBo: 6,
      boVariance: 0,
      expectedBalance: 64,
      endingBalance: 62,
      balanceVariance: -2,
    });
  });

  test("returns zeroes when there are no rows", () => {
    expect(sumInventory([])).toEqual({
      morning: 0,
      sold: 0,
      expectedBo: 0,
      endingBo: 0,
      boVariance: 0,
      expectedBalance: 0,
      endingBalance: 0,
      balanceVariance: 0,
    });
  });

  test("keeps positive and negative variances offsetting each other", () => {
    const rows = [
      makeRow({ productId: "p1", balanceVariance: 5 }),
      makeRow({ productId: "p2", balanceVariance: -5 }),
    ];

    expect(sumInventory(rows).balanceVariance).toBe(0);
  });

  test("drops the product columns from the summed row", () => {
    expect(sumInventory([makeRow()])).not.toHaveProperty("productName");
  });
});
