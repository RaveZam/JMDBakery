import { describe, expect, test } from "vitest";
import { getCatalogSummary } from "../helpers/catalogSummary";
import type { Product } from "../types/product-types";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return { id: "p1", name: "Pandesal", price: 10, ...overrides };
}

describe("getCatalogSummary", () => {
  test("reports the count and the cheapest and priciest product", () => {
    const products = [
      makeProduct({ id: "p1", price: 10 }),
      makeProduct({ id: "p2", price: 45 }),
      makeProduct({ id: "p3", price: 30 }),
    ];

    expect(getCatalogSummary(products)).toEqual({
      count: 3,
      minPrice: 10,
      maxPrice: 45,
    });
  });

  test("returns null prices for an empty catalog", () => {
    expect(getCatalogSummary([])).toEqual({
      count: 0,
      minPrice: null,
      maxPrice: null,
    });
  });

  test("uses the same product for min and max when there is only one", () => {
    expect(getCatalogSummary([makeProduct({ price: 25 })])).toEqual({
      count: 1,
      minPrice: 25,
      maxPrice: 25,
    });
  });

  test("handles a catalog where every product costs the same", () => {
    const products = [
      makeProduct({ id: "p1", price: 15 }),
      makeProduct({ id: "p2", price: 15 }),
    ];

    expect(getCatalogSummary(products)).toEqual({
      count: 2,
      minPrice: 15,
      maxPrice: 15,
    });
  });

  test("counts free products rather than treating 0 as missing", () => {
    const products = [
      makeProduct({ id: "p1", price: 0 }),
      makeProduct({ id: "p2", price: 20 }),
    ];

    expect(getCatalogSummary(products)).toEqual({
      count: 2,
      minPrice: 0,
      maxPrice: 20,
    });
  });
});
