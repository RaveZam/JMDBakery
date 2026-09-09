import type { InventoryComparisonRow } from "./inventory-comparison";

/**
 * True when this product was counted and the count disagrees with what the
 * sales say should be left — on bad orders, on the good balance, or both.
 * A product that hasn't been counted yet never needs attention.
 */
export function inventoryRowNeedsAttention(row: InventoryComparisonRow): boolean {
  if (row.boVariance === null || row.balanceVariance === null) return false;
  return row.boVariance !== 0 || row.balanceVariance !== 0;
}
