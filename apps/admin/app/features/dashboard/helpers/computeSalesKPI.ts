import type { SalesKpiRecord } from "../types/dashboard-types";

export function computeSalesKPI(data: SalesKpiRecord[]) {
  const totalSales = data.reduce((sum, r) => sum + r.total, 0);
  const totalBO = data.reduce((sum, r) => sum + r.boQty, 0);
  const totalSold = data.reduce((sum, r) => sum + r.soldQty, 0);
  const uniqueStores = new Set(data.map((r) => r.store)).size;
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
