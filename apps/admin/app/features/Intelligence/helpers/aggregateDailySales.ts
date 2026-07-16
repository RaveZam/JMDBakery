import type { SalesRecord } from "@/app/server/getBaseData";
import type { DailySalesPoint } from "../types";

export function aggregateDailySales(records: SalesRecord[]): DailySalesPoint[] {
  const totals = new Map<string, { total_sales: number; order_count: number }>();

  for (const record of records) {
    const existing = totals.get(record.date);
    if (existing) {
      existing.total_sales += record.total;
      existing.order_count += 1;
    } else {
      totals.set(record.date, { total_sales: record.total, order_count: 1 });
    }
  }

  return [...totals.entries()]
    .map(([sale_date, v]) => ({ sale_date, ...v }))
    .sort((a, b) => a.sale_date.localeCompare(b.sale_date));
}
