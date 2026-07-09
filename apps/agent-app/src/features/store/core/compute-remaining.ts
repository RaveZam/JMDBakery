import type { ProductSalesCount } from "./count-sold-by-product";

type StockedItem = { productId: string; qty: number };

// Remaining stock per product: morning qty minus what's already sold or
// marked bad-order today — both leave the truck's usable stock.
export function computeRemaining(
  items: StockedItem[],
  salesCounts: Record<string, ProductSalesCount>,
): Record<string, number> {
  return Object.fromEntries(
    items.map((item) => [
      item.productId,
      item.qty -
        (salesCounts[item.productId]?.sold ?? 0) -
        (salesCounts[item.productId]?.bo ?? 0),
    ]),
  );
}
