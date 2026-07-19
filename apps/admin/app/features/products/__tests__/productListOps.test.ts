import { describe, expect, test } from "vitest";
import { removeProduct, replaceProduct } from "../helpers/productListOps";
import type { Product } from "../types/product-types";

const pandesal: Product = { id: "p1", name: "Pandesal", price: 10 };
const ensaymada: Product = { id: "p2", name: "Ensaymada", price: 30 };
const catalog = [pandesal, ensaymada];

describe("replaceProduct", () => {
  test("applies the new name and price to the matching product", () => {
    const result = replaceProduct(catalog, "p1", { name: "Pan de Sal", price: 12 });

    expect(result).toEqual([
      { id: "p1", name: "Pan de Sal", price: 12 },
      ensaymada,
    ]);
  });

  test("leaves the list unchanged when no product has that id", () => {
    expect(replaceProduct(catalog, "missing", { name: "X", price: 1 })).toEqual(catalog);
  });

  test("does not mutate the original list", () => {
    replaceProduct(catalog, "p1", { name: "Renamed", price: 99 });

    expect(pandesal).toEqual({ id: "p1", name: "Pandesal", price: 10 });
  });

  test("returns an empty list when given no products", () => {
    expect(replaceProduct([], "p1", { name: "X", price: 1 })).toEqual([]);
  });
});

describe("removeProduct", () => {
  test("drops the product with the given id", () => {
    expect(removeProduct(catalog, "p1")).toEqual([ensaymada]);
  });

  test("leaves the list unchanged when no product has that id", () => {
    expect(removeProduct(catalog, "missing")).toEqual(catalog);
  });

  test("does not mutate the original list", () => {
    removeProduct(catalog, "p1");

    expect(catalog).toHaveLength(2);
  });

  test("returns an empty list when given no products", () => {
    expect(removeProduct([], "p1")).toEqual([]);
  });
});
