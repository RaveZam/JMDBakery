export type ForecastRange = "weekly" | "monthly" | "yearly";

/** One point on the forecast chart: a period label with an actual value,
 * a forecast value, or both (the seam point carries both). */
export type DataPoint = {
  label: string;
  actual?: number;
  forecast?: number;
};

export interface ForecastChartData {
  title: string;
  data: DataPoint[];
  forecastStart: string;
  forecastEnd: string;
  yFormatter: (v: number) => string;
}

/** A single day's aggregated revenue + order count, used as input to the
 * monthly/yearly forecast models. */
export type DailySalesPoint = {
  sale_date: string;
  total_sales: number;
  order_count: number;
};

/** A single day's revenue, used by the KPI helpers. */
export type DailyTotal = {
  date: string; // YYYY-MM-DD
  revenue: number;
};
