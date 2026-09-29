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
    paymentType: "cash",
    ...overrides,
  };
}

describe("summarizeSessionSales", () => {
  test("totals cash and credit separately across every sale", () => {
    const summary = summarizeSessionSales([
      sale({ productName: "Pan de Sal", quantitySold: 5, total: 50, paymentType: "cash" }),
      sale({ productName: "Ensaymada", price: 20, quantitySold: 2, total: 40, paymentType: "credit" }),
    ]);

    expect(summary.cashTotal).toBe(50);
    expect(summary.cashPieces).toBe(5);
    expect(summary.creditTotal).toBe(40);
    expect(summary.creditPieces).toBe(2);
  });

  test("groups the same product from different stores into one row", () => {
    const summary = summarizeSessionSales([
      sale({ productName: "Pan de Sal", quantitySold: 5, total: 50 }),
      sale({ productName: "Pan de Sal", quantitySold: 3, total: 30 }),
    ]);

    expect(summary.products).toHaveLength(1);
    expect(summary.products[0]).toMatchObject({
      productName: "Pan de Sal",
      cashPieces: 8,
      cashRevenue: 80,
      creditPieces: 0,
      creditRevenue: 0,
    });
  });

  test("splits the same product into separate rows when the price differs", () => {
    const summary = summarizeSessionSales([
      sale({ productName: "Pan de Sal", price: 10, quantitySold: 5, total: 50 }),
      sale({ productName: "Pan de Sal", price: 12, quantitySold: 2, total: 24 }),
    ]);

    expect(summary.products).toHaveLength(2);
  });

  test("values bad order pieces at price without adding them to a total", () => {
    const summary = summarizeSessionSales([
      sale({ productName: "Pan de Sal", price: 10, quantitySold: 5, quantityBO: 3, total: 50 }),
    ]);

    expect(summary.products[0].boValue).toBe(30);
    expect(summary.piecesBO).toBe(3);
    expect(summary.boValue).toBe(30);
    expect(summary.cashTotal).toBe(50);
  });

  test("product breakdown splits cash and credit revenue per product", () => {
    const summary = summarizeSessionSales([
      sale({ productName: "Ensaymada", price: 20, quantitySold: 1, total: 20, paymentType: "cash" }),
      sale({ productName: "Ensaymada", price: 20, quantitySold: 5, total: 100, paymentType: "credit" }),
    ]);

    expect(summary.products[0].cashPieces).toBe(1);
    expect(summary.products[0].cashRevenue).toBe(20);
    expect(summary.products[0].creditPieces).toBe(5);
    expect(summary.products[0].creditRevenue).toBe(100);
    expect(summary.cashTotal).toBe(20);
    expect(summary.creditTotal).toBe(100);
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
      cashTotal: 0,
      cashPieces: 0,
      creditTotal: 0,
      creditPieces: 0,
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
