import type { DailyTotal } from "../types";

/** Average revenue for a given day-of-week (0=Sun..6=Sat), across every
 * occurrence of that weekday present in `dailyTotals`. This is the "moving
 * average" building block shared by the tomorrow/weekly KPIs and the
 * weekly forecast chart mode. */
export function averageRevenueForWeekday(
  dailyTotals: DailyTotal[],
  weekday: number,
): number {
  const matches = dailyTotals.filter(
    (d) => new Date(d.date).getDay() === weekday,
  );
  if (matches.length === 0) return 0;
  const total = matches.reduce((sum, d) => sum + d.revenue, 0);
  return total / matches.length;
}
