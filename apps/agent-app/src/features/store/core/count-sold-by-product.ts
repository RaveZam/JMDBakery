import type { LoggedItem } from "../types/store-types";

export type ProductSalesCount = { sold: number; bo: number };

/**
 * Totals sold and bad-order quantities per product across a store's sale rows.
 * Feeds the stock-left math: initial stock - sold - bad order.
 *
 * @param items - Sale log rows; the same productId can appear many times.
 * @returns productId to its totals, e.g. { "prod_123": { sold: 5, bo: 2 } }
 */
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
