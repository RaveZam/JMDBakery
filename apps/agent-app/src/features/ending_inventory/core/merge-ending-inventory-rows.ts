import type { InventoryItem } from "@/src/lib/dao/session-inventory-dao";
import type { EndingInventoryItem } from "@/src/lib/dao/ending-inventory-dao";
import type { EndingInventoryRow } from "../types/ending-inventory-types";

/**
 * Builds the row list shown on the ending-inventory screen, one row per product
 * loaded that morning, prefilled with either the driver's already-saved count
 * or the system-computed expected count.
 *
 * @param morningItems - Products stocked on the truck at the start of the session
 *                        (from `session_inventory`). Defines which products appear
 *                        and in what order; a product with no morning entry never
 *                        gets a row, even if it has sales or a saved ending count.
 * @param remaining - Map of productId to the expected ending quantity
 *                     (morning stock - sold - back-ordered), e.g. `{ "prod_123": 4 }`.
 *                     Missing entries default to 0.
 * @param saved - Ending-inventory rows already persisted for this session, if the
 *                driver started this screen before (e.g. app was closed mid-count).
 * @returns One `EndingInventoryRow` per morning item, in `morningItems` order:
 *          e.g. `{ id: "abc", productId: "prod_123", productName: "Loaf", expected: 4, quantity: 4 }`.
 *          `id` is undefined for a product with no saved row yet. `quantity` is the
 *          saved count if one exists, otherwise falls back to `expected`.
 */
export function mergeEndingInventoryRows(
  morningItems: InventoryItem[],
  remaining: Record<string, number>,
  saved: EndingInventoryItem[],
): EndingInventoryRow[] {
  // lets us look up "was this product already saved?" by productId instead of scanning the array each time
  const savedByProduct = new Map(saved.map((row) => [row.productId, row]));
  return morningItems.map((item) => {
    // system's computed expected count for this product, e.g. 4
    const expected = remaining[item.productId] ?? 0;
    const savedRow = savedByProduct.get(item.productId);
    return {
      // undefined until this product has actually been saved once
      id: savedRow?.id,
      productId: item.productId,
      productName: item.productName,
      expected,
      // if the driver already saved a count, show that; otherwise default to the expected count
      quantity: savedRow?.quantity ?? expected,
    };
  });
}
