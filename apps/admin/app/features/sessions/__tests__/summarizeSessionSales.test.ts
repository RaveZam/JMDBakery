import { describe, expect, test } from "vitest";
import { summarizeSessionSales } from "../core/summarizeSessionSales";
import type { SessionSaleRow } from "../types/session-types";

function sale(overrides: Partial<SessionSaleRow>): SessionSaleRow {
  return {
    productName: "Pan de Sal",
    price: 10,
    quantitySold: 0,
    quantityBO: 0,
    total: 0,
    ...overrides,
  };
}

describe("summarizeSessionSales", () => {
  test("totals revenue and pieces across every sale", () => {
    const summary = summarizeSessionSales([
      sale({ productName: "Pan de Sal", quantitySold: 5, total: 50 }),
      sale({ productName: "Ensaymada", price: 20, quantitySold: 2, total: 40 }),
    ]);

    expect(summary.revenue).toBe(90);
    expect(summary.piecesSold).toBe(7);
  });

  test("groups the same product from different stores into one row", () => {
    const summary = summarizeSessionSales([
      sale({ productName: "Pan de Sal", quantitySold: 5, total: 50 }),
      sale({ productName: "Pan de Sal", quantitySold: 3, total: 30 }),
    ]);

    expect(summary.products).toHaveLength(1);
    expect(summary.products[0]).toMatchObject({
      productName: "Pan de Sal",
      piecesSold: 8,
      revenue: 80,
    });
  });

  test("splits the same product into separate rows when the price differs", () => {
    const summary = summarizeSessionSales([
      sale({ productName: "Pan de Sal", price: 10, quantitySold: 5, total: 50 }),
      sale({ productName: "Pan de Sal", price: 12, quantitySold: 2, total: 24 }),
    ]);

    expect(summary.products).toHaveLength(2);
  });

  test("values bad order pieces at price without adding them to revenue", () => {
    const summary = summarizeSessionSales([
      sale({ productName: "Pan de Sal", price: 10, quantitySold: 5, quantityBO: 3, total: 50 }),
    ]);

    expect(summary.products[0].boValue).toBe(30);
    expect(summary.piecesBO).toBe(3);
    expect(summary.boValue).toBe(30);
    expect(summary.revenue).toBe(50);
  });

  test("sorts products by revenue, highest first", () => {
    const summary = summarizeSessionSales([
      sale({ productName: "Ensaymada", price: 20, quantitySold: 1, total: 20 }),
      sale({ productName: "Pan de Sal", price: 10, quantitySold: 10, total: 100 }),
      sale({ productName: "Spanish Bread", price: 15, quantitySold: 3, total: 45 }),
    ]);

    expect(summary.products.map((p) => p.productName)).toEqual([
      "Pan de Sal",
      "Spanish Bread",
      "Ensaymada",
    ]);
  });

  test("returns zero totals and no products for an empty session", () => {
    const summary = summarizeSessionSales([]);

    expect(summary).toEqual({
      revenue: 0,
      piecesSold: 0,
      boValue: 0,
      piecesBO: 0,
      products: [],
    });
  });

  test("does not mutate the input", () => {
    const sales = [sale({ quantitySold: 5, total: 50 })];
    const copy = JSON.parse(JSON.stringify(sales));

    summarizeSessionSales(sales);

    expect(sales).toEqual(copy);
  });
});
