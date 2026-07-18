import { describe, expect, test } from "vitest";
import { computeTopProducts } from "../helpers/computeTopProducts";

describe("computeTopProducts", () => {
  test("accumulates quantity and peso value per product", () => {
    const data = [
      { product: "Pandesal", soldQty: 10, total: 100 },
      { product: "Ensaymada", soldQty: 4, total: 80 },
      { product: "Pandesal", soldQty: 5, total: 50 },
    ];

    expect(computeTopProducts(data)).toEqual([
      { name: "Pandesal", qty: 15, value: 150 },
      { name: "Ensaymada", qty: 4, value: 80 },
    ]);
  });

  test("ranks by quantity sold rather than by peso value", () => {
    const data = [
      { product: "Cheap volume seller", soldQty: 100, total: 100 },
      { product: "Pricey rare cake", soldQty: 2, total: 5000 },
    ];

    expect(computeTopProducts(data)[0].name).toBe("Cheap volume seller");
  });

  test("keeps only the top five products", () => {
    const data = Array.from({ length: 9 }, (_, i) => ({
      product: `Product ${i}`,
      soldQty: i,
      total: i,
    }));

    const top = computeTopProducts(data);

    expect(top).toHaveLength(5);
    expect(top[0].name).toBe("Product 8");
  });

  test("returns an empty list when there are no sales", () => {
    expect(computeTopProducts([])).toEqual([]);
  });
});
