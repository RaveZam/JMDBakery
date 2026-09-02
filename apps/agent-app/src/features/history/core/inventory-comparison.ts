export type InventoryComparisonRow = {
  productId: string;
  productName: string;
  start: number;
  sold: number;
  bo: number;
  end: number | null;
  expected: number;
  balance: number;
  variance: number | null;
};

export function buildInventoryComparison(
  morning: { productId: string; productName: string; qty: number }[],
  ending: { productId: string; productName: string; quantity: number }[],
  salesByStore: Record<string, { productId: string; qty: number; boQty: number }[]>,
): InventoryComparisonRow[] {
  const soldByProduct = new Map<string, number>();
  const boByProduct = new Map<string, number>();
  for (const items of Object.values(salesByStore)) {
    for (const it of items) {
      soldByProduct.set(it.productId, (soldByProduct.get(it.productId) ?? 0) + it.qty);
      boByProduct.set(it.productId, (boByProduct.get(it.productId) ?? 0) + it.boQty);
    }
  }

  const names = new Map<string, string>();
  const startByProduct = new Map<string, number>();
  for (const m of morning) {
    names.set(m.productId, m.productName);
    startByProduct.set(m.productId, m.qty);
  }
  const endByProduct = new Map<string, number>();
  for (const e of ending) {
    if (!names.has(e.productId)) names.set(e.productId, e.productName);
    endByProduct.set(e.productId, e.quantity);
  }

  return Array.from(names.keys()).map((productId) => {
    const start = startByProduct.get(productId) ?? 0;
    const sold = soldByProduct.get(productId) ?? 0;
    const bo = boByProduct.get(productId) ?? 0;
    const end = endByProduct.has(productId) ? endByProduct.get(productId)! : null;
    // BO units are not sold and are still on the truck, so they stay in the expected count.
    const expected = start - sold;
    // Balance is the good stock that should be left: remaining minus the BO units.
    const balance = expected - bo;
    const variance = end === null ? null : end - expected;
    return { productId, productName: names.get(productId)!, start, sold, bo, end, expected, balance, variance };
  });
}
