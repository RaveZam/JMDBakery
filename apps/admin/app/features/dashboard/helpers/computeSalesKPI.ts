import { excludeCreditSales } from "@/app/server/salesData/excludeCreditSales";
import type {
  SalesKpiRecord,
  StorePaymentRecord,
} from "../types/dashboard-types";

/**
 * Rolls a window of sale lines and credit repayments up into the KPI strip's
 * numbers.
 *
 * Money and units are counted on different bases on purpose. Money is what the
 * business actually took in during the window: cash orders, plus repayments
 * stores made on old credit. Units are every piece that moved, credit orders
 * included, which is what keeps these figures in step with the inventory
 * variance card beside them.
 *
 * @param data - Sale lines already narrowed to the selected date range.
 * @param payments - Credit repayments collected in that same range.
 * @returns Totals plus the two derived rates. `avgPerStore` and `boRate` are
 *          0 when there is nothing to divide by.
 */
export function computeSalesKPI(
  data: SalesKpiRecord[],
  payments: StorePaymentRecord[],
) {
  const cashSales = excludeCreditSales(data).reduce(
    (sum, r) => sum + r.total,
    0,
  );
  const collectedOnCredit = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalSales = cashSales + collectedOnCredit;

  const totalBO = data.reduce((sum, r) => sum + r.boQty, 0);
  const totalSold = data.reduce((sum, r) => sum + r.soldQty, 0);

  // A store that only paid off old credit did no selling, but money did come
  // in from it, so it belongs in the average's denominator.
  const uniqueStores = new Set([
    ...data.map((r) => r.store),
    ...payments.map((p) => p.store),
  ]).size;

  const avgPerStore = uniqueStores > 0 ? totalSales / uniqueStores : 0;
  const boRate = totalSold + totalBO > 0 ? totalBO / (totalSold + totalBO) : 0;
  const finalBboRate = boRate * 100;

  return {
    totalSales,
    totalBO,
    totalSold,
    uniqueStores,
    avgPerStore,
    boRate,
    finalBboRate,
  };
}
