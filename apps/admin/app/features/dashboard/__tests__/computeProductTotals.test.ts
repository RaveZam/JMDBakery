import { describe, expect, test } from "vitest";
import { computeProductTotals } from "../helpers/computeProductTotals";

describe("computeProductTotals", () => {
  test("accumulates sold and bad-order quantities per product", () => {
    const data = [
      { product: "Pandesal", soldQty: 10, boQty: 1 },
      { product: "Ensaymada", soldQty: 4, boQty: 0 },
      { product: "Pandesal", soldQty: 5, boQty: 2 },
    ];

    expect(computeProductTotals(data)).toEqual([
      { product: "Pandesal", sold: 15, bo: 3 },
      { product: "Ensaymada", sold: 4, bo: 0 },
    ]);
  });

  test("orders products by units sold, highest first", () => {
    const data = [
      { product: "Slow", soldQty: 1, boQty: 50 },
      { product: "Fast", soldQty: 90, boQty: 0 },
    ];

    expect(computeProductTotals(data).map((p) => p.product)).toEqual([
      "Fast",
      "Slow",
    ]);
  });

  test("keeps only the top five products", () => {
    const data = Array.from({ length: 7 }, (_, i) => ({
      product: `Product ${i}`,
      soldQty: i,
      boQty: 0,
    }));

    expect(computeProductTotals(data)).toHaveLength(5);
  });

  test("returns an empty list when there are no records", () => {
    expect(computeProductTotals([])).toEqual([]);
  });

  test("keeps a product that only ever came back as bad orders", () => {
    const data = [{ product: "Spoiled batch", soldQty: 0, boQty: 12 }];

    expect(computeProductTotals(data)).toEqual([
      { product: "Spoiled batch", sold: 0, bo: 12 },
    ]);
  });
});
