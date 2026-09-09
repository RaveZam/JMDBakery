import type { InventoryItem } from "@/src/lib/dao/session-inventory-dao";
import type { EndingInventoryItem } from "@/src/lib/dao/ending-inventory-dao";
import type { ExpectedEnding } from "./compute-expected-ending";
import type { EndingInventoryRow } from "../types/ending-inventory-types";

/**
 * Builds the row list shown on the ending-inventory screen, one row per product
 * loaded that morning, prefilled with either the driver's already-saved counts
 * or the system-computed expected ones.
 *
 * @param morningItems - Products stocked on the truck at the start of the session
 *                        (from `session_inventory`). Defines which products appear
 *                        and in what order; a product with no morning entry never
 *                        gets a row, even if it has sales or a saved ending count.
 * @param expected - Map of productId to the expected ending counts, split into bad
 *                    orders and good stock, e.g. `{ "prod_123": { bo: 2, balance: 4 } }`.
 *                    Missing entries default to zeroes.
 * @param saved - Ending-inventory rows already persisted for this session, if the
 *                driver started this screen before (e.g. app was closed mid-count).
 * @returns One `EndingInventoryRow` per morning item, in `morningItems` order:
 *          e.g. `{ id: "abc", productId: "prod_123", productName: "Loaf",
 *          expectedBo: 2, expectedBalance: 4, endingBo: 2, endingBalance: 4 }`.
 *          `id` is undefined for a product with no saved row yet. The two counts are
 *          the saved ones if a row exists, otherwise they fall back to the expected,
 *          floored at 0 — `expectedBalance` itself is left negative when a product
 *          was oversold, because that's the discrepancy worth seeing.
 */
export function mergeEndingInventoryRows(
  morningItems: InventoryItem[],
  expected: Record<string, ExpectedEnding>,
  saved: EndingInventoryItem[],
): EndingInventoryRow[] {
  // lets us look up "was this product already saved?" by productId instead of scanning the array each time
  const savedByProduct = new Map(saved.map((row) => [row.productId, row]));
  return morningItems.map((item) => {
    // system's computed expected counts for this product, e.g. { bo: 2, balance: 4 }
    const expectedCounts = expected[item.productId] ?? { bo: 0, balance: 0 };
    const savedRow = savedByProduct.get(item.productId);
    return {
      // undefined until this product has actually been saved once
      id: savedRow?.id,
      productId: item.productId,
      productName: item.productName,
      expectedBo: expectedCounts.bo,
      expectedBalance: expectedCounts.balance,
      // if the driver already saved counts, show those; otherwise default to the
      // expected ones — floored at 0, since an oversold product expects a negative
      // balance and no truck holds negative stock
      endingBo: savedRow?.endingBo ?? Math.max(0, expectedCounts.bo),
      endingBalance: savedRow?.endingBalance ?? Math.max(0, expectedCounts.balance),
    };
  });
}
