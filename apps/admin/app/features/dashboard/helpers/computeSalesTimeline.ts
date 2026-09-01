import { excludeCreditSales } from "@/app/server/salesData/excludeCreditSales";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type {
  FilterRange,
  TimelinePaymentRecord,
} from "../types/dashboard-types";
import { manilaTimestamp } from "@/lib/manilaTimestamp";
import { formatHourLabel } from "./formatHourLabel";
import { formatSalesXLabel } from "./formatSalesXLabel";

//this separates the money per hour, for the single-day view
function bucketByHour(
  cashRows: SalesRecord[],
  payments: TimelinePaymentRecord[],
): { label: string; sales: number }[] {
  const byHour: Record<number, number> = {};

  function add(timestamp: string | null, amount: number): void {
    const hour = manilaTimestamp.hour(timestamp);
    if (hour === null) return;
    byHour[hour] = (byHour[hour] ?? 0) + amount;
  }

  for (const row of cashRows) add(row.createdAt, row.total);
  for (const payment of payments) add(payment.createdAt, payment.amount);

  return Object.keys(byHour)
    .map(Number)
    .sort((a, b) => a - b)
    .map((hour) => ({ label: formatHourLabel(hour), sales: byHour[hour] }));
}

function bucketByDate(
  cashRows: SalesRecord[],
  payments: TimelinePaymentRecord[],
  filter: FilterRange,
): { label: string; sales: number }[] {
  const byDate: Record<string, number> = {};

  for (const row of cashRows) {
    byDate[row.date] = (byDate[row.date] ?? 0) + row.total;
  }
  for (const payment of payments) {
    byDate[payment.date] = (byDate[payment.date] ?? 0) + payment.amount;
  }

  return Object.keys(byDate)
    .sort()
    .map((date) => ({
      label: formatSalesXLabel(date, filter),
      sales: byDate[date],
    }));
}

/**
 * Builds the money-over-time series behind the dashboard's sales chart.
 *
 * Plots the same figure the Total Collected card shows — cash orders plus
 * credit collected — so the chart and the card agree. On the "today" view the
 * series is bucketed by hour, otherwise by day.
 *
 * @param data - Sale lines already narrowed to the selected date range.
 * @param payments - Credit repayments collected in that same range.
 * @param filter - The selected range, which decides hourly vs daily buckets.
 * @returns Points in chart order: ascending by hour, or by date.
 */
export function computeSalesTimeline(
  data: SalesRecord[],
  payments: TimelinePaymentRecord[],
  filter: FilterRange,
): { label: string; sales: number }[] {
  const cashRows = excludeCreditSales(data);

  return filter === "today"
    ? bucketByHour(cashRows, payments)
    : bucketByDate(cashRows, payments, filter);
}
