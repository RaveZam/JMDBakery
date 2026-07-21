import type { LoggedItem } from "../types/store-types";

export type ProductSalesCount = { sold: number; bo: number };

/**
 * Aggregates sold and back-ordered (BO) quantities for each product across raw sales logs.
 *
 * Used to calculate remaining shelf inventory (Initial Stock - Sold - BO).
 *
 * @param items - Array of store transaction logs. Can contain duplicate `productId` entries.
 * @returns A dictionary mapping `productId` to its total aggregated sales metrics:
 *          e.g., { "prod_123": { sold: 5, bo: 2 } }
 */

// Totals each product's sold and BO'ed quantities across a store's sale rows.
export function countSoldByProduct(
  items: LoggedItem[],
): Record<string, ProductSalesCount> {
  //Record holds a string and a object attached to it
  const counts: Record<string, ProductSalesCount> = {};
  for (const item of items) {
    //holds what item, and later on added sold and bo quantities, this builds something like product_id: 12939 : {sold: 5, bo: 2}
    const current = counts[item.productId] ?? { sold: 0, bo: 0 };
    current.sold += item.qty;
    current.bo += item.boQty;

    //sets the current bo and sold into the counts record
    counts[item.productId] = current;
  }

  //returns the counts sold so we can derive it later on for counting stock left
  return counts;
}
