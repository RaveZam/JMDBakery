export type InventoryComparisonRow = {
  productId: string;
  productName: string;
  start: number;
  sold: number;
  /** Bad orders logged across the route — what the ending BO count should come to. */
  bo: number;
  /** Good stock that should be left: start - sold - bo. */
  balance: number;
  endBo: number | null;
  endBalance: number | null;
  boVariance: number | null;
  balanceVariance: number | null;
};

type SaleLine = { productId: string; qty: number; boQty: number };
type EndingCounts = { bo: number; balance: number };

/** Totals sold and bad-order quantities per product across every store visited. */
function tallySales(salesByStore: Record<string, SaleLine[]>): {
  sold: Map<string, number>;
  bo: Map<string, number>;
} {
  const sold = new Map<string, number>();
  const bo = new Map<string, number>();
  for (const items of Object.values(salesByStore)) {
    for (const line of items) {
      sold.set(line.productId, (sold.get(line.productId) ?? 0) + line.qty);
      bo.set(line.productId, (bo.get(line.productId) ?? 0) + line.boQty);
    }
  }
  return { sold, bo };
}

/** One product's line: what the sales say should be left, against what was counted. */
function toComparisonRow(product: {
  productId: string;
  productName: string;
  start: number;
  sold: number;
  bo: number;
  counted: EndingCounts | null;
}): InventoryComparisonRow {
  // Balance is the good stock that should be left: what wasn't sold, minus the BO units.
  const balance = product.start - product.sold - product.bo;
  const { counted } = product;
  return {
    productId: product.productId,
    productName: product.productName,
    start: product.start,
    sold: product.sold,
    bo: product.bo,
    balance,
    // null means the driver hasn't counted this product yet — different from counting zero.
    endBo: counted ? counted.bo : null,
    endBalance: counted ? counted.balance : null,
    boVariance: counted ? counted.bo - product.bo : null,
    balanceVariance: counted ? counted.balance - balance : null,
  };
}

export function buildInventoryComparison(
  morning: { productId: string; productName: string; qty: number }[],
  ending: {
    productId: string;
    productName: string;
    endingBo: number;
    endingBalance: number;
  }[],
  salesByStore: Record<string, SaleLine[]>,
): InventoryComparisonRow[] {
  const sales = tallySales(salesByStore);

  const names = new Map<string, string>();
  const startByProduct = new Map<string, number>();
  for (const m of morning) {
    names.set(m.productId, m.productName);
    startByProduct.set(m.productId, m.qty);
  }
  const endByProduct = new Map<string, EndingCounts>();
  for (const e of ending) {
    if (!names.has(e.productId)) names.set(e.productId, e.productName);
    endByProduct.set(e.productId, { bo: e.endingBo, balance: e.endingBalance });
  }

  return Array.from(names.keys()).map((productId) =>
    toComparisonRow({
      productId,
      productName: names.get(productId)!,
      start: startByProduct.get(productId) ?? 0,
      sold: sales.sold.get(productId) ?? 0,
      bo: sales.bo.get(productId) ?? 0,
      counted: endByProduct.get(productId) ?? null,
    }),
  );
}
