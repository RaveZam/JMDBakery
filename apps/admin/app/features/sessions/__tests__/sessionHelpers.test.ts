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
      backOrder: 5,
      expected: 40,
      balance: 35,
      ending: 40,
      variance: 0,
      ...overrides,
    };
  }

  test("adds every numeric column across rows", () => {
    const rows = [
      makeRow({ morning: 100, sold: 60, backOrder: 5, expected: 40, balance: 35, ending: 38, variance: -2 }),
      makeRow({
        productId: "p2",
        morning: 50,
        sold: 20,
        backOrder: 1,
        expected: 30,
        balance: 29,
        ending: 30,
        variance: 0,
      }),
    ];

    expect(sumInventory(rows)).toEqual({
      morning: 150,
      sold: 80,
      backOrder: 6,
      expected: 70,
      balance: 64,
      ending: 68,
      variance: -2,
    });
  });

  test("returns zeroes when there are no rows", () => {
    expect(sumInventory([])).toEqual({
      morning: 0,
      sold: 0,
      backOrder: 0,
      expected: 0,
      balance: 0,
      ending: 0,
      variance: 0,
    });
  });

  test("keeps positive and negative variances offsetting each other", () => {
    const rows = [
      makeRow({ productId: "p1", variance: 5 }),
      makeRow({ productId: "p2", variance: -5 }),
    ];

    expect(sumInventory(rows).variance).toBe(0);
  });

  test("drops the product columns from the summed row", () => {
    expect(sumInventory([makeRow()])).not.toHaveProperty("productName");
  });
});
