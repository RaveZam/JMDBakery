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
    const isCash = sale.paymentType === "cash";
    const cashPieces = isCash ? sale.quantitySold : 0;
    const cashRevenue = isCash ? sale.total : 0;
    const creditPieces = isCash ? 0 : sale.quantitySold;
    const creditRevenue = isCash ? 0 : sale.total;
    const existing = byProduct.get(key);
    if (existing) {
      existing.cashPieces += cashPieces;
      existing.cashRevenue += cashRevenue;
      existing.creditPieces += creditPieces;
      existing.creditRevenue += creditRevenue;
      existing.piecesBO += sale.quantityBO;
      existing.boValue += boValue;
    } else {
      byProduct.set(key, {
        productName: sale.productName,
        price: sale.price,
        cashPieces,
        cashRevenue,
        creditPieces,
        creditRevenue,
        piecesBO: sale.quantityBO,
        boValue,
      });
    }
  }

  return Array.from(byProduct.values()).sort(
    (a, b) => b.cashRevenue + b.creditRevenue - (a.cashRevenue + a.creditRevenue),
  );
}

// A sale never earns revenue for its B.O. pieces -- boValue values them at
// snapshot price only to show what they would have been worth, the same
// convention as get_forecast_weekly_sales.
export function summarizeSessionSales(
  sales: SessionSaleRow[],
): SessionSalesSummary {
  const products = groupByProduct(sales);
  const cashSales = sales.filter((s) => s.paymentType === "cash");
  const creditSales = sales.filter((s) => s.paymentType === "credit");

  return {
    cashTotal: cashSales.reduce((sum, s) => sum + s.total, 0),
    cashPieces: cashSales.reduce((sum, s) => sum + s.quantitySold, 0),
    creditTotal: creditSales.reduce((sum, s) => sum + s.total, 0),
    creditPieces: creditSales.reduce((sum, s) => sum + s.quantitySold, 0),
    boValue: products.reduce((sum, p) => sum + p.boValue, 0),
    piecesBO: products.reduce((sum, p) => sum + p.piecesBO, 0),
    products,
  };
}
