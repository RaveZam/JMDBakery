import type { SalesRecord } from "@/app/server/getBaseData";
import type { FilterRange } from "../types/dashboard-types";
import { formatHourLabel } from "./formatHourLabel";
import { formatSalesXLabel } from "./formatSalesXLabel";

export function computeSalesTimeline(
  data: SalesRecord[],
  filter: FilterRange,
): { label: string; sales: number }[] {
  if (filter === "today") {
    //this separates the sales per hour
    const byHour: Record<number, number> = {};

    for (const row of data) {
      const hour = row.createdAt ? parseInt(row.createdAt.slice(11, 13)) : null;
      if (hour === null) continue;
      byHour[hour] = (byHour[hour] ?? 0) + row.total;
    }
    return Object.keys(byHour)
      .map(Number)
      .sort((a, b) => a - b)
      .map((hour) => ({ label: formatHourLabel(hour), sales: byHour[hour] }));
  }

  const byDate: Record<string, number> = {};
  for (const row of data) {
    byDate[row.date] = (byDate[row.date] ?? 0) + row.total;
  }
  return Object.keys(byDate)
    .sort()
    .map((date) => ({
      label: formatSalesXLabel(date, filter),
      sales: byDate[date],
    }));
}
