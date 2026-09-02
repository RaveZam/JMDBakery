import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type { CreditPayment } from "@/app/features/records/types";
import type { DailyTotal } from "../types";

/** Collapses sales into one revenue total per calendar day, sorted ascending.
 * Revenue is on a collected basis: the caller passes cash-only sale rows, and
 * any credit repayments are added on the day they were collected. */
export function toDailyTotals(
  records: SalesRecord[],
  payments: CreditPayment[] = [],
): DailyTotal[] {
  const revenueByDate = new Map<string, number>();
  for (const record of records) {
    revenueByDate.set(
      record.date,
      (revenueByDate.get(record.date) ?? 0) + record.total,
    );
  }
  for (const payment of payments) {
    revenueByDate.set(
      payment.date,
      (revenueByDate.get(payment.date) ?? 0) + payment.amount,
    );
  }
  return [...revenueByDate.entries()]
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
