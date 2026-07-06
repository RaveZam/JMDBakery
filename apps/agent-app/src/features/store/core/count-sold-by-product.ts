import type { LoggedItem } from "../types/store-types";

export type ProductSalesCount = { sold: number; bo: number };

// Totals each product's sold and BO'ed quantities across a store's sale rows.
export function countSoldByProduct(
  items: LoggedItem[],
): Record<string, ProductSalesCount> {
  const counts: Record<string, ProductSalesCount> = {};
  for (const item of items) {
    const current = counts[item.productId] ?? { sold: 0, bo: 0 };
    current.sold += item.qty;
    current.bo += item.boQty;
    counts[item.productId] = current;
  }
  return counts;
}
