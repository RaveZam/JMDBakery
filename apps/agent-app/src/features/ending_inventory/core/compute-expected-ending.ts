import type { ProductSalesCount } from "@/src/features/store/core/count-sold-by-product";

type StockedItem = { productId: string; qty: number };

/**
 * Used to count the expected ending inventory for reconciliation (morning inventory, sold).
 *
 * Morning inventory - Sold = Expected Ending Inventory
 *
 * BO is deliberately not subtracted here. A BO unit (damaged, spoiled, replaced,
 * returned, or lost) was not sold, and in every case but "lost" it is still
 * physically on the truck at the end of the route, so it belongs in the ending
 * count, not the sold count. This is why this is a separate function from
 * `computeRemaining` (store/core/compute-remaining.ts), which subtracts BO
 * because it answers a different question: what's still sellable mid-route.
 *
 *   Return Example: (Product.id -> expected ending quantity)
 *        {
 *            "tasty_bread": 16,
 *            "delicious_cake": 25
 *        }
 *
 *  @param items - Array of stocked items with product ID and quantity
 *  @param salesCounts - Record of product sales counts gotten from @count-sold-by-product
 *  @returns Record of product IDs with their expected ending inventory
 *
 */

export function computeExpectedEnding(
  items: StockedItem[],
  salesCounts: Record<string, ProductSalesCount>,
): Record<string, number> {
  return Object.fromEntries(
    items.map((item) => [
      item.productId,
      item.qty - (salesCounts[item.productId]?.sold ?? 0),
    ]),
  );
}
