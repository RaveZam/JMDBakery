/**
 * Single source of truth for the ending-inventory reconciliation formula.
 *
 * Expected ending stock is `morning - sold`. BO (bad order: damaged, spoiled,
 * replaced, returned, or lost) is deliberately not in the signature — a BO
 * unit was not sold, and in every case but "lost" it is still physically on
 * the truck, so it belongs in the counted ending stock, not subtracted out of
 * what's expected. Variance is how far the physically counted `ending` stock
 * differs from that expectation (positive: more counted than expected,
 * negative: less).
 */
export function computeInventoryVariance(
  morning: number,
  sold: number,
  ending: number,
): { expected: number; variance: number } {
  const expected = morning - sold;
  return { expected, variance: ending - expected };
}
