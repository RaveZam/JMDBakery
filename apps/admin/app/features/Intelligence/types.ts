export type ForecastRange = "weekly" | "monthly" | "yearly";

/** One point on the forecast chart: a period label with an actual value,
 * a forecast value, or both (the seam point carries both). */
export type DataPoint = {
  label: string;
  actual?: number;
  forecast?: number;
};

/** A DataPoint prepared for Recharts. `isSeam` marks the bridged point whose
 * forecast value is a copy of its actual. */
export type ChartPoint = DataPoint & { isSeam?: boolean };

export interface ForecastChartData {
  title: string;
  data: DataPoint[];
  forecastStart: string;
  forecastEnd: string;
  yFormatter: (v: number) => string;
  /** Optional caveat shown under the chart title (e.g. the monthly forecast
   * leaves the in-progress week out of its trend line). */
  note?: string;
}

export type { SalesPoint } from "@/app/server/salesData/getForecastSeries";

/** A single day's revenue, used by the KPI helpers. */
export type DailyTotal = {
  date: string; // YYYY-MM-DD
  revenue: number;
};
