import type { SalesRecord } from "@/app/server/getBaseData";

export function computeProvinceRevenue(
  data: SalesRecord[],
): { province: string; revenue: number }[] {
  const totals = new Map<string, number>();
  for (const row of data) {
    if (!row.province) continue;
    totals.set(row.province, (totals.get(row.province) ?? 0) + row.total);
  }

  return [...totals.entries()]
    .map(([province, revenue]) => ({ province, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}
