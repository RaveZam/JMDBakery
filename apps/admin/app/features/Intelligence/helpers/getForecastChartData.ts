import { ForecastChartData, ForecastRange, DailySalesPoint } from "../types/forecast_types";
import type { SalesRecord } from "@/app/server/getBaseData";
import { forecastNextWeek } from "./forecastNextWeek";
import { forecastNextMonth } from "./forecastNextMonth";
import { forecastNextYear } from "./forecastNextYear";

export function getForecastChartData(
  range: ForecastRange,
  records: SalesRecord[],
  dailySales: DailySalesPoint[],
): ForecastChartData {
  if (range === "monthly") return forecastNextMonth(dailySales);
  if (range === "yearly") return forecastNextYear(dailySales);
  return forecastNextWeek(records);
}
