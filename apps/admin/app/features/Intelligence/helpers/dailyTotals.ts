import type { SalesRecord } from "@/app/server/getBaseData";
import type { DailyTotal } from "../types";

/** Collapses raw sales records into one revenue total per calendar day, sorted ascending. */
export function toDailyTotals(records: SalesRecord[]): DailyTotal[] {
  const revenueByDate = new Map<string, number>();
  for (const record of records) {
    revenueByDate.set(
      record.date,
      (revenueByDate.get(record.date) ?? 0) + record.total,
    );
  }
  return [...revenueByDate.entries()]
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
