import type { Product, ProductInput } from "../types/product-types";

export function replaceProduct(
  products: Product[],
  id: string,
  input: ProductInput,
): Product[] {
  return products.map((p) => (p.id === id ? { ...p, ...input } : p));
}

export function removeProduct(products: Product[], id: string): Product[] {
  return products.filter((p) => p.id !== id);
}
