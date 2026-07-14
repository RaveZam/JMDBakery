export type DataPoint = { label: string; actual?: number; forecast?: number };
export type ForecastRange = "weekly" | "monthly" | "yearly";

export interface ForecastChartData {
  title: string;
  data: DataPoint[];
  forecastStart: string;
  forecastEnd: string;
  yFormatter: (v: number) => string;
}

export type DailySalesPoint = {
  sale_date: string;
  total_sales: number;
  order_count: number;
};
