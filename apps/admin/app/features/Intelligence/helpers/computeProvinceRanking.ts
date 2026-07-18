import type { SalesRecord } from "@/app/server/salesData/getBaseData";

export type ProvinceRevenue = {
  province: string;
  revenue: number;
};

/** Ranks provinces by total revenue, strongest first. */
export function computeProvinceRanking(records: SalesRecord[]): ProvinceRevenue[] {
  const totals = new Map<string, number>();
  for (const record of records) {
    const province = record.province || "Unknown";
    totals.set(province, (totals.get(province) ?? 0) + record.total);
  }

  return Array.from(totals.entries())
    .map(([province, revenue]) => ({ province, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}
