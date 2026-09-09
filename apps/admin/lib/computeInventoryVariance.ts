/**
 * Single source of truth for the ending-inventory reconciliation formula.
 *
 * Ending inventory is counted as two separate buckets: bad-order units still
 * on the truck (damaged, spoiled, replaced, returned) and the good stock
 * balance. Each gets its own expectation and its own variance, so a BO unit
 * miscounted as good stock shows up instead of cancelling out:
 *
 * - Expected BO is the bad orders already logged in sales.
 * - Expected balance is `morning - sold - backOrder`.
 * - Each variance is how far the physically counted number differs from its
 *   own expectation (positive: more counted than expected, negative: less).
 */
export function computeInventoryVariance(
  morning: number,
  sold: number,
  backOrder: number,
  endingBo: number,
  endingBalance: number,
): {
  expectedBo: number;
  expectedBalance: number;
  boVariance: number;
  balanceVariance: number;
} {
  const expectedBo = backOrder;
  const expectedBalance = morning - sold - backOrder;
  return {
    expectedBo,
    expectedBalance,
    boVariance: endingBo - expectedBo,
    balanceVariance: endingBalance - expectedBalance,
  };
}
