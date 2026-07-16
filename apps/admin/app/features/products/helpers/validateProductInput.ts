import type { ProductInput } from "../types/product-types";

export function validateProductInput(
  name: string,
  price: string,
): { input: ProductInput } | { error: string } {
  const trimmedName = name.trim();
  const parsedPrice = Number(price);

  if (!trimmedName) {
    return { error: "Name is required." };
  }

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return { error: "Price must be a number greater than or equal to 0." };
  }

  return { input: { name: trimmedName, price: parsedPrice } };
}
