import type { ProductSalesCount } from "./count-sold-by-product";

type StockedItem = { productId: string; qty: number };

/**
 * Used to count remaining inventory based from these args (morning inventory, sold, bo)
 *
 * Morning inventory - Sold - BO = Remaining Inventory which is displayed
 *
 *   Return Example: (Product.id - item quantity)
 *        {
 *            "tasty_bread": 6,
 *            "delicious_cake": 25
 *        }
 *
 *  @param items - Array of stocked items with product ID and quantity
 *  @param salesCounts - Record of product sales counts gotten from @count-sold-by-product
 *  @returns Record of product IDs with their remaining inventory
 *
 */

export function computeRemaining(
  items: StockedItem[],
  salesCounts: Record<string, ProductSalesCount>,
): Record<string, number> {
  return Object.fromEntries(
    //Dont need to manually find and match product id, since mapping them already just matches product id, then subtracts qty from inventory and sold and bo from sales
    items.map((item) => [
      item.productId,
      item.qty -
        (salesCounts[item.productId]?.sold ?? 0) -
        (salesCounts[item.productId]?.bo ?? 0),
    ]),
  );
}
