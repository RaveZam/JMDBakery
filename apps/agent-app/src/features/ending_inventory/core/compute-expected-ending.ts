import type { ProductSalesCount } from "@/src/features/store/core/count-sold-by-product";

type StockedItem = { productId: string; qty: number };

export type ExpectedEnding = { bo: number; balance: number };

/**
 * Counts what should be left on the truck per product at the end of the route,
 * split the same way the driver counts it: bad-order units on one side, good
 * stock on the other.
 *
 *   Morning inventory - Sold - BO = Expected Balance
 *   BO logged across the route     = Expected BO
 *
 * The two are kept apart because a BO unit (damaged, spoiled, replaced,
 * returned, or lost) was not sold and is still physically on the truck, but it
 * isn't sellable either. Adding them back together gives the whole-truck count.
 *
 *   Return Example: (Product.id -> expected ending counts)
 *        {
 *            "tasty_bread": { bo: 2, balance: 14 },
 *            "delicious_cake": { bo: 0, balance: 25 }
 *        }
 *
 *  @param items - Array of stocked items with product ID and quantity
 *  @param salesCounts - Record of product sales counts gotten from @count-sold-by-product
 *  @returns Record of product IDs with their expected ending BO and balance
 *
 */

export function computeExpectedEnding(
  items: StockedItem[],
  salesCounts: Record<string, ProductSalesCount>,
): Record<string, ExpectedEnding> {
  return Object.fromEntries(
    items.map((item) => {
      // this product's tallies for the route, e.g. { sold: 180, bo: 10 }
      const counts = salesCounts[item.productId];
      const bo = counts?.bo ?? 0;
      return [
        item.productId,
        // good stock left is what was loaded minus what was sold and minus what went bad
        { bo, balance: item.qty - (counts?.sold ?? 0) - bo },
      ];
    }),
  );
}
