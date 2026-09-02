import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type { CreditPayment } from "@/app/features/records/types";
import { excludeCreditSales } from "@/app/server/salesData/excludeCreditSales";

export type ProvinceRevenue = {
  province: string;
  revenue: number;
};

/** Ranks provinces by revenue collected, strongest first: cash orders plus
 * credit repayments. A credit order is not counted until it is paid. */
export function computeProvinceRanking(
  records: SalesRecord[],
  payments: CreditPayment[] = [],
): ProvinceRevenue[] {
  const totals = new Map<string, number>();
  for (const record of excludeCreditSales(records)) {
    const province = record.province || "Unknown";
    totals.set(province, (totals.get(province) ?? 0) + record.total);
  }
  for (const payment of payments) {
    const province = payment.province || "Unknown";
    totals.set(province, (totals.get(province) ?? 0) + payment.amount);
  }

  return Array.from(totals.entries())
    .map(([province, revenue]) => ({ province, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}
