import type { LucideIcon } from "lucide-react";

export type ForecastRange = "weekly" | "monthly" | "yearly";

/** One point on the forecast chart: a period label with actual sales/BO
 * figures, forecast figures, or both (the seam point carries both). Amount
 * is pesos, units is piece count -- both are always present on an actual
 * point; the display toggle picks which pair the chart reads. */
export type DataPoint = {
  label: string;
  salesAmount?: number;
  salesUnits?: number;
  boAmount?: number;
  boUnits?: number;
  forecast?: number;
  boForecast?: number;
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

export type { ForecastData } from "@/app/server/salesData/getForecastSeries";

/** A single day's revenue, used by the KPI helpers. */
export type DailyTotal = {
  date: string; // YYYY-MM-DD
  revenue: number;
};

export type BadOrderRiskTone = "healthy" | "medium" | "warning" | "critical";

export type BadOrderRisk = {
  tone: BadOrderRiskTone;
  label: string;
  icon: LucideIcon;
};

export type IntelligenceKpis = {
  revenueToday: number;
  revenueYesterday: number;
  revenueChangePct: number;
  revenueThisMonth: number;
  badOrderRatePct: number;
  badOrderRisk: BadOrderRisk;
  totalBadOrderQty: number;
  totalBadOrderAmount: number;
};
