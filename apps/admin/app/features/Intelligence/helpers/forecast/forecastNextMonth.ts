import { ForecastChartData, DataPoint, DailySalesPoint } from "../../types/forecast_types";
import * as ss from "simple-statistics";
import { MONTH_NAMES } from "../shared/monthNames";
import { phNow } from "../shared/phNow";
import { computeForecastBounds } from "./computeForecastBounds";

const WEEK_START_DAY = [1, 8, 15, 22];

function getWeekOfMonth(day: number): number {
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}
function getWeekStart(date: Date): Date {
  const week = getWeekOfMonth(date.getDate());
  return new Date(date.getFullYear(), date.getMonth(), WEEK_START_DAY[week - 1]);
}

export function forecastNextMonth(dailySales: DailySalesPoint[]): ForecastChartData {
  const weeklyDateForThePastYear: { label: string; actual: number }[] = [];
  const nextMonthForecastData: DataPoint[] = [];
  const offsetDate = phNow();
  offsetDate.setDate(offsetDate.getDate() - 31);
  const startingDate = getWeekStart(offsetDate);
  const now = phNow();
  const cutoffDate = getWeekStart(now);
  const cutoffMonth = cutoffDate.getMonth();
  const nextMonthName = MONTH_NAMES[cutoffMonth];

  for (const record of dailySales ?? []) {
    const date = new Date(record.sale_date.split("T")[0]);
    const day = date.getDate();
    const monthIdx = date.getMonth();
    const monthLabel = MONTH_NAMES[monthIdx];
    const week = getWeekOfMonth(day);
    const label = `${monthLabel} W${week}`;

    if (date < cutoffDate) {
      const existing = weeklyDateForThePastYear.find((w) => w.label === label);
      if (existing) {
        existing.actual += record.total_sales;
      } else {
        weeklyDateForThePastYear.push({ label, actual: record.total_sales });
      }
    }

    if (startingDate < date && date < cutoffDate) {
      const chartExisting = nextMonthForecastData.find(
        (w) => w.label === label,
      );
      if (chartExisting) {
        chartExisting.actual = (chartExisting.actual ?? 0) + record.total_sales;
      } else {
        nextMonthForecastData.push({ label, actual: record.total_sales });
      }
    }
  }

  const points = weeklyDateForThePastYear.map((d, i) => [i, d.actual]);
  const reg = ss.linearRegression(points);
  const line = ss.linearRegressionLine(reg);

  // display the remaining weeks of current month + 1 week into next month as forecast
  const nextWeekStartIndex = weeklyDateForThePastYear.length;
  const currentWeek = getWeekOfMonth(cutoffDate.getDate());
  const followingMonthName = MONTH_NAMES[(cutoffMonth + 1) % 12];
  for (let i = currentWeek; i <= 4; i++) {
    nextMonthForecastData.push({
      label: `${nextMonthName} W${i}`,
      forecast: Math.round(line(nextWeekStartIndex + (i - currentWeek))),
    });
  }
  const weeksForecasted = 4 - currentWeek + 1;
  nextMonthForecastData.push({
    label: `${followingMonthName} W1`,
    forecast: Math.round(line(nextWeekStartIndex + weeksForecasted)),
  });

  const data = nextMonthForecastData.sort(
    (a, b) =>
      MONTH_NAMES.indexOf(a.label.split(" ")[0]) -
        MONTH_NAMES.indexOf(b.label.split(" ")[0]) ||
      a.label.localeCompare(b.label),
  );

  return {
    title: "Next Month Revenue Forecast",
    ...computeForecastBounds(data),
    yFormatter: (v) => `₱${(v / 1000).toFixed(0)}k`,
    data,
  };
}
