import type {
  SessionProductSummaryRow,
  SessionSaleRow,
  SessionSalesSummary,
} from "../types/session-types";

function groupByProduct(
  sales: SessionSaleRow[],
): SessionProductSummaryRow[] {
  const byProduct = new Map<string, SessionProductSummaryRow>();

  for (const sale of sales) {
    const key = `${sale.productName}:${sale.price}`;
    const boValue = sale.price * sale.quantityBO;
    const existing = byProduct.get(key);
    if (existing) {
      existing.piecesSold += sale.quantitySold;
      existing.revenue += sale.total;
      existing.piecesBO += sale.quantityBO;
      existing.boValue += boValue;
    } else {
      byProduct.set(key, {
        productName: sale.productName,
        price: sale.price,
        piecesSold: sale.quantitySold,
        revenue: sale.total,
        piecesBO: sale.quantityBO,
        boValue,
      });
    }
  }

  return Array.from(byProduct.values()).sort((a, b) => b.revenue - a.revenue);
}

// A sale never earns revenue for its B.O. pieces -- boValue values them at
// snapshot price only to show what they would have been worth, the same
// convention as get_forecast_weekly_sales.
export function summarizeSessionSales(
  sales: SessionSaleRow[],
): SessionSalesSummary {
  const products = groupByProduct(sales);

  return {
    revenue: products.reduce((sum, p) => sum + p.revenue, 0),
    piecesSold: products.reduce((sum, p) => sum + p.piecesSold, 0),
    boValue: products.reduce((sum, p) => sum + p.boValue, 0),
    piecesBO: products.reduce((sum, p) => sum + p.piecesBO, 0),
    products,
  };
}
