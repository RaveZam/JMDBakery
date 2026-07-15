import { ForecastChartData, DataPoint, DailySalesPoint } from "../../types/forecast_types";
import { MONTH_NAMES } from "../shared/monthNames";
import { phNow } from "../shared/phNow";
import { computeForecastBounds } from "./computeForecastBounds";
import { fitHoltWinters, HOLT_WINTERS_MIN_POINTS } from "./holtWintersFit";

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function forecastNextYear(dailySales: DailySalesPoint[]): ForecastChartData {
  const title = "Yearly Revenue Forecast (Holt-Winters)";
  const yFormatter = (v: number) => `₱${(v / 1000).toFixed(0)}k`;

  if (dailySales.length < HOLT_WINTERS_MIN_POINTS) {
    return { title, forecastStart: "", forecastEnd: "", yFormatter, data: [] };
  }

  const now = phNow();
  const yearNow = now.getFullYear();
  const cutoffDate = new Date(yearNow, now.getMonth(), now.getDate());

  const actualByMonth = new Map<string, number>();
  for (const point of dailySales) {
    const date = new Date(point.sale_date.split("T")[0]);
    if (date.getFullYear() !== yearNow || date >= cutoffDate) continue;
    const label = MONTH_NAMES[date.getMonth()];
    actualByMonth.set(label, (actualByMonth.get(label) ?? 0) + point.total_sales);
  }

  const forecastFn = fitHoltWinters(dailySales.map((d) => d.total_sales));
  const lastDate = new Date(
    dailySales[dailySales.length - 1].sale_date.split("T")[0],
  );
  const endOfYear = new Date(yearNow, 11, 31);
  const daysToForecast = Math.max(
    1,
    Math.round((endOfYear.getTime() - lastDate.getTime()) / 86_400_000),
  );

  const forecastByMonth = new Map<string, number>();
  for (let h = 1; h <= daysToForecast; h++) {
    const date = addDays(lastDate, h);
    if (date.getFullYear() !== yearNow) break;
    const label = MONTH_NAMES[date.getMonth()];
    forecastByMonth.set(label, (forecastByMonth.get(label) ?? 0) + forecastFn(h));
  }

  const orderedLabels = [
    ...new Set([...actualByMonth.keys(), ...forecastByMonth.keys()]),
  ];
  const data: DataPoint[] = orderedLabels.map((label) => ({
    label,
    actual: actualByMonth.get(label),
    forecast: forecastByMonth.has(label)
      ? Math.round(forecastByMonth.get(label)!)
      : undefined,
  }));

  return { title, ...computeForecastBounds(data), yFormatter, data };
}
