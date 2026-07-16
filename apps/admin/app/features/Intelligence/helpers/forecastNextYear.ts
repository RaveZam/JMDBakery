import type { ForecastChartData, DataPoint, DailySalesPoint } from "../types";
import { MONTH_LABELS, nowInManila, addDays } from "./dateUtils";
import { computeForecastBounds } from "./computeForecastBounds";
import { fitHoltWinters, HOLT_WINTERS_MIN_HISTORY } from "./holtWinters";

export function forecastNextYear(dailySales: DailySalesPoint[]): ForecastChartData {
  const title = "Yearly Revenue Forecast (Holt-Winters)";
  const yFormatter = (v: number) => `₱${(v / 1000).toFixed(0)}k`;

  if (dailySales.length < HOLT_WINTERS_MIN_HISTORY) {
    return { title, forecastStart: "", forecastEnd: "", yFormatter, data: [] };
  }

  const now = nowInManila();
  const yearNow = now.getFullYear();
  const cutoffDate = new Date(yearNow, now.getMonth(), now.getDate());

  const actualByMonth = new Map<string, number>();
  for (const point of dailySales) {
    const date = new Date(point.sale_date.split("T")[0]);
    if (date.getFullYear() !== yearNow || date >= cutoffDate) continue;
    const label = MONTH_LABELS[date.getMonth()];
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
    const label = MONTH_LABELS[date.getMonth()];
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
